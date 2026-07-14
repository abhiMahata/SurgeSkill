import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { AppEvent } from '../../types';

export const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events, myEventRegistrations, toggleEventRegistration, showToast } = useApp();
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check context first
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      setEvent(ev);
      setLoading(false);
      return;
    }
    // Fetch from Firestore if not in context
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const snap = await getDoc(doc(db, 'events', eventId));
        if (snap.exists()) setEvent({ id: snap.id, ...snap.data() } as AppEvent);
      } catch (e) {}
      setLoading(false);
    };
    fetchEvent();
  }, [eventId, events]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!event) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2 style={{ marginBottom: 16 }}>Event Not Found</h2>
      <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const isReg = myEventRegistrations.includes(event.id);
  const isPast = event.startsAt < Date.now();

  const handleRegister = async () => {
    if (isPast) return showToast('This event has already ended.');
    const r = await toggleEventRegistration(event.id);
    if (r.success) showToast(r.registered ? `Registered for "${event.title}"` : `Left "${event.title}"`);
  };

  const sd = new Date(event.startsAt);
  const ed = new Date(event.endsAt);
  const isSameDay = sd.toDateString() === ed.toDateString();
  const dateStr = isSameDay 
    ? sd.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : `${sd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${ed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const timeStr = isSameDay 
    ? `${sd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${ed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
    : '';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Back
      </button>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ 
          height: 160, 
          background: event.scope === 'COLLEGE' ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : 'linear-gradient(135deg,#10b981,#3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'rgba(255,255,255,0.9)' }}>
            {event.scope === 'COLLEGE' ? 'domain' : 'groups'}
          </span>
        </div>
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span className={`badge ${event.scope === 'COLLEGE' ? 'badge-blue' : 'badge-green'}`}>{event.scope} Event</span>
            <span className={`badge ${event.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{event.status}</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{event.title}</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>{event.description}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, padding: 20, background: 'var(--bg)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>calendar_today</span>
              <div>
                <div style={{ fontWeight: 600 }}>{dateStr}</div>
                {timeStr && <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{timeStr}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>location_on</span>
              <div style={{ fontWeight: 600 }}>{event.location}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>group</span>
              <div style={{ fontWeight: 600 }}>{event.registrationCount} {event.registrationCount === 1 ? 'Registration' : 'Registrations'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            {event.registrationEnabled ? (
              <button 
                className={`btn ${isReg ? 'btn-ghost' : 'btn-primary'}`} 
                onClick={handleRegister}
                disabled={isPast}
                style={{ padding: '12px 24px', fontSize: 16 }}
              >
                {isReg ? 'Registered ✓' : 'Register Now'}
              </button>
            ) : (
              <div style={{ padding: '12px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Registration Closed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
