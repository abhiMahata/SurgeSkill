import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { GlobalSearchResults } from '../../types';

type Tab = 'communities' | 'users' | 'events' | 'posts';

// Deterministic gradient from a string
function seedColor(str: string): string {
  const palette = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#3b82f6,#06b6d4)',
    'linear-gradient(135deg,#10b981,#3b82f6)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#10b981)',
    'linear-gradient(135deg,#ef4444,#f97316)',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

const EmptyContent: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="card">
    <div className="empty-state" style={{ padding: '48px 24px' }}>
      <span className="material-symbols-outlined empty-icon" style={{ fontSize: 40 }}>{icon}</span>
      <div className="empty-title">{title}</div>
      <div className="empty-desc" style={{ maxWidth: 360, textAlign: 'center' }}>{desc}</div>
    </div>
  </div>
);

export const ExploreAll: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, myEventRegistrations, globalSearch } = useApp();
  
  const [tab, setTab] = useState<Tab>('communities');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GlobalSearchResults>({ communities: [], users: [], events: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults({ communities: [], users: [], events: [], posts: [] });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const tId = setTimeout(async () => {
      const res = await globalSearch(q);
      
      // Sorting per requirements
      res.communities.sort((a, b) => a.name.localeCompare(b.name));
      res.users.sort((a, b) => a.displayName.localeCompare(b.displayName));
      res.events.sort((a, b) => a.startsAt - b.startsAt);
      res.posts.sort((a, b) => b.createdAt - a.createdAt);
      
      setResults(res);
      setLoading(false);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(tId);
  }, [q, globalSearch]);

  const TABS: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'communities', label: 'Communities', icon: 'groups',       count: results.communities.length },
    { key: 'users',       label: 'Users',       icon: 'person',       count: results.users.length },
    { key: 'events',      label: 'Events',      icon: 'event',        count: results.events.length },
    { key: 'posts',       label: 'Posts',       icon: 'chat_bubble',  count: results.posts.length },
  ];

  return (
    <div style={{ maxWidth: 940 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Search Hub</h1>
          <p className="page-desc">
            Search for communities, users, events, and posts in your college.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px', fontSize: 13.5, fontWeight: tab === t.key ? 600 : 500,
              color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 120ms',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{t.icon}</span>
            {t.label}
            {q.trim() && (
              <span style={{
                fontSize: 11, background: tab === t.key ? 'var(--accent)' : 'var(--bg)',
                color: tab === t.key ? '#fff' : 'var(--text-muted)',
                padding: '1px 7px', borderRadius: 99, fontWeight: 600,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div className="search-wrap" style={{ maxWidth: 400, flex: 1 }}>
          <span className="material-symbols-outlined ms" style={{ fontSize: 16 }}>search</span>
          <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${tab} (incremental)...`} />
        </div>
        {loading && <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>Searching...</div>}
      </div>

      {!q.trim() && (
        <EmptyContent icon="search" title="Search SurgeSkill" desc="Type above to search your college network." />
      )}

      {/* ── Communities Tab ── */}
      {q.trim() && tab === 'communities' && (() => {
        if (results.communities.length === 0 && !loading) return (
          <EmptyContent icon="groups" title="No matching communities" desc={`No communities match "${q}".`} />
        );
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {results.communities.map(c => (
              <div key={c.id} className="card hoverable" onClick={() => navigate(`/communities/${c.id}`)} style={{ cursor: 'pointer', display: 'flex', gap: 12, padding: 16 }}>
                <img src={c.imageUrl || 'https://via.placeholder.com/60'} alt="" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }} className="truncate">{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.memberCount} members • {c.category}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Users Tab ── */}
      {q.trim() && tab === 'users' && (() => {
        if (results.users.length === 0 && !loading) return (
          <EmptyContent icon="person" title="No matching users" desc={`No users match "${q}". Friend Codes must match exactly.`} />
        );
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {results.users.map(u => (
              <div key={u.id} className="card" style={{ display: 'flex', gap: 12, padding: 16, alignItems: 'center' }}>
                <img src={u.avatarUrl || 'https://via.placeholder.com/48'} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="truncate">{u.displayName}</span>
                    {q.trim().toUpperCase() === u.friendCode?.toUpperCase() && (
                      <span className="badge badge-green" style={{ fontSize: 10 }}>Friend Code Match</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{u.course} • {u.year}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Events Tab ── */}
      {q.trim() && tab === 'events' && (() => {
        if (results.events.length === 0 && !loading) return (
          <EmptyContent icon="event" title="No matching events" desc={`No events match "${q}".`} />
        );
        return (
          <div className="card">
            {results.events.map((ev, idx) => {
              const isReg = myEventRegistrations.includes(ev.id);
              const d = new Date(ev.startsAt);
              return (
                <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} style={{
                  display: 'flex', gap: 14, padding: '16px 20px',
                  borderBottom: idx < results.events.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start', cursor: 'pointer',
                  background: isReg ? 'rgba(37,99,235,0.02)' : 'transparent',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-md)', flexShrink: 0,
                    background: seedColor(ev.id),
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
                      {d.toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</span>
                      {isReg && <span className="badge badge-blue">Registered</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <span><span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>calendar_today</span>{d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span><span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>location_on</span>{ev.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── Posts Tab ── */}
      {q.trim() && tab === 'posts' && (() => {
        if (results.posts.length === 0 && !loading) return (
          <EmptyContent icon="chat_bubble" title="No matching posts" desc={`No posts match "${q}".`} />
        );
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {results.posts.map(p => (
              <div key={p.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Posted • {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: p.attachments?.length ? 12 : 0 }}>
                  {p.content}
                </div>
                {p.attachments && p.attachments.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {p.attachments.map(att => (
                      <div key={att.storagePath} style={{ padding: '6px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }}>
                        Attachment: {att.fileName}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.likeCount} Likes</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.commentCount} Comments</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
      
    </div>
  );
};
