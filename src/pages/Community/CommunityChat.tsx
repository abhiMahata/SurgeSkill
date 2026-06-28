import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';

function isFirebaseReady() {
  try { return (db as any)._databaseId?.projectId !== 'YOUR_PROJECT'; } catch { return false; }
}

/** Strip HTML tags to prevent XSS from chat messages */
function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

type ActiveTab = 'chat' | 'events';

export const CommunityChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, communities, joinCommunity, leaveCommunity, events, createEvent, showToast } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [joining, setJoining]   = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [showEventForm, setShowEventForm] = useState(false);

  // Event form state
  const [evTitle, setEvTitle]   = useState('');
  const [evDate, setEvDate]     = useState('');
  const [evVenue, setEvVenue]   = useState('');
  const [evDesc, setEvDesc]     = useState('');
  const [evCap, setEvCap]       = useState('50');

  const endRef  = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fbReady = isFirebaseReady();

  const community = communities.find(c => c.id === id);

  // Check membership from live communities list (optimistic update happens in context)
  const isMember = !!(community?.memberIds?.includes(currentUser?.id || ''));

  // Community events (scoped by communityId)
  const communityEvents = events.filter(e => e.communityId === id);

  // Load messages
  useEffect(() => {
    if (!id) return;
    if (fbReady) {
      const q = query(collection(db, 'communities', id, 'messages'), orderBy('timestamp', 'asc'), limit(200));
      const unsub = onSnapshot(q, snap => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      });
      return unsub;
    } else {
      const stored = localStorage.getItem(`ss_chat_${id}`);
      if (stored) setMessages(JSON.parse(stored));
    }
  }, [id, fbReady]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleJoin = async () => {
    if (!id || joining) return;
    setJoining(true);
    await joinCommunity(id);
    setJoining(false);
    showToast(`Joined ${community?.name || 'community'}!`);
  };

  const sendMessage = useCallback(async (text: string, mediaBase64?: string, mediaType?: string) => {
    if (!currentUser || !id || (!text.trim() && !mediaBase64)) return;
    setSending(true);
    const safeText = sanitizeText(text.trim());
    const msg: Omit<ChatMessage, 'id'> = {
      communityId: id, senderId: currentUser.id, senderName: sanitizeText(currentUser.name),
      senderPhoto: currentUser.photoURL, text: safeText,
      mediaBase64, mediaType, timestamp: Date.now(),
    };
    if (fbReady) {
      try {
        await addDoc(collection(db, 'communities', id, 'messages'), msg);
      } catch {
        const local = [...messages, { ...msg, id: `msg-${Date.now()}` }];
        setMessages(local as ChatMessage[]);
        localStorage.setItem(`ss_chat_${id}`, JSON.stringify(local));
      }
    } else {
      const local = [...messages, { ...msg, id: `msg-${Date.now()}` }];
      setMessages(local as ChatMessage[]);
      localStorage.setItem(`ss_chat_${id}`, JSON.stringify(local));
    }
    setInput('');
    setSending(false);
  }, [currentUser, id, fbReady, messages]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert('Image must be under 500 KB.'); return; }
    const reader = new FileReader();
    reader.onload = () => sendMessage('', reader.result as string, file.type);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle || !evDate) return;
    await createEvent({
      title: evTitle, date: evDate, venue: evVenue || 'Online',
      description: evDesc, capacity: parseInt(evCap) || 50,
      price: 'Free', image: '', type: 'Community Event',
      communityId: id,
    });
    showToast(`Event "${evTitle}" created!`);
    setEvTitle(''); setEvDate(''); setEvVenue(''); setEvDesc(''); setEvCap('50');
    setShowEventForm(false);
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach(m => {
    const d = formatDate(m.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else grouped.push({ date: d, msgs: [m] });
  });

  const iStyle: React.CSSProperties = {
    width: '100%', padding: '8px 11px', fontSize: 14,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  };

  if (!community) {
    return (
      <div style={{ maxWidth: 800, padding: 40, textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)' }}>group_off</span>
        <h2 style={{ marginTop: 12 }}>Community not found</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/communities')} style={{ marginTop: 16 }}>
          Back to Communities
        </button>
      </div>
    );
  }

  const gradBg = community.type === 'college'
    ? 'linear-gradient(135deg, var(--blue), var(--purple))'
    : 'linear-gradient(135deg, var(--green), var(--blue))';

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', marginBottom: 0, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/communities')} style={{ padding: '4px 8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: gradBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>
            {community.type === 'college' ? 'school' : 'groups'}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{community.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{community.memberIds?.length || 0} members</div>
        </div>
        <span className={`badge ${community.type === 'college' ? 'badge-blue' : 'badge-green'}`}>{community.type}</span>
        {isMember && (
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', fontSize: 12 }}
            onClick={() => { leaveCommunity(id!); showToast('Left community'); navigate('/communities'); }}>
            Leave
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {(['chat', 'events'] as ActiveTab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '10px 20px', fontSize: 13.5, fontWeight: 600, background: 'none', border: 'none',
            cursor: 'pointer', color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === t ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 120ms', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {t === 'chat' ? 'forum' : 'event'}
            </span>
            {t === 'chat' ? 'Group Chat' : 'Events'}
            {t === 'events' && communityEvents.length > 0 && (
              <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 99, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
                {communityEvents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ─────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>forum</span>
                {isMember ? 'No messages yet. Start the conversation!' : 'Join this community to see and send messages.'}
              </div>
            )}
            {grouped.map(g => (
              <React.Fragment key={g.date}>
                <div style={{ textAlign: 'center', margin: '12px 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {g.date}
                </div>
                {g.msgs.map(m => {
                  const isMe = m.senderId === currentUser?.id;
                  const initial = m.senderName?.charAt(0)?.toUpperCase() || '?';
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row', marginBottom: 6, padding: '0 4px' }}>
                      {!isMe && (
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#fff' }}>
                          {initial}
                        </div>
                      )}
                      <div style={{ maxWidth: '70%' }}>
                        {!isMe && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2, marginLeft: 2 }}>{m.senderName}</div>}
                        <div style={{
                          padding: m.mediaBase64 ? '4px' : '9px 13px', fontSize: 13.5, lineHeight: 1.5,
                          borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          background: isMe ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg)',
                          color: isMe ? '#fff' : 'var(--text-primary)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          wordBreak: 'break-word', boxShadow: 'var(--shadow-sm)',
                        }}>
                          {m.mediaBase64 && <img src={m.mediaBase64} alt="shared" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, display: 'block', marginBottom: m.text ? 6 : 0 }} />}
                          {m.text && <span dangerouslySetInnerHTML={{ __html: m.text }} />}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                          <span>{formatTime(m.timestamp)}</span>
                          {(isMe || currentUser?.role === 'admin') && (
                            <button
                              title="Delete message"
                              onClick={async () => {
                                if (fbReady) {
                                  try { await deleteDoc(doc(db, 'communities', id!, 'messages', m.id)); } catch {}
                                } else {
                                  const updated = messages.filter(x => x.id !== m.id);
                                  setMessages(updated);
                                  localStorage.setItem(`ss_chat_${id}`, JSON.stringify(updated));
                                }
                              }}
                              style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input / Join prompt */}
          {isMember ? (
            <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <button className="btn-icon" onClick={() => fileRef.current?.click()} title="Share image" style={{ flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>image</span>
              </button>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Type a message…" disabled={sending}
                style={{ flex: 1, padding: '9px 14px', fontSize: 13.5, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
              />
              <button className="btn btn-primary" onClick={() => sendMessage(input)} disabled={sending || !input.trim()} style={{ flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>send</span>
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                Join this community to participate in the group chat.
              </p>
              <button className="btn btn-primary" onClick={handleJoin} disabled={joining}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                {joining ? 'Joining…' : 'Join Community'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── EVENTS TAB ───────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Community Events</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upcoming events for this community</div>
            </div>
            {currentUser?.role === 'admin' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowEventForm(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
                Add Event
              </button>
            )}
          </div>

          {communityEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>event_busy</span>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No events yet</div>
              <div style={{ fontSize: 13 }}>
                {currentUser?.role === 'admin' ? 'Create the first event for this community.' : 'Check back soon for upcoming events.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {communityEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(ev => {
                  const isPast = new Date(ev.date) < new Date();
                  return (
                    <div key={ev.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: isPast ? 'var(--bg)' : gradBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: isPast ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: isPast ? 'var(--text-muted)' : '#fff', lineHeight: 1 }}>
                          {new Date(ev.date).getDate()}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: isPast ? 'var(--text-muted)' : 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
                          {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{ev.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>pin_drop</span>
                            {ev.venue}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>group</span>
                            {ev.registrationsCount}/{ev.capacity}
                          </span>
                        </div>
                        {ev.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{ev.description}</div>}
                      </div>
                      <span className={`badge ${isPast ? 'badge-gray' : 'badge-green'}`}>{isPast ? 'Past' : 'Upcoming'}</span>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Admin event creation form */}
          {showEventForm && (
            <div className="overlay" onClick={() => setShowEventForm(false)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Create Community Event</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>This event will appear under {community.name}.</p>
                  <form onSubmit={handleCreateEvent}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="form-group"><label className="form-label">Event Title *</label><input style={iStyle} value={evTitle} onChange={e => setEvTitle(e.target.value)} required /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group"><label className="form-label">Date *</label><input style={iStyle} type="datetime-local" value={evDate} onChange={e => setEvDate(e.target.value)} required /></div>
                        <div className="form-group"><label className="form-label">Capacity</label><input style={iStyle} type="number" value={evCap} onChange={e => setEvCap(e.target.value)} min={1} /></div>
                      </div>
                      <div className="form-group"><label className="form-label">Venue</label><input style={iStyle} value={evVenue} onChange={e => setEvVenue(e.target.value)} placeholder="Online / Room 101" /></div>
                      <div className="form-group"><label className="form-label">Description</label><textarea rows={3} style={{ ...iStyle, resize: 'vertical' } as any} value={evDesc} onChange={e => setEvDesc(e.target.value)} /></div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowEventForm(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Event</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
