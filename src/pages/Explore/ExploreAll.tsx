import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem, Hackathon, Course } from '../../types';

type Tab = 'events' | 'hackathons' | 'courses';

const statusBadge = (s: string) => {
  const m: Record<string, string> = { Confirmed: 'badge badge-green', Completed: 'badge badge-gray', Draft: 'badge badge-amber', Cancelled: 'badge badge-red', Upcoming: 'badge badge-blue', Live: 'badge badge-green', Active: 'badge badge-green' };
  return m[s] ?? 'badge badge-gray';
};

export const ExploreAll: React.FC = () => {
  const { currentUser, events, hackathons, courses, toggleEventRegistration, toggleHackathonRegistration, toggleCourseEnrollment, showToast } = useApp();
  const [tab, setTab] = useState<Tab>('events');
  const [q, setQ] = useState('');

  const regEvents = currentUser?.registeredEvents ?? [];
  const regHacks = currentUser?.registeredHackathons ?? [];
  const enCourses = currentUser?.enrolledCourses ?? [];

  const TABS: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: 'events', label: 'Events', icon: 'event', count: events.length },
    { key: 'hackathons', label: 'Hackathons', icon: 'code', count: hackathons.length },
    { key: 'courses', label: 'Courses', icon: 'school', count: courses.length },
  ];

  return (
    <div style={{ maxWidth: 940 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore</h1>
          <p className="page-desc">Discover events, hackathons, and courses from the SurgeSkill community.</p>
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
            <span style={{ fontSize: 11, background: tab === t.key ? 'var(--accent)' : 'var(--bg)', color: tab === t.key ? '#fff' : 'var(--text-muted)', padding: '1px 7px', borderRadius: 99, fontWeight: 600 }}>{t.count}</span>
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

      {/* Events Tab */}
      {tab === 'events' && (() => {
        const filtered = events.filter(e => !q || e.title.toLowerCase().includes(q.toLowerCase()) || e.venue.toLowerCase().includes(q.toLowerCase()));
        return filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><span className="material-symbols-outlined empty-icon">search_off</span><div className="empty-title">No events found</div></div></div>
        ) : (
          <div className="card">
            {filtered.map((ev, idx) => {
              const isReg = regEvents.includes(ev.id);
              const spots = Math.max(0, ev.capacity - ev.registrationsCount);
              const canToggle = ev.status !== 'Completed' && ev.status !== 'Cancelled';
              return (
                <div key={ev.id} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start', background: isReg ? 'rgba(37,99,235,0.02)' : 'transparent' }}>
                  <img src={ev.image} alt={ev.title} style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</span>
                      {isReg && <span className="badge badge-blue">Registered</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <span><span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>calendar_today</span>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span><span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>pin_drop</span>{ev.venue}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={statusBadge(ev.status)}>{ev.status}</span>
                      <span className="badge badge-gray">{ev.type}</span>
                      <span style={{ fontSize: 12, color: spots === 0 ? 'var(--red)' : 'var(--text-muted)' }}>{spots > 0 ? `${spots} spots left` : 'Full'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.price}</span>
                    {canToggle ? (
                      <button className={`btn btn-sm ${isReg ? 'btn-danger' : 'btn-primary'}`} onClick={() => { const r = toggleEventRegistration(ev.id); if (r.success) showToast(r.registered ? `Registered for "${ev.title}"` : `Left "${ev.title}"`); }}>
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

      {/* Hackathons Tab */}
      {tab === 'hackathons' && (() => {
        const filtered = hackathons.filter(h => !q || h.title.toLowerCase().includes(q.toLowerCase()));
        return filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><span className="material-symbols-outlined empty-icon">search_off</span><div className="empty-title">No hackathons found</div></div></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(h => {
              const isReg = regHacks.includes(h.id);
              return (
                <div key={h.id} className="card" style={{ overflow: 'hidden' }}>
                  <img src={h.image} alt={h.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <span className={statusBadge(h.status)}>{h.status}</span>
                      <span className="badge badge-gray">{h.mode}</span>
                      {isReg && <span className="badge badge-blue">Registered</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>{h.title}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{h.description}</p>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                      <span><span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>calendar_today</span>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(h.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span><span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>group</span>Team: {h.teamSizeMin}–{h.teamSizeMax} members</span>
                      <span><span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>emoji_events</span>Prizes: {h.prizes.join(', ')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.registrationsCount}/{h.capacity} registered</span>
                      {h.status !== 'Completed' ? (
                        <button className={`btn btn-sm ${isReg ? 'btn-danger' : 'btn-primary'}`} onClick={() => { const r = toggleHackathonRegistration(h.id); if (r.success) showToast(r.registered ? `Registered for "${h.title}"` : `Left "${h.title}"`); }}>
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

      {/* Courses Tab */}
      {tab === 'courses' && (() => {
        const filtered = courses.filter(c => !q || c.title.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase()));
        return filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><span className="material-symbols-outlined empty-icon">search_off</span><div className="empty-title">No courses found</div></div></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(c => {
              const isEn = enCourses.includes(c.id);
              const levelColor = c.level === 'Beginner' ? 'badge-green' : c.level === 'Intermediate' ? 'badge-amber' : 'badge-purple';
              return (
                <div key={c.id} className="card" style={{ overflow: 'hidden' }}>
                  <img src={c.image} alt={c.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <span className={`badge ${levelColor}`}>{c.level}</span>
                      <span className="badge badge-gray">{c.category}</span>
                      {isEn && <span className="badge badge-blue">Enrolled</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>{c.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>by {c.mentor} · {c.duration}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{c.price}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{c.enrolledCount}/{c.capacity} enrolled</span>
                      </div>
                      {c.status === 'Active' ? (
                        <button className={`btn btn-sm ${isEn ? 'btn-danger' : 'btn-primary'}`} onClick={() => { const r = toggleCourseEnrollment(c.id); if (r.success) showToast(r.enrolled ? `Enrolled in "${c.title}"` : `Left "${c.title}"`); }}>
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
