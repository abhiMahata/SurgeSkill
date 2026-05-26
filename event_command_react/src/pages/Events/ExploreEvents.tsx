import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem } from '../../context/AppContext';

type Filter = 'All' | 'Conference' | 'Workshop' | 'Networking';
type StatusF = 'All' | 'Confirmed' | 'Draft' | 'Completed' | 'Cancelled';

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Confirmed: 'badge badge-green',
    Completed: 'badge badge-gray',
    Draft:     'badge badge-amber',
    Cancelled: 'badge badge-red',
  };
  return m[s] ?? 'badge badge-gray';
};

export const ExploreEvents: React.FC = () => {
  const { currentUser, events, toggleEventRegistration, showToast } = useApp();

  const [q, setQ]             = useState('');
  const [cat, setCat]         = useState<Filter>('All');
  const [status, setStatus]   = useState<StatusF>('Confirmed');
  const [sort, setSort]       = useState<'asc' | 'desc'>('asc');

  const regIds = currentUser?.registeredEvents ?? [];

  const filtered = events
    .filter((e: EventItem) => {
      const matchQ = e.title.toLowerCase().includes(q.toLowerCase()) || e.venue.toLowerCase().includes(q.toLowerCase());
      const matchC = cat === 'All' || e.type === cat;
      const matchS = status === 'All' || e.status === status;
      return matchQ && matchC && matchS;
    })
    .sort((a: EventItem, b: EventItem) =>
      sort === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const handleToggle = (ev: EventItem) => {
    const r = toggleEventRegistration(ev.id);
    if (r.success) showToast(r.registered ? `Registered for "${ev.title}"` : `Left "${ev.title}"`);
  };

  const CATEGORIES: Filter[] = ['All', 'Conference', 'Workshop', 'Networking'];
  const STATUSES: StatusF[]  = ['All', 'Confirmed', 'Draft', 'Completed', 'Cancelled'];

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Events</h1>
          <p className="page-desc">Discover and register for upcoming events.</p>
        </div>
      </div>

      {/* Search + sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <div className="search-wrap" style={{ maxWidth: 320 }}>
          <span className="material-symbols-outlined ms" style={{ fontSize: 16 }}>search</span>
          <input
            className="search-input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search events or venues…"
          />
        </div>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSort(s => s === 'asc' ? 'desc' : 'asc')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>swap_vert</span>
          Date: {sort === 'asc' ? 'Earliest' : 'Latest'}
        </button>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{filtered.length} results</span>
      </div>

      {/* Category chips */}
      <div className="filter-row" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Category:</span>
        {CATEGORIES.map(c => (
          <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* Status chips */}
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Status:</span>
        {STATUSES.map(s => (
          <button key={s} className={`chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Event list */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">search_off</span>
            <div className="empty-title">No events found</div>
            <div className="empty-desc">Try adjusting your filters or search term.</div>
          </div>
        </div>
      ) : (
        <div className="card">
          {filtered.map((ev: EventItem, idx: number) => {
            const isReg = regIds.includes(ev.id);
            const spotsLeft = Math.max(0, ev.capacity - ev.registrationsCount);
            const pct = ev.capacity > 0 ? Math.round((ev.registrationsCount / ev.capacity) * 100) : 0;
            const canToggle = ev.status !== 'Completed' && ev.status !== 'Cancelled';

            return (
              <div
                key={ev.id}
                style={{
                  display: 'flex', gap: 16, padding: '16px 20px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start',
                  background: isReg ? 'rgba(37,99,235,0.02)' : 'transparent',
                }}
              >
                {/* Thumbnail */}
                <img src={ev.image} alt={ev.title} style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</span>
                    {isReg && <span className="badge badge-blue">Registered</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <span>
                      <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>calendar_today</span>
                      {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>
                      <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>pin_drop</span>
                      {ev.venue}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={statusBadge(ev.status)}>{ev.status}</span>
                    <span className="badge badge-gray">{ev.type}</span>
                    <span style={{ fontSize: 12, color: pct >= 90 ? 'var(--red)' : 'var(--text-muted)' }}>
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                    </span>
                  </div>
                </div>

                {/* Price + action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.price}</span>
                  {canToggle ? (
                    <button
                      className={`btn btn-sm ${isReg ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => handleToggle(ev)}
                    >
                      {isReg ? 'Leave event' : 'Register'}
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Closed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
