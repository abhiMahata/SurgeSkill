import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';

function isFirebaseReady() {
  try { return (db as any)._databaseId?.projectId !== 'YOUR_PROJECT'; } catch { return false; }
}

export const CommunityChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, communities } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fbReady = isFirebaseReady();

  const community = communities.find(c => c.id === id);
  const isMember = community?.memberIds?.includes(currentUser?.id || '');

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
      // localStorage fallback
      const stored = localStorage.getItem(`ss_chat_${id}`);
      if (stored) setMessages(JSON.parse(stored));
    }
  }, [id, fbReady]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async (text: string, mediaBase64?: string, mediaType?: string) => {
    if (!currentUser || !id || (!text.trim() && !mediaBase64)) return;
    setSending(true);
    const msg: Omit<ChatMessage, 'id'> = {
      communityId: id, senderId: currentUser.id, senderName: currentUser.name,
      senderPhoto: currentUser.photoURL, text: text.trim(),
      mediaBase64, mediaType, timestamp: Date.now(),
    };
    if (fbReady) {
      await addDoc(collection(db, 'communities', id, 'messages'), msg);
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
    if (file.size > 500 * 1024) { alert('Image must be under 500KB (Spark plan limit).'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      sendMessage('', reader.result as string, file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

  if (!community) {
    return (
      <div style={{ maxWidth: 800, padding: 40, textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)' }}>group_off</span>
        <h2 style={{ marginTop: 12 }}>Community not found</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/communities')} style={{ marginTop: 16 }}>Back to Communities</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', marginBottom: 0, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/communities')} style={{ padding: '4px 8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        </button>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: community.type === 'college' ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'linear-gradient(135deg, var(--green), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>{community.type === 'college' ? 'school' : 'groups'}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{community.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{community.memberIds?.length || 0} members</div>
        </div>
        <span className={`badge ${community.type === 'college' ? 'badge-blue' : 'badge-green'}`}>{community.type}</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>forum</span>
            No messages yet. Start the conversation!
          </div>
        )}
        {grouped.map(g => (
          <React.Fragment key={g.date}>
            <div style={{ textAlign: 'center', margin: '12px 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{g.date}</div>
            {g.msgs.map(m => {
              const isMe = m.senderId === currentUser?.id;
              return (
                <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row', marginBottom: 6, padding: '0 4px' }}>
                  {!isMe && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {m.senderName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div style={{ maxWidth: '70%' }}>
                    {!isMe && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2, marginLeft: 2 }}>{m.senderName}</div>}
                    <div style={{
                      padding: m.mediaBase64 ? '4px' : '8px 12px', fontSize: 13.5, lineHeight: 1.5,
                      borderRadius: isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                      background: isMe ? 'var(--accent)' : 'var(--bg)',
                      color: isMe ? '#fff' : 'var(--text-primary)',
                      border: isMe ? 'none' : '1px solid var(--border)',
                      wordBreak: 'break-word',
                    }}>
                      {m.mediaBase64 && (
                        <img src={m.mediaBase64} alt="shared" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, display: 'block', marginBottom: m.text ? 6 : 0 }} />
                      )}
                      {m.text && <span>{m.text}</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textAlign: isMe ? 'right' : 'left', marginLeft: 2, marginRight: 2 }}>{formatTime(m.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
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
        <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
          Join this community to send messages.
        </div>
      )}
    </div>
  );
};
