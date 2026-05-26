import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { EventItem, ActivityLog } from '../../context/AppContext';

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Confirmed: 'badge badge-green',
    Completed: 'badge badge-gray',
    Draft:     'badge badge-amber',
    Cancelled: 'badge badge-red',
  };
  return m[s] ?? 'badge badge-gray';
};

const statusColor = (s: string) => ({
  Confirmed: 'var(--green)', Completed: 'var(--text-muted)',
  Draft: 'var(--amber)', Cancelled: 'var(--red)',
}[s] ?? 'var(--text-muted)');

export const AdminDashboard: React.FC = () => {
  const { currentUser, events, activities, showToast } = useApp();
  const navigate = useNavigate();

  const totalRegs = events.reduce((s: number, e: EventItem) => s + e.registrationsCount, 0);
  const totalCap  = events.reduce((s: number, e: EventItem) => s + e.capacity, 0);
  const fillPct   = totalCap > 0 ? Math.round((totalRegs / totalCap) * 100) : 0;
  const revenue   = events.reduce((s: number, e: EventItem) => {
    if (e.price === 'Free' || !e.price.startsWith('$')) return s;
    return s + parseInt(e.price.replace('$',''), 10) * e.registrationsCount;
  }, 0);

  const handleExport = () => {
    const csv = [
      'ID,Title,Date,Venue,Capacity,Registrations,Price,Status',
      ...events.map((e: EventItem) =>
        `"${e.id}","${e.title}","${e.date}","${e.venue}",${e.capacity},${e.registrationsCount},"${e.price}","${e.status}"`
      )
    ].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    a.download = `surgeskills-${Date.now()}.csv`;
    a.click();
    showToast('Exported to CSV');
  };

  return (
    <div style={{ maxWidth: 1060 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-desc">{currentUser?.name} · {currentUser?.designation}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/manage')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            New event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-strip">
        <div className="stat-cell">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-sub">in portfolio</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Registrations</div>
          <div className="stat-value">{totalRegs.toLocaleString()}</div>
          <div className="stat-sub">of {totalCap.toLocaleString()} capacity</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Fill Rate</div>
          <div className="stat-value">{fillPct}%</div>
          <div className="stat-sub">average</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Revenue</div>
          <div className="stat-value">${revenue.toLocaleString()}</div>
          <div className="stat-sub">projected</div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Fill rate bars */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Registration Analytics</div>
                <div className="card-subtitle">Fill rate by event</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/manage')}>
                Manage
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {events.slice(0, 5).map((ev: EventItem) => {
                const pct = ev.capacity > 0 ? Math.round((ev.registrationsCount / ev.capacity) * 100) : 0;
                const barClass = pct >= 90 ? 'green' : pct >= 60 ? '' : 'amber';
                return (
                  <div key={ev.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{ev.title}</span>
                        <span className={statusBadge(ev.status)}>{ev.status}</span>
                      </div>
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {ev.registrationsCount}/{ev.capacity} <span style={{ fontWeight: 600, color: statusColor(ev.status) }}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="progress">
                      <div className={`progress-fill ${barClass}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Event Portfolio</div>
                <div className="card-subtitle">{events.length} events</div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {['Event', 'Date', 'Type', 'Fill', 'Price', 'Status'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 6).map((ev: EventItem) => {
                    const pct = ev.capacity > 0 ? Math.round((ev.registrationsCount / ev.capacity) * 100) : 0;
                    return (
                      <tr key={ev.id}>
                        <td>
                          <span style={{ fontWeight: 500, display: 'block', maxWidth: 180 }} className="truncate">{ev.title}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td><span className="badge badge-gray">{ev.type}</span></td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                          <span style={{ fontWeight: 600 }}>{pct}%</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>({ev.registrationsCount}/{ev.capacity})</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{ev.price}</td>
                        <td><span className={statusBadge(ev.status)}>{ev.status}</span></td>
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
