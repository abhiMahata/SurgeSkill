import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const levelColor: Record<string, string> = {
  Beginner:     '#10b981',
  Intermediate: '#f59e0b',
  Advanced:     '#ef4444',
};

// Deterministic color from string — no Math.random()
function seedColor(str: string): string {
  const palette = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#3b82f6,#06b6d4)',
    'linear-gradient(135deg,#10b981,#3b82f6)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#10b981)',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export const UserDashboard: React.FC = () => {
  const { currentUser, events, courses, communities, toggleCourseEnrollment, toggleEventRegistration, showToast, myMemberships, memberCounts, myEventRegistrations } = useApp();
  const navigate = useNavigate();

  const enrolledIds   = currentUser?.enrolledCourses    ?? [];

  const joinedCommIds = Object.keys(myMemberships).filter(id => myMemberships[id].status === 'ACTIVE');

  const myCourses  = courses.filter(c => enrolledIds.includes(c.id));
  const myComms    = communities.filter(c => joinedCommIds.includes(c.id));
  const myEvents   = events.filter(e => myEventRegistrations.includes(e.id));

  // Only show events that haven't passed yet, sorted by date
  const upcomingEvs = events
    .filter(e => e.startsAt >= Date.now() && e.status !== 'COMPLETED' && e.status !== 'CANCELLED')
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(0, 4);

  // Courses not yet enrolled in — only real ones from DB
  const browseCourses = courses
    .filter(c => !enrolledIds.includes(c.id) && c.status === 'Active')
    .slice(0, 3);

  const roleBadgeColor = currentUser?.role === 'mentor'
    ? 'linear-gradient(135deg,#8b5cf6,#6366f1)'
    : 'linear-gradient(135deg,#3b82f6,#06b6d4)';

  return (
    <div style={{ maxWidth: 1080 }}>
      {/* ── Welcome header ─────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Welcome back, {currentUser?.name?.split(' ')[0]} 👋
            </h1>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
              background: roleBadgeColor, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {currentUser?.role}
            </span>
          </div>
          <p className="page-desc">
            {currentUser?.college ? `${currentUser.college}` : 'SurgeSkill Community'}
            {currentUser?.city ? ` · ${currentUser.city}` : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/explore')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>travel_explore</span>
          Explore
        </button>
      </div>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <div className="stat-strip" style={{ marginBottom: 24 }}>
        <div className="stat-cell">
          <div className="stat-label">Courses Enrolled</div>
          <div className="stat-value">{myCourses.length}</div>
          <div className="stat-sub">active courses</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Communities</div>
          <div className="stat-value">{myComms.length}</div>
          <div className="stat-sub">groups joined</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Events</div>
          <div className="stat-value">{myEvents.length}</div>
          <div className="stat-sub">registered</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value">{upcomingEvs.length}</div>
          <div className="stat-sub">events on platform</div>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>

        {/* Left: My Courses */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">My Courses</div>
              <div className="card-subtitle">{myCourses.length} enrolled</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')}>
              Browse
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </button>
          </div>

          {myCourses.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">school</span>
              <div className="empty-title">No courses yet</div>
              <div className="empty-desc">
                Courses are created by mentors in your community.<br />
                Check Explore to see what's available.
              </div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/explore')}>
                Go to Explore
              </button>
            </div>
          ) : (
            <div>
              {myCourses.map(c => (
                <div key={c.id} className="event-row" style={{ cursor: 'default' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                    background: seedColor(c.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>menu_book</span>
                  </div>
                  <div className="event-info">
                    <div className="event-title">{c.title}</div>
                    <div className="event-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>person</span>
                        {c.mentor}
                      </span>
                      <span style={{ color: 'var(--border-strong)' }}>·</span>
                      <span style={{ color: levelColor[c.level] ?? 'var(--text-muted)', fontWeight: 600 }}>{c.level}</span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                      }}>
                        In Progress
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--red)', fontSize: 12 }}
                    onClick={() => { toggleCourseEnrollment(c.id); showToast(`Unenrolled from "${c.title}"`); }}
                  >
                    Drop
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: My Communities + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* My Communities */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Communities</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/communities')}>
                All
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </button>
            </div>
            {myComms.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  You haven't joined any communities yet.
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/communities')}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>groups</span>
                  Browse Communities
                </button>
              </div>
            ) : (
              <div>
                {myComms.slice(0, 4).map(c => (
                  <div
                    key={c.id}
                    style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                    onClick={() => navigate(`/communities/${c.id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--radius-md)', flexShrink: 0,
                        background: seedColor(c.id),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#fff' }}>
                          {c.type === 'college' ? 'school' : 'groups'}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{memberCounts[c.id] || 0} members</div>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--text-muted)' }}>chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><div className="card-title">Quick Actions</div></div>
            <div style={{ padding: '8px' }}>
              {[
                { icon: 'travel_explore', label: 'Explore All',    path: '/explore' },
                { icon: 'groups',         label: 'Communities',    path: '/communities' },
                { icon: 'calendar_today', label: 'My Calendar',    path: '/calendar' },
                { icon: 'settings',       label: 'Edit Profile',   path: '/profile' },
              ].map(a => (
                <button
                  key={a.path}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 10px', fontSize: 13.5 }}
                  onClick={() => navigate(a.path)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Upcoming Events ─────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Upcoming Events</div>
            <div className="card-subtitle">Events created by the community</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')}>See all</button>
        </div>
        {upcomingEvs.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px' }}>
            <span className="material-symbols-outlined empty-icon" style={{ fontSize: 36 }}>event_available</span>
            <div className="empty-title">No upcoming events yet</div>
            <div className="empty-desc">
              Events are created by community admins.<br />
              Join a community and ask your admin to create one!
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/communities')}>
              Browse Communities
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0 }}>
            {upcomingEvs.map((ev, i) => {
              const isReg = myEventRegistrations.includes(ev.id);
              const d = new Date(ev.startsAt);
              return (
                <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} style={{ padding: '14px 16px', borderRight: i < upcomingEvs.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 'var(--radius-md)', flexShrink: 0,
                      background: seedColor(ev.id),
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{d.getDate()}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
                        {d.toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ev.location}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{ev.scope}</span>
                    <button
                      className={`btn btn-sm ${isReg ? 'btn-ghost' : 'btn-primary'}`}
                      style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        const r = await toggleEventRegistration(ev.id);
                        if (r.success) showToast(r.registered ? `Registered for "${ev.title}"` : `Left "${ev.title}"`);
                      }}
                    >
                      {isReg ? 'Registered ✓' : 'Register'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Browse Courses (only if courses actually exist) ──────── */}
      {browseCourses.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Courses Available</div>
              <div className="card-subtitle">Created by mentors on SurgeSkill</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')}>See all</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {browseCourses.map((c, i) => (
              <div key={c.id} style={{ padding: '16px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                    background: seedColor(c.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>menu_book</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.category}</div>
                    <div style={{ fontSize: 10, color: levelColor[c.level], fontWeight: 600 }}>{c.level}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>person</span>
                  {c.mentor}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.price}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 12 }}
                    onClick={() => { toggleCourseEnrollment(c.id); showToast(`Enrolled in "${c.title}"`); }}
                  >
                    Enroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
