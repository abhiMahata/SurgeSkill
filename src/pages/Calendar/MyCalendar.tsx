import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem, Hackathon } from '../../types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

type CalendarItem = {
  id: string;
  title: string;
  date: string; // The specific date this item appears on
  endDate?: string;
  type: string;
  status: string;
  image: string;
  description: string;
  venue: string;
  price?: string;
  isHackathon?: boolean;
  raw: EventItem | Hackathon;
};

export const MyCalendar: React.FC = () => {
  const { currentUser, events, hackathons, toggleEventRegistration, toggleHackathonRegistration, showToast } = useApp();
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<CalendarItem | null>(null);

  const regEvents = currentUser?.registeredEvents ?? [];
  const regHacks  = currentUser?.registeredHackathons ?? [];

  // Generate calendar items
  const calendarItems: CalendarItem[] = [];
  
  events.filter(e => regEvents.includes(e.id)).forEach(e => {
    calendarItems.push({
      id: e.id, title: e.title, date: e.date, type: e.type, status: e.status,
      image: e.image, description: e.description, venue: e.venue, price: e.price,
      isHackathon: false, raw: e
    });
  });

  hackathons.filter(h => regHacks.includes(h.id)).forEach(h => {
    // For hackathons, we can just show the start date, or spanning dates. 
    // For simplicity we show it on the start date.
    calendarItems.push({
      id: h.id, title: h.title, date: h.date, endDate: h.endDate, type: h.mode, status: h.status,
      image: h.image, description: h.description, venue: h.venue,
      isHackathon: true, raw: h
    });
  });

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
    return calendarItems.filter(ci => ci.date === ds || (ci.endDate && ds >= ci.date && ds <= ci.endDate));
  };

  const handleLeave = (ci: CalendarItem) => {
    if (ci.isHackathon) {
      const r = toggleHackathonRegistration(ci.id);
      if (r.success && !r.registered) { showToast(`Left "${ci.title}"`); setSelected(null); }
    } else {
      const r = toggleEventRegistration(ci.id);
      if (r.success && !r.registered) { showToast(`Left "${ci.title}"`); setSelected(null); }
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Calendar</h1>
          <p className="page-desc">{calendarItems.length} event{calendarItems.length !== 1 ? 's' : ''} on your schedule.</p>
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
      {calendarItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {calendarItems.map((ci) => (
            <button
              key={ci.id}
              onClick={() => setSelected(ci)}
              className="chip"
              style={{ fontSize: 12, borderColor: ci.isHackathon ? 'var(--blue-border)' : 'var(--border)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13, color: ci.isHackathon ? 'var(--blue)' : 'inherit' }}>{ci.isHackathon ? 'code' : 'event'}</span>
              {ci.title.length > 32 ? ci.title.slice(0, 32) + '…' : ci.title}
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
                {evs.map((ci, i) => (
                  <div
                    key={`${ci.id}-${i}`}
                    className="cal-event-pill"
                    onClick={() => setSelected(ci)}
                    style={{ background: ci.isHackathon ? 'var(--blue-light)' : 'var(--bg)', color: ci.isHackathon ? 'var(--blue)' : 'var(--text-primary)', borderColor: ci.isHackathon ? 'var(--blue-border)' : 'var(--border)' }}
                  >
                    {ci.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {calendarItems.length === 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">calendar_today</span>
            <div className="empty-title">No events on your calendar</div>
            <div className="empty-desc">Register for events and hackathons to see them here.</div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* Color header instead of image */}
            <div style={{
              width: '100%', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: (() => {
                const palette = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#3b82f6,#06b6d4)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f59e0b,#ef4444)','linear-gradient(135deg,#8b5cf6,#ec4899)','linear-gradient(135deg,#06b6d4,#10b981)'];
                let hash = 0;
                for (let i = 0; i < selected.id.length; i++) hash = (hash * 31 + selected.id.charCodeAt(i)) | 0;
                return palette[Math.abs(hash) % palette.length];
              })(),
              borderRadius: '14px 14px 0 0',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }}>
                {selected.isHackathon ? 'code' : 'event'}
              </span>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {selected.isHackathon ? <span className="badge badge-blue">Hackathon</span> : <span className="badge badge-gray">{selected.type}</span>}
                <span className={`badge ${selected.status === 'Confirmed' || selected.status === 'Upcoming' ? 'badge-green' : 'badge-gray'}`}>{selected.status}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>{selected.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{selected.description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {[
                  ['calendar_today', selected.endDate ? `${new Date(selected.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(selected.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : new Date(selected.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                  ['pin_drop', selected.venue],
                  ...(selected.price ? [['payments', selected.price]] : []),
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
                  <button className="btn btn-danger" onClick={() => handleLeave(selected)}>Leave {selected.isHackathon ? 'Hackathon' : 'Event'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
