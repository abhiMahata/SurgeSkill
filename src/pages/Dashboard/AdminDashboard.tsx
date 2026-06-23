import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { EventItem, Hackathon, Course, ActivityLog } from '../../types';

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Confirmed: 'badge badge-green',
    Completed: 'badge badge-gray',
    Draft:     'badge badge-amber',
    Cancelled: 'badge badge-red',
    Upcoming:  'badge badge-blue',
    Live:      'badge badge-green',
    Active:    'badge badge-green',
  };
  return m[s] ?? 'badge badge-gray';
};

const statusColor = (s: string) => ({
  Confirmed: 'var(--green)', Completed: 'var(--text-muted)',
  Draft: 'var(--amber)', Cancelled: 'var(--red)',
  Upcoming: 'var(--blue)', Live: 'var(--green)', Active: 'var(--green)'
}[s] ?? 'var(--text-muted)');

export const AdminDashboard: React.FC = () => {
  const { currentUser, events, hackathons, courses, activities, showToast } = useApp();
  const navigate = useNavigate();

  // If mentor, show only their content; if admin, show all
  const isAdmin = currentUser?.role === 'admin';
  const myEvents = isAdmin ? events : events.filter(e => e.createdBy === currentUser?.id);
  const myHacks = isAdmin ? hackathons : hackathons.filter(h => h.createdBy === currentUser?.id);
  const myCourses = isAdmin ? courses : courses.filter(c => c.createdBy === currentUser?.id);

  const totalEventRegs = myEvents.reduce((s, e) => s + e.registrationsCount, 0);
  const totalHackRegs = myHacks.reduce((s, h) => s + h.registrationsCount, 0);
  const totalCourseEnrolls = myCourses.reduce((s, c) => s + c.enrolledCount, 0);
  
  const totalEngagement = totalEventRegs + totalHackRegs + totalCourseEnrolls;

  const handleExport = () => {
    // Just a simple export for events to keep it working
    const csv = [
      'ID,Title,Type,Date,Registrations,Capacity,Status',
      ...myEvents.map(e => `"${e.id}","${e.title}","Event","${e.date}",${e.registrationsCount},${e.capacity},"${e.status}"`),
      ...myHacks.map(h => `"${h.id}","${h.title}","Hackathon","${h.date}",${h.registrationsCount},${h.capacity},"${h.status}"`),
      ...myCourses.map(c => `"${c.id}","${c.title}","Course","",${c.enrolledCount},${c.capacity},"${c.status}"`)
    ].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    a.download = `surgeskill-export-${Date.now()}.csv`;
    a.click();
    showToast('Exported to CSV');
  };

  return (
    <div style={{ maxWidth: 1060 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Admin Console' : 'Mentor Dashboard'}</h1>
          <p className="page-desc">{currentUser?.name} · {currentUser?.designation}</p>
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

      {/* Stats */}
      <div className="stat-strip">
        <div className="stat-cell">
          <div className="stat-label">Total Engagement</div>
          <div className="stat-value">{totalEngagement.toLocaleString()}</div>
          <div className="stat-sub">across all content</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Events</div>
          <div className="stat-value">{myEvents.length}</div>
          <div className="stat-sub">{totalEventRegs} registered</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Hackathons</div>
          <div className="stat-value">{myHacks.length}</div>
          <div className="stat-sub">{totalHackRegs} registered</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Courses</div>
          <div className="stat-value">{myCourses.length}</div>
          <div className="stat-sub">{totalCourseEnrolls} enrolled</div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Recent Content */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Content Overview</div>
                <div className="card-subtitle">Recent events, hackathons, and courses</div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Content', 'Type', 'Engagement', 'Status'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...myEvents.map(e => ({ ...e, _type: 'Event', _eng: e.registrationsCount })),
                    ...myHacks.map(h => ({ ...h, _type: 'Hackathon', _eng: h.registrationsCount })),
                    ...myCourses.map(c => ({ ...c, _type: 'Course', _eng: c.enrolledCount }))
                  ]
                  .sort((a, b) => b._eng - a._eng)
                  .slice(0, 8)
                  .map((item: any) => {
                    const pct = item.capacity > 0 ? Math.round((item._eng / item.capacity) * 100) : 0;
                    return (
                      <tr key={item.id}>
                        <td>
                          <span style={{ fontWeight: 500, display: 'block', maxWidth: 220 }} className="truncate">{item.title}</span>
                        </td>
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
        </div>

        {/* Right col — activity */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <div className="card-title">Activity Log</div>
          </div>
          {activities.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="empty-desc">No activity yet.</div>
            </div>
          ) : (
            <div style={{ padding: '8px 0', maxHeight: 480, overflowY: 'auto' }}>
              {activities.slice(0, 12).map((log: ActivityLog, i: number) => (
                <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.4 }}>{log.action}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{log.date} · {log.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
