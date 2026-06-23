import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { EventItem, Course, Hackathon } from '../../types';

function useCountdown(dateStr: string) {
  const [diff, setDiff] = useState(new Date(dateStr).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(dateStr).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [dateStr]);
  const total = Math.max(0, diff);
  const d = Math.floor(total / 86400000);
  const h = Math.floor((total % 86400000) / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { d, h, m, s };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Confirmed: 'badge badge-green',
    Completed: 'badge badge-gray',
    Draft:     'badge badge-amber',
    Cancelled: 'badge badge-red',
  };
  return map[s] ?? 'badge badge-gray';
};

export const UserDashboard: React.FC = () => {
  const { currentUser, events, courses, hackathons, toggleEventRegistration, showToast } = useApp();
  const navigate = useNavigate();

  const regIds = currentUser?.registeredEvents ?? [];
  const enCourseIds = currentUser?.enrolledCourses ?? [];
  const regHackIds = currentUser?.registeredHackathons ?? [];
  const myEvents = events.filter((e: EventItem) => regIds.includes(e.id));
  const myCourses = courses.filter((c: Course) => enCourseIds.includes(c.id));
  const myHacks = hackathons.filter((h: Hackathon) => regHackIds.includes(h.id));

  const regIds = currentUser?.registeredEvents ?? [];
  const myEvents = events.filter((e: EventItem) => regIds.includes(e.id));
  const upcoming = myEvents.filter((e: EventItem) => new Date(e.date) > new Date() && e.status !== 'Completed' && e.status !== 'Cancelled');
  const completed = myEvents.filter((e: EventItem) => e.status === 'Completed' || new Date(e.date) < new Date());
  const nextEvent = upcoming.sort((a: EventItem, b: EventItem) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const { d, h, m, s } = useCountdown(nextEvent?.date ?? new Date().toISOString());

  const handleToggle = (id: string, title: string) => {
    const r = toggleEventRegistration(id);
    if (r.success) showToast(r.registered ? `Registered for "${title}"` : `Left "${title}"`);
  };

  return (
    <div style={{ maxWidth: 1060 }}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Dashboard</h1>
          <p className="page-desc">Welcome back, {currentUser?.name?.split(' ')[0]}. Here's your event overview.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/explore')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>travel_explore</span>
          Browse events
        </button>
      </div>

      {/* Stats strip */}
      <div className="stat-strip">
        <div className="stat-cell">
          <div className="stat-label">Registered</div>
          <div className="stat-value">{regIds.length}</div>
          <div className="stat-sub">total events</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-sub">scheduled ahead</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completed.length}</div>
          <div className="stat-sub">events attended</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Courses</div>
          <div className="stat-value">{myCourses.length}</div>
          <div className="stat-sub">enrolled</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Hackathons</div>
          <div className="stat-value">{myHacks.length}</div>
          <div className="stat-sub">registered</div>
        </div>
      </div>

      {/* Countdown + grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div>
          {/* Next event countdown */}
          {nextEvent && (
            <div className="countdown-box" style={{ marginBottom: 20 }}>
              <div className="countdown-label">Next registered event</div>
              <div className="countdown-event">{nextEvent.title}</div>
              <div className="countdown-venue">
                <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 4 }}>pin_drop</span>
                {nextEvent.venue}
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[[d, 'Days'], [h, 'Hours'], [m, 'Min'], [s, 'Sec']].map(([val, lbl]) => (
                  <div key={String(lbl)}>
                    <div className="countdown-timer">{pad(Number(val))}</div>
                    <div className="countdown-timer-label">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My registered events */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">My Events</div>
                <div className="card-subtitle">{myEvents.length} events registered</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/calendar')}>
                View calendar
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </button>
            </div>

            {myEvents.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined empty-icon">event_busy</span>
                <div className="empty-title">No events yet</div>
                <div className="empty-desc">Browse events and register for upcoming sessions.</div>
              </div>
            ) : (
              <div>
                {myEvents.map((ev: EventItem) => (
                  <div key={ev.id} className="event-row">
                    <img src={ev.image} alt={ev.title} className="event-thumb" />
                    <div className="event-info">
                      <div className="event-title">{ev.title}</div>
                      <div className="event-meta">
                        <span>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span style={{ color: 'var(--border-strong)' }}>·</span>
                        <span className="truncate" style={{ maxWidth: 160 }}>{ev.venue}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={statusBadge(ev.status)}>{ev.status}</span>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{ev.price}</span>
                      {ev.status === 'Confirmed' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--red)', fontSize: 12 }}
                          onClick={() => handleToggle(ev.id, ev.title)}
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
            </div>
            <div style={{ padding: '8px' }}>
              {[
                { icon: 'travel_explore', label: 'Explore All',      path: '/explore' },
                { icon: 'groups',         label: 'Communities',     path: '/communities' },
                { icon: 'calendar_today', label: 'My Calendar',      path: '/calendar' },
                { icon: 'auto_awesome',   label: 'Ask Nexus AI',     path: '/nexus' },
                { icon: 'settings',       label: 'Edit Profile',     path: '/profile' },
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

          {/* Suggested events */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Suggested</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')}>See all</button>
            </div>
            <div>
              {events
                .filter((e: EventItem) => !regIds.includes(e.id) && e.status === 'Confirmed')
                .slice(0, 3)
                .map((ev: EventItem) => (
                  <div
                    key={ev.id}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                    onClick={() => navigate('/explore')}
                  >
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                      <span>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>·</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{ev.price}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
