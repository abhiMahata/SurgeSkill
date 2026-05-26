import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem } from '../../context/AppContext';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const MyCalendar: React.FC = () => {
  const { currentUser, events, toggleEventRegistration, showToast } = useApp();
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<EventItem | null>(null);

  const regIds   = currentUser?.registeredEvents ?? [];
  const myEvents = events.filter((e: EventItem) => regIds.includes(e.id));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cells = [...Array(firstDay).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const dayEvents = (day: number) => {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return myEvents.filter((e: EventItem) => e.date === ds);
  };

  const handleLeave = (ev: EventItem) => {
    const r = toggleEventRegistration(ev.id);
    if (r.success && !r.registered) { showToast(`Left "${ev.title}"`); setSelected(null); }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Calendar</h1>
          <p className="page-desc">{myEvents.length} event{myEvents.length !== 1 ? 's' : ''} on your schedule.</p>
        </div>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface)' }}>
          <button onClick={prevMonth} className="btn btn-ghost" style={{ borderRadius: 0, border: 'none', padding: '6px 10px', borderRight: '1px solid var(--border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
          </button>
          <span style={{ padding: '0 16px', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="btn btn-ghost" style={{ borderRadius: 0, border: 'none', padding: '6px 10px', borderLeft: '1px solid var(--border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
        </div>
      </div>

      {/* Legend chips */}
      {myEvents.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {myEvents.map((ev: EventItem) => (
            <button
              key={ev.id}
              onClick={() => setSelected(ev)}
              className="chip"
              style={{ fontSize: 12 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>event</span>
              {ev.title.length > 32 ? ev.title.slice(0, 32) + '…' : ev.title}
            </button>
          ))}
        </div>
      )}

      {/* Calendar */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Day headers */}
        <div className="cal-grid" style={{ borderBottom: '1px solid var(--border)' }}>
          {DAYS.map(d => <div key={d} className="cal-head-cell">{d}</div>)}
        </div>

        {/* Day cells */}
        <div className="cal-grid">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="cal-day empty" />;

            const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const evs = dayEvents(day);
            const isToday = ds === todayStr;

            return (
              <div key={idx} className={`cal-day ${isToday ? 'today' : ''}`}>
                <div className="day-num">{day}</div>
                {evs.map((ev: EventItem) => (
                  <div
                    key={ev.id}
                    className="cal-event-pill"
                    onClick={() => setSelected(ev)}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {myEvents.length === 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">calendar_today</span>
            <div className="empty-title">No events on your calendar</div>
            <div className="empty-desc">Register for events to see them here.</div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <img src={selected.image} alt={selected.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', borderRadius: '14px 14px 0 0' }} />
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <span className="badge badge-gray">{selected.type}</span>
                <span className={`badge ${selected.status === 'Confirmed' ? 'badge-green' : 'badge-gray'}`}>{selected.status}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>{selected.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{selected.description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {[
                  ['calendar_today', new Date(selected.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                  ['pin_drop', selected.venue],
                  ['payments', selected.price],
                ].map(([icon, val]) => (
                  <div key={String(icon)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--text-muted)' }}>{icon}</span>
                    <span style={{ fontWeight: icon === 'payments' ? 700 : 400, color: icon === 'payments' ? 'var(--text-primary)' : undefined }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
                {selected.status !== 'Completed' && selected.status !== 'Cancelled' && (
                  <button className="btn btn-danger" onClick={() => handleLeave(selected)}>Leave Event</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
