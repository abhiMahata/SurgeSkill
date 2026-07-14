import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { EventItem, Hackathon, Course, ActivityLog, Community } from '../../types';

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Confirmed: 'badge badge-green', Completed: 'badge badge-gray',
    Draft: 'badge badge-amber',     Cancelled: 'badge badge-red',
    Upcoming: 'badge badge-blue',   Live: 'badge badge-green',
    Active: 'badge badge-green',
  };
  return m[s] ?? 'badge badge-gray';
};

export const AdminDashboard: React.FC = () => {
  const { currentUser, events, hackathons, courses, communities, activities, deleteCommunity, showToast, memberCounts } = useApp() as any;
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'overview' | 'communities' | 'events' | 'activity'>('overview');

  const totalEventRegs   = events.reduce((s: number, e: EventItem)     => s + e.registrationsCount, 0);
  const totalHackRegs    = hackathons.reduce((s: number, h: Hackathon)  => s + h.registrationsCount, 0);
  const totalCourseEnrolls = courses.reduce((s: number, c: Course)     => s + c.enrolledCount, 0);
  const totalEngagement  = totalEventRegs + totalHackRegs + totalCourseEnrolls;

  const handleExport = () => {
    const csv = [
      'ID,Title,Type,Date,Engagement,Capacity,Status',
      ...events.map((e: EventItem) => `"${e.id}","${e.title}","Event","${e.date}",${e.registrationsCount},${e.capacity},"${e.status}"`),
      ...hackathons.map((h: Hackathon) => `"${h.id}","${h.title}","Hackathon","${h.date}",${h.registrationsCount},${h.capacity},"${h.status}"`),
      ...courses.map((c: Course) => `"${c.id}","${c.title}","Course","",${c.enrolledCount},${c.capacity},"${c.status}"`),
    ].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    a.download = `surgeskill-export-${Date.now()}.csv`;
    a.click();
    showToast('Exported to CSV');
  };

  const tabs = [
    { key: 'overview',     label: 'Overview',     icon: 'dashboard' },
    { key: 'communities',  label: 'Communities',   icon: 'groups' },
    { key: 'events',       label: 'Events',        icon: 'event' },
    { key: 'activity',     label: 'Activity Log',  icon: 'history' },
  ] as const;

  return (
    <div style={{ maxWidth: 1080 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Console</h1>
          <p className="page-desc">Full platform control · {currentUser?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/manage')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Manage Content
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="stat-strip" style={{ marginBottom: 24 }}>
        <div className="stat-cell">
          <div className="stat-label">Total Engagement</div>
          <div className="stat-value">{totalEngagement.toLocaleString()}</div>
          <div className="stat-sub">across all content</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Communities</div>
          <div className="stat-value">{communities.length}</div>
          <div className="stat-sub">active groups</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Events</div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-sub">{totalEventRegs} registered</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Courses</div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-sub">{totalCourseEnrolls} enrolled</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Hackathons</div>
          <div className="stat-value">{hackathons.length}</div>
          <div className="stat-sub">{totalHackRegs} registered</div>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveSection(t.key)} style={{
            padding: '10px 18px', fontSize: 13.5, fontWeight: 600, background: 'none', border: 'none',
            cursor: 'pointer', color: activeSection === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeSection === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 120ms',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      {activeSection === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Content Overview</div>
                <div className="card-subtitle">Top content by engagement</div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr>{['Content', 'Type', 'Engagement', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ...events.map((e: EventItem) => ({ ...e, _type: 'Event', _eng: e.registrationsCount })),
                    ...hackathons.map((h: Hackathon) => ({ ...h, _type: 'Hackathon', _eng: h.registrationsCount })),
                    ...courses.map((c: Course) => ({ ...c, _type: 'Course', _eng: c.enrolledCount })),
                  ]
                    .sort((a: any, b: any) => b._eng - a._eng)
                    .slice(0, 10)
                    .map((item: any) => {
                      const pct = item.capacity > 0 ? Math.round((item._eng / item.capacity) * 100) : 0;
                      return (
                        <tr key={item.id}>
                          <td><span style={{ fontWeight: 500, display: 'block', maxWidth: 240 }} className="truncate">{item.title}</span></td>
                          <td><span className="badge badge-gray">{item._type}</span></td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <span style={{ fontWeight: 600 }}>{pct}%</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>({item._eng}/{item.capacity})</span>
                          </td>
                          <td><span className={statusBadge(item.status)}>{item.status}</span></td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick community overview */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-header">
              <div className="card-title">Top Communities</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveSection('communities')}>See all</button>
            </div>
            {communities.slice(0, 6).map((c: Community) => (
              <div key={c.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                  background: c.type === 'college' ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'linear-gradient(135deg,#10b981,#3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>
                    {c.type === 'college' ? 'school' : 'groups'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{memberCounts[c.id] || 0} members</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMMUNITIES ──────────────────────────────────────────── */}
      {activeSection === 'communities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{communities.length} communities total</div>
            <button className="btn btn-primary" onClick={() => navigate('/communities')}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Create Community
            </button>
          </div>
          <div className="card">
            <table className="data-table">
              <thead><tr>{['Community', 'Type', 'Members', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {communities.map((c: Community) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                          background: c.type === 'college' ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'linear-gradient(135deg,#10b981,#3b82f6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#fff' }}>
                            {c.type === 'college' ? 'school' : 'groups'}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 220 }} className="truncate">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${c.type === 'college' ? 'badge-blue' : 'badge-green'}`}>{c.type}</span></td>
                    <td style={{ fontWeight: 600 }}>{memberCounts[c.id] || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/communities/${c.id}`)}>Open</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {communities.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No communities yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── EVENTS ───────────────────────────────────────────────── */}
      {activeSection === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{events.length} events · {hackathons.length} hackathons · {courses.length} courses</div>
            <button className="btn btn-primary" onClick={() => navigate('/manage')}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Manage Content
            </button>
          </div>
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr>{['Title', 'Type', 'Date', 'Registrations', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ...events.map((e: EventItem) => ({ ...e, _type: 'Event', _date: e.date, _eng: e.registrationsCount })),
                    ...hackathons.map((h: Hackathon) => ({ ...h, _type: 'Hackathon', _date: h.date, _eng: h.registrationsCount })),
                    ...courses.map((c: Course) => ({ ...c, _type: 'Course', _date: '', _eng: c.enrolledCount })),
                  ]
                    .sort((a: any, b: any) => (b._date > a._date ? 1 : -1))
                    .map((item: any) => (
                      <tr key={item.id}>
                        <td><span style={{ fontWeight: 500 }}>{item.title}</span></td>
                        <td><span className="badge badge-gray">{item._type}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {item._date ? new Date(item._date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {item._eng}
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>/{item.capacity}</span>
                        </td>
                        <td><span className={statusBadge(item.status)}>{item.status}</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVITY LOG ─────────────────────────────────────────── */}
      {activeSection === 'activity' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Platform Activity</div>
            <div className="card-subtitle">Recent actions across the platform</div>
          </div>
          {activities.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-desc">No activity recorded yet.</div>
            </div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {activities.map((log: ActivityLog, i: number) => (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{log.action}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{log.date} · {log.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
