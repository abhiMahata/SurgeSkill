import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem } from '../../context/AppContext';

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Confirmed: 'badge badge-green',
    Completed: 'badge badge-gray',
    Draft:     'badge badge-amber',
    Cancelled: 'badge badge-red',
  };
  return m[s] ?? 'badge badge-gray';
};

const EMPTY: Partial<EventItem> = {
  title: '', date: '', venue: '', capacity: 100,
  price: '$99', type: 'Conference', description: '', image: '',
};

export const ManageEvents: React.FC = () => {
  const { events, createEvent, updateEvent, deleteEvent, showToast } = useApp();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing]     = useState<EventItem | null>(null);
  const [form, setForm]           = useState<Partial<EventItem>>(EMPTY);
  const [q, setQ]                 = useState('');

  const iStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: 13.5,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: '#fff', color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  };

  const iF = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--text-primary)';
  };
  const iB = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--border)';
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setPanelOpen(true);
  };
  const openEdit = (ev: EventItem) => {
    setEditing(ev);
    setForm({ ...ev });
    setPanelOpen(true);
  };
  const closePanel = () => { setPanelOpen(false); setEditing(null); setForm(EMPTY); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateEvent(editing.id, form as Partial<EventItem>);
      showToast(`Updated "${form.title}"`);
    } else {
      createEvent(form as Omit<EventItem, 'id' | 'registrationsCount' | 'status'>);
      showToast(`Created "${form.title}"`);
    }
    closePanel();
  };

  const handleDelete = (ev: EventItem) => {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    deleteEvent(ev.id);
    showToast(`Deleted "${ev.title}"`);
  };

  const handleStatusChange = (id: string, status: EventItem['status']) => {
    updateEvent(id, { status });
    showToast('Status updated');
  };

  const filtered = events.filter((e: EventItem) =>
    !q || e.title.toLowerCase().includes(q.toLowerCase()) || e.venue.toLowerCase().includes(q.toLowerCase())
  );

  const counts = {
    total: events.length,
    confirmed: events.filter((e: EventItem) => e.status === 'Confirmed').length,
    draft:     events.filter((e: EventItem) => e.status === 'Draft').length,
    completed: events.filter((e: EventItem) => e.status === 'Completed').length,
  };

  return (
    <div style={{ maxWidth: 1060 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Events</h1>
          <p className="page-desc">Create, edit, and manage your complete event portfolio.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          New event
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { l: 'Total', v: counts.total, c: 'var(--text-primary)' },
          { l: 'Confirmed', v: counts.confirmed, c: 'var(--green)' },
          { l: 'Draft', v: counts.draft, c: 'var(--amber)' },
          { l: 'Completed', v: counts.completed, c: 'var(--text-muted)' },
        ].map(s => (
          <div key={s.l} style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: s.c, letterSpacing: '-0.02em' }}>{s.v}</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{s.l}</span>
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div className="search-wrap" style={{ maxWidth: 260 }}>
          <span className="material-symbols-outlined ms" style={{ fontSize: 16 }}>search</span>
          <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Filter events…" />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Event', 'Date', 'Type', 'Registrations', 'Price', 'Status', ''].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev: EventItem) => {
                const pct = ev.capacity > 0 ? Math.round((ev.registrationsCount / ev.capacity) * 100) : 0;
                const isFull = ev.registrationsCount >= ev.capacity;
                return (
                  <tr key={ev.id}>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 220 }} className="truncate">{ev.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{ev.id}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td><span className="badge badge-gray">{ev.type}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>
                            {ev.registrationsCount}/{ev.capacity}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isFull ? 'var(--red)' : 'var(--text-muted)' }}>
                            {isFull ? 'Full' : `${pct}%`}
                          </span>
                        </div>
                        <div className="progress">
                          <div className={`progress-fill ${pct >= 90 ? 'red' : pct >= 60 ? 'green' : 'amber'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{ev.price}</td>
                    <td>
                      <select
                        value={ev.status}
                        onChange={e => handleStatusChange(ev.id, e.target.value as EventItem['status'])}
                        style={{ ...iStyle, width: 'auto', fontSize: 12.5, padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Draft">Draft</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openEdit(ev)} title="Edit">
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(ev)}
                          style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }}
                          title="Delete"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-icon">event_busy</span>
              <div className="empty-title">No events found</div>
              <div className="empty-desc">Create your first event or adjust your search.</div>
            </div>
          )}
        </div>
      </div>

      {/* Slide panel */}
      {panelOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} onClick={closePanel} />
          <div className="slide-panel">
            <div className="panel-header">
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editing ? 'Edit Event' : 'Create Event'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  {editing ? `Editing: ${editing.title}` : 'Add a new event to your portfolio'}
                </div>
              </div>
              <button className="btn-icon" onClick={closePanel}>
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="panel-body">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input style={iStyle} value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} onFocus={iF} onBlur={iB} required placeholder="e.g. Global Tech Summit 2026" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input type="date" style={iStyle} value={form.date ?? ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} onFocus={iF} onBlur={iB} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select style={iStyle} value={form.type ?? 'Conference'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} onFocus={iF} onBlur={iB}>
                      <option>Conference</option>
                      <option>Workshop</option>
                      <option>Networking</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue / Location *</label>
                  <input style={iStyle} value={form.venue ?? ''} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} onFocus={iF} onBlur={iB} required placeholder="e.g. Moscone Center, San Francisco" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input type="number" min={1} style={iStyle} value={form.capacity ?? 100} onChange={e => setForm(p => ({ ...p, capacity: parseInt(e.target.value, 10) }))} onFocus={iF} onBlur={iB} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input style={iStyle} value={form.price ?? ''} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} onFocus={iF} onBlur={iB} required placeholder="$299 or Free" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image URL</label>
                  <input type="url" style={iStyle} value={form.image ?? ''} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} onFocus={iF} onBlur={iB} placeholder="https://…" />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    rows={4}
                    style={{ ...iStyle, resize: 'vertical' }}
                    value={form.description ?? ''}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    onFocus={iF as any}
                    onBlur={iB as any}
                    required
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button type="button" className="btn btn-secondary" onClick={closePanel}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
