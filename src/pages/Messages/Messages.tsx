import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { db, storage } from '../../firebase';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Conversation, ConversationMessage, AppUser } from '../../types';

export const Messages: React.FC = () => {
  const { 
    currentUser, conversations, friendships, blocks,
    sendDirectMessage, markConversationRead, showToast
  } = useApp();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, AppUser>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  // Fetch participant profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      const neededIds = new Set<string>();
      conversations.forEach(c => {
        c.participantIds.forEach(id => {
          if (id !== currentUser?.id && !participantProfiles[id]) neededIds.add(id);
        });
      });
      if (neededIds.size === 0) return;
      const newProfiles = { ...participantProfiles };
      for (const id of neededIds) {
        try {
          const snap = await getDoc(doc(db, 'users', id));
          if (snap.exists()) newProfiles[id] = { id: snap.id, ...snap.data() } as AppUser;
        } catch (e) {}
      }
      setParticipantProfiles(newProfiles);
    };
    fetchProfiles();
  }, [conversations, currentUser?.id, participantProfiles]);

  // Messages listener for active conversation
  useEffect(() => {
    if (!activeConvId || !currentUser) return;
    const q = query(collection(db, 'conversations', activeConvId, 'messages'));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ConversationMessage))
        .sort((a, b) => a.createdAt - b.createdAt);
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
      
      // Mark read
      markConversationRead(activeConvId.replace(currentUser.id, '').replace('_', ''));
    });
    return () => unsub();
  }, [activeConvId, currentUser]);

  if (!currentUser) return null;

  const handleSend = async (e: React.FormEvent, file?: File) => {
    e?.preventDefault();
    if (!activeConv || (!messageInput.trim() && !file)) return;
    setSending(true);

    const targetId = activeConv.participantIds.find(id => id !== currentUser.id)!;

    // Check if blocked
    const pairId = activeConv.id;
    const isBlocked = blocks.some(b => b.id === pairId);
    const isFriend = friendships.some(f => f.id === pairId && f.status === 'ACTIVE');

    if (isBlocked) {
      showToast('You cannot message this user.');
      setSending(false);
      return;
    }
    if (!isFriend) {
      showToast('You can only message active friends.');
      setSending(false);
      return;
    }

    try {
      const attachments = [];
      if (file) {
        const storageRef = ref(storage, `conversations/${pairId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        attachments.push({
          storagePath: storageRef.fullPath,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          url
        });
      }
      await sendDirectMessage(targetId, messageInput, attachments);
      setMessageInput('');
    } catch (e) {
      showToast('Failed to send message.');
    }
    setSending(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File must be under 2 MB.'); return; }
    handleSend(null as any, file);
    e.target.value = '';
  };

  // Derive unread count
  const unreadCounts = conversations.reduce((acc, c) => {
    if (c.lastMessageSenderId === currentUser.id) { acc[c.id] = 0; return acc; }
    const myLastRead = c.readState?.[currentUser.id] || 0;
    acc[c.id] = c.lastMessageAt > myLastRead ? 1 : 0; // simple boolean indicator for MVP
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--surface)' }}>
      {/* Sidebar: Conversation List */}
      <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No conversations yet. Add a friend to start chatting!</div>
          ) : (
            conversations.map(c => {
              const targetId = c.participantIds.find(id => id !== currentUser.id)!;
              const profile = participantProfiles[targetId];
              const isUnread = unreadCounts[c.id] > 0;
              return (
                <div 
                  key={c.id} 
                  onClick={() => setActiveConvId(c.id)}
                  style={{ 
                    padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    background: activeConvId === c.id ? 'var(--bg)' : 'transparent',
                    borderBottom: '1px solid var(--border)', transition: 'background 0.2s'
                  }}
                >
                  <img src={profile?.photoURL || 'https://via.placeholder.com/40'} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: isUnread ? 700 : 500, color: 'var(--text-primary)' }}>{profile?.name || targetId}</div>
                      <div style={{ fontSize: 11, color: isUnread ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: isUnread ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isUnread ? 500 : 400 }}>
                      {c.lastMessageSenderId === currentUser.id ? 'You: ' : ''}{c.lastMessageText}
                    </div>
                  </div>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {participantProfiles[activeConv.participantIds.find(id => id !== currentUser.id)!]?.name || 'Unknown User'}
              </div>
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ 
                      padding: '10px 14px', borderRadius: 16, 
                      background: isMe ? 'var(--primary)' : 'var(--bg)', 
                      color: isMe ? '#fff' : 'var(--text-primary)',
                      borderBottomRightRadius: isMe ? 4 : 16, borderBottomLeftRadius: isMe ? 16 : 4
                    }}>
                      {m.attachments?.map((a, i) => (
                        <img key={i} src={a.url} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: m.content ? 8 : 0, display: 'block' }} />
                      ))}
                      {m.content && <div style={{ fontSize: 14, wordBreak: 'break-word' }}>{m.content}</div>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                <label className="btn" style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>image</span>
                  <input type="file" hidden accept="image/*" onChange={handleFile} disabled={sending} />
                </label>
                <input 
                  type="text" 
                  value={messageInput} 
                  onChange={e => setMessageInput(e.target.value)} 
                  placeholder="Type a message..." 
                  disabled={sending}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || (!messageInput.trim())} style={{ borderRadius: 20, padding: '10px 20px' }}>
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
