import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

type Tab = 'events' | 'hackathons' | 'courses';

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Confirmed: 'badge badge-green', Completed: 'badge badge-gray',
    Draft: 'badge badge-amber', Cancelled: 'badge badge-red',
    Upcoming: 'badge badge-blue', Live: 'badge badge-green', Active: 'badge badge-green',
  };
  return m[s] ?? 'badge badge-gray';
};

// Deterministic gradient from a string — no random, no Math.random()
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

const levelColor: Record<string, string> = {
  Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444',
};

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
  const {
    currentUser, events, hackathons, courses,
    toggleEventRegistration, toggleHackathonRegistration, toggleCourseEnrollment, showToast,
  } = useApp();
  const [tab, setTab] = useState<Tab>('events');
  const [q, setQ] = useState('');

  const regEvents  = currentUser?.registeredEvents   ?? [];
  const regHacks   = currentUser?.registeredHackathons ?? [];
  const enCourses  = currentUser?.enrolledCourses    ?? [];

  const TABS: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'events',     label: 'Events',     icon: 'event',  count: events.length },
    { key: 'hackathons', label: 'Hackathons', icon: 'code',   count: hackathons.length },
    { key: 'courses',    label: 'Courses',    icon: 'school', count: courses.length },
  ];

  return (
    <div style={{ maxWidth: 940 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore</h1>
          <p className="page-desc">
            Discover events, hackathons, and courses created by the SurgeSkill community.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setQ(''); }}
            style={{
              padding: '10px 18px', fontSize: 13.5, fontWeight: tab === t.key ? 600 : 500,
              color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 120ms',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{t.icon}</span>
            {t.label}
            <span style={{
              fontSize: 11, background: tab === t.key ? 'var(--accent)' : 'var(--bg)',
              color: tab === t.key ? '#fff' : 'var(--text-muted)',
              padding: '1px 7px', borderRadius: 99, fontWeight: 600,
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div className="search-wrap" style={{ maxWidth: 340 }}>
          <span className="material-symbols-outlined ms" style={{ fontSize: 16 }}>search</span>
          <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${tab}…`} />
        </div>
      </div>

      {/* ── Events Tab ── */}
      {tab === 'events' && (() => {
        const filtered = events.filter(e =>
          !q || e.title.toLowerCase().includes(q.toLowerCase()) || e.venue.toLowerCase().includes(q.toLowerCase())
        );
        if (filtered.length === 0) return (
          <EmptyContent
            icon="event"
            title={q ? 'No matching events' : 'No events yet'}
            desc={q
              ? `No events match "${q}". Try a different search.`
              : 'Events are created by community admins. Join a community and ask your admin to create events for your group.'}
          />
        );
        return (
          <div className="card">
            {filtered.map((ev, idx) => {
              const isReg = regEvents.includes(ev.id);
              const spots = Math.max(0, ev.capacity - ev.registrationsCount);
              const canToggle = ev.status !== 'Completed' && ev.status !== 'Cancelled';
              const d = new Date(ev.date);
              return (
                <div key={ev.id} style={{
                  display: 'flex', gap: 14, padding: '16px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start',
                  background: isReg ? 'rgba(37,99,235,0.02)' : 'transparent',
                }}>
                  {/* Date icon block — no image, purely from data */}
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
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>calendar_today</span>
                        {d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>pin_drop</span>
                        {ev.venue}
                      </span>
                    </div>
                    {ev.description && (
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {ev.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={statusBadge(ev.status)}>{ev.status}</span>
                      <span className="badge badge-gray">{ev.type}</span>
                      <span style={{ fontSize: 12, color: spots === 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                        {spots > 0 ? `${spots} spots left` : 'Full'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.price}</span>
                    {canToggle ? (
                      <button
                        className={`btn btn-sm ${isReg ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => { const r = toggleEventRegistration(ev.id); if (r.success) showToast(r.registered ? `Registered for "${ev.title}"` : `Left "${ev.title}"`); }}
                      >
                        {isReg ? 'Leave' : 'Register'}
                      </button>
                    ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Closed</span>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── Hackathons Tab ── */}
      {tab === 'hackathons' && (() => {
        const filtered = hackathons.filter(h => !q || h.title.toLowerCase().includes(q.toLowerCase()));
        if (filtered.length === 0) return (
          <EmptyContent
            icon="code"
            title={q ? 'No matching hackathons' : 'No hackathons yet'}
            desc={q
              ? `No hackathons match "${q}".`
              : 'Hackathons are organized by community admins. They\'ll appear here once published.'}
          />
        );
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(h => {
              const isReg = regHacks.includes(h.id);
              return (
                <div key={h.id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Color header block instead of image */}
                  <div style={{
                    height: 100, background: seedColor(h.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'rgba(255,255,255,0.9)' }}>code</span>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <span className={statusBadge(h.status)}>{h.status}</span>
                      <span className="badge badge-gray">{h.mode}</span>
                      {isReg && <span className="badge badge-blue">Registered</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>{h.title}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{h.description}</p>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>calendar_today</span>
                        {new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(h.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>group</span>
                        Team: {h.teamSizeMin}–{h.teamSizeMax} members
                      </span>
                      {h.prizes?.length > 0 && (
                        <span>
                          <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>emoji_events</span>
                          Prizes: {h.prizes.join(', ')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.registrationsCount}/{h.capacity} registered</span>
                      {h.status !== 'Completed' ? (
                        <button
                          className={`btn btn-sm ${isReg ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => { const r = toggleHackathonRegistration(h.id); if (r.success) showToast(r.registered ? `Registered for "${h.title}"` : `Left "${h.title}"`); }}
                        >
                          {isReg ? 'Leave' : 'Register'}
                        </button>
                      ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ended</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── Courses Tab ── */}
      {tab === 'courses' && (() => {
        const filtered = courses.filter(c =>
          !q || c.title.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase())
        );
        if (filtered.length === 0) return (
          <EmptyContent
            icon="school"
            title={q ? 'No matching courses' : 'No courses yet'}
            desc={q
              ? `No courses match "${q}".`
              : 'Courses are created and taught by mentors on SurgeSkill. They\'ll appear here once published.'}
          />
        );
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(c => {
              const isEn = enCourses.includes(c.id);
              const levelCls = c.level === 'Beginner' ? 'badge-green' : c.level === 'Intermediate' ? 'badge-amber' : 'badge-purple';
              return (
                <div key={c.id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Color header block instead of image */}
                  <div style={{
                    height: 100, background: seedColor(c.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'rgba(255,255,255,0.9)' }}>menu_book</span>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <span className={`badge ${levelCls}`}>{c.level}</span>
                      <span className="badge badge-gray">{c.category}</span>
                      {isEn && <span className="badge badge-blue">Enrolled</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>{c.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>
                      by {c.mentor} · {c.duration}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{c.price}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{c.enrolledCount}/{c.capacity} enrolled</span>
                      </div>
                      {c.status === 'Active' ? (
                        <button
                          className={`btn btn-sm ${isEn ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => { const r = toggleCourseEnrollment(c.id); if (r.success) showToast(r.enrolled ? `Enrolled in "${c.title}"` : `Left "${c.title}"`); }}
                        >
                          {isEn ? 'Leave' : 'Enroll'}
                        </button>
                      ) : <span className={statusBadge(c.status)}>{c.status}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};
