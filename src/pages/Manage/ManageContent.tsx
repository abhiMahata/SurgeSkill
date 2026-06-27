import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventItem, Hackathon, Course } from '../../types';

type Tab = 'events' | 'hackathons' | 'courses';
type PanelMode = null | 'event' | 'hackathon' | 'course';

const iStyle: React.CSSProperties = { width: '100%', padding: '7px 10px', fontSize: 13.5, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

export const ManageContent: React.FC = () => {
  const { events, hackathons, courses, createEvent, updateEvent, deleteEvent, createHackathon, updateHackathon, deleteHackathon, createCourse, updateCourse, deleteCourse, showToast } = useApp();
  const [tab, setTab] = useState<Tab>('events');
  const [q, setQ] = useState('');
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Event form
  const [evForm, setEvForm] = useState<Partial<EventItem>>({ title: '', date: '', venue: '', capacity: 100, price: '$99', type: 'Conference', description: '', image: '' });
  // Hackathon form
  const [hackForm, setHackForm] = useState<Partial<Hackathon>>({ title: '', date: '', endDate: '', venue: '', mode: 'online', teamSizeMin: 2, teamSizeMax: 4, prizes: [''], description: '', image: '', capacity: 200 });
  // Course form
  const [courseForm, setCourseForm] = useState<Partial<Course>>({ title: '', description: '', image: '', category: 'Web Development', duration: '8 weeks', level: 'Beginner', syllabus: [''], capacity: 50, price: 'Free', mentor: '', mentorId: '' });

  const openPanel = (mode: PanelMode, item?: any) => {
    setEditId(item?.id || null);
    if (mode === 'event') setEvForm(item ? { ...item } : { title: '', date: '', venue: '', capacity: 100, price: '$99', type: 'Conference', description: '', image: '' });
    if (mode === 'hackathon') setHackForm(item ? { ...item, prizes: item.prizes || [''] } : { title: '', date: '', endDate: '', venue: '', mode: 'online', teamSizeMin: 2, teamSizeMax: 4, prizes: [''], description: '', image: '', capacity: 200 });
    if (mode === 'course') setCourseForm(item ? { ...item, syllabus: item.syllabus || [''] } : { title: '', description: '', image: '', category: 'Web Development', duration: '8 weeks', level: 'Beginner', syllabus: [''], capacity: 50, price: 'Free', mentor: '', mentorId: '' });
    setPanelMode(mode);
  };
  const closePanel = () => { setPanelMode(null); setEditId(null); };

  const submitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) { updateEvent(editId, evForm); showToast(`Updated "${evForm.title}"`); }
    else { createEvent(evForm as any); showToast(`Created "${evForm.title}"`); }
    closePanel();
  };
  const submitHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...hackForm, prizes: (hackForm.prizes || []).filter(p => p.trim()) };
    if (editId) { updateHackathon(editId, data as any); showToast(`Updated "${hackForm.title}"`); }
    else { createHackathon(data as any); showToast(`Created "${hackForm.title}"`); }
    closePanel();
  };
  const submitCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...courseForm, syllabus: (courseForm.syllabus || []).filter(s => s.trim()) };
    if (editId) { updateCourse(editId, data as any); showToast(`Updated "${courseForm.title}"`); }
    else { createCourse(data as any); showToast(`Created "${courseForm.title}"`); }
    closePanel();
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'events', label: 'Events', icon: 'event' },
    { key: 'hackathons', label: 'Hackathons', icon: 'code' },
    { key: 'courses', label: 'Courses', icon: 'school' },
  ];

  const statusBadge = (s: string) => ({ Confirmed: 'badge badge-green', Completed: 'badge badge-gray', Draft: 'badge badge-amber', Cancelled: 'badge badge-red', Upcoming: 'badge badge-blue', Live: 'badge badge-green', Active: 'badge badge-green' }[s] ?? 'badge badge-gray');

  return (
    <div style={{ maxWidth: 1060 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Content</h1>
          <p className="page-desc">Create and manage events, hackathons, and courses.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openPanel(tab === 'events' ? 'event' : tab === 'hackathons' ? 'hackathon' : 'course')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          New {tab === 'events' ? 'Event' : tab === 'hackathons' ? 'Hackathon' : 'Course'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setQ(''); }}
            style={{ padding: '10px 18px', fontSize: 13.5, fontWeight: tab === t.key ? 600 : 500, color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: 280, marginBottom: 16 }}>
        <span className="material-symbols-outlined ms" style={{ fontSize: 16 }}>search</span>
        <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Filter…" />
      </div>

      {/* Events Table */}
      {tab === 'events' && (
        <div className="card"><div style={{ overflowX: 'auto' }}>
          <table className="data-table"><thead><tr>{['Event', 'Date', 'Type', 'Fill', 'Price', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{events.filter(e => !q || e.title.toLowerCase().includes(q.toLowerCase())).map(ev => {
              const pct = ev.capacity > 0 ? Math.round((ev.registrationsCount / ev.capacity) * 100) : 0;
              return (<tr key={ev.id}><td><div style={{ fontWeight: 500 }} className="truncate">{ev.title}</div></td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><span className="badge badge-gray">{ev.type}</span></td>
                <td>{ev.registrationsCount}/{ev.capacity} <span style={{ fontWeight: 600 }}>({pct}%)</span></td>
                <td style={{ fontWeight: 600 }}>{ev.price}</td>
                <td><span className={statusBadge(ev.status)}>{ev.status}</span></td>
                <td><div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => openPanel('event', ev)} title="Edit"><span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span></button>
                  <button className="btn-icon" onClick={() => { if (confirm(`Delete "${ev.title}"?`)) { deleteEvent(ev.id); showToast('Deleted'); } }} style={{ color: 'var(--red)' }} title="Delete"><span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span></button>
                </div></td></tr>);
            })}</tbody></table>
        </div></div>
      )}

      {/* Hackathons Table */}
      {tab === 'hackathons' && (
        <div className="card"><div style={{ overflowX: 'auto' }}>
          <table className="data-table"><thead><tr>{['Hackathon', 'Dates', 'Mode', 'Registrations', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{hackathons.filter(h => !q || h.title.toLowerCase().includes(q.toLowerCase())).map(h => (
              <tr key={h.id}><td><div style={{ fontWeight: 500 }} className="truncate">{h.title}</div></td>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(h.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                <td><span className="badge badge-gray">{h.mode}</span></td>
                <td>{h.registrationsCount}/{h.capacity}</td>
                <td><span className={statusBadge(h.status)}>{h.status}</span></td>
                <td><div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => openPanel('hackathon', h)}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span></button>
                  <button className="btn-icon" onClick={() => { if (confirm(`Delete "${h.title}"?`)) { deleteHackathon(h.id); showToast('Deleted'); } }} style={{ color: 'var(--red)' }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span></button>
                </div></td></tr>
            ))}</tbody></table>
        </div></div>
      )}

      {/* Courses Table */}
      {tab === 'courses' && (
        <div className="card"><div style={{ overflowX: 'auto' }}>
          <table className="data-table"><thead><tr>{['Course', 'Category', 'Level', 'Enrolled', 'Price', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{courses.filter(c => !q || c.title.toLowerCase().includes(q.toLowerCase())).map(c => (
              <tr key={c.id}><td><div style={{ fontWeight: 500 }} className="truncate">{c.title}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{c.duration}</div></td>
                <td><span className="badge badge-gray">{c.category}</span></td>
                <td>{c.level}</td>
                <td>{c.enrolledCount}/{c.capacity}</td>
                <td style={{ fontWeight: 600 }}>{c.price}</td>
                <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                <td><div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => openPanel('course', c)}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span></button>
                  <button className="btn-icon" onClick={() => { if (confirm(`Delete "${c.title}"?`)) { deleteCourse(c.id); showToast('Deleted'); } }} style={{ color: 'var(--red)' }}><span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span></button>
                </div></td></tr>
            ))}</tbody></table>
        </div></div>
      )}

      {/* Slide Panels */}
      {panelMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} onClick={closePanel} />
          <div className="slide-panel">
            <div className="panel-header">
              <div><div style={{ fontSize: 15, fontWeight: 700 }}>{editId ? 'Edit' : 'Create'} {panelMode === 'event' ? 'Event' : panelMode === 'hackathon' ? 'Hackathon' : 'Course'}</div></div>
              <button className="btn-icon" onClick={closePanel}><span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span></button>
            </div>

            {panelMode === 'event' && (
              <form onSubmit={submitEvent} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="panel-body">
                  <div className="form-group"><label className="form-label">Title *</label><input style={iStyle} value={evForm.title ?? ''} onChange={e => setEvForm(p => ({ ...p, title: e.target.value }))} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Date *</label><input type="date" style={iStyle} value={evForm.date ?? ''} onChange={e => setEvForm(p => ({ ...p, date: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Category</label><select style={iStyle} value={evForm.type ?? 'Conference'} onChange={e => setEvForm(p => ({ ...p, type: e.target.value }))}><option>Conference</option><option>Workshop</option><option>Networking</option><option>Seminar</option></select></div>
                  </div>
                  <div className="form-group"><label className="form-label">Venue *</label><input style={iStyle} value={evForm.venue ?? ''} onChange={e => setEvForm(p => ({ ...p, venue: e.target.value }))} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Capacity</label><input type="number" min={1} style={iStyle} value={evForm.capacity ?? 100} onChange={e => setEvForm(p => ({ ...p, capacity: parseInt(e.target.value) }))} /></div>
                    <div className="form-group"><label className="form-label">Price</label><input style={iStyle} value={evForm.price ?? ''} onChange={e => setEvForm(p => ({ ...p, price: e.target.value }))} /></div>
                  </div>

                  <div className="form-group"><label className="form-label">Description *</label><textarea rows={3} style={{ ...iStyle, resize: 'vertical' } as any} value={evForm.description ?? ''} onChange={e => setEvForm(p => ({ ...p, description: e.target.value }))} required /></div>
                </div>
                <div className="panel-footer"><button type="button" className="btn btn-secondary" onClick={closePanel}>Cancel</button><button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Publish'}</button></div>
              </form>
            )}

            {panelMode === 'hackathon' && (
              <form onSubmit={submitHackathon} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="panel-body">
                  <div className="form-group"><label className="form-label">Title *</label><input style={iStyle} value={hackForm.title ?? ''} onChange={e => setHackForm(p => ({ ...p, title: e.target.value }))} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Start Date *</label><input type="date" style={iStyle} value={hackForm.date ?? ''} onChange={e => setHackForm(p => ({ ...p, date: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">End Date *</label><input type="date" style={iStyle} value={hackForm.endDate ?? ''} onChange={e => setHackForm(p => ({ ...p, endDate: e.target.value }))} required /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Venue</label><input style={iStyle} value={hackForm.venue ?? ''} onChange={e => setHackForm(p => ({ ...p, venue: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Mode</label><select style={iStyle} value={hackForm.mode ?? 'online'} onChange={e => setHackForm(p => ({ ...p, mode: e.target.value as any }))}><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></select></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Team Min</label><input type="number" min={1} style={iStyle} value={hackForm.teamSizeMin ?? 2} onChange={e => setHackForm(p => ({ ...p, teamSizeMin: parseInt(e.target.value) }))} /></div>
                    <div className="form-group"><label className="form-label">Team Max</label><input type="number" min={1} style={iStyle} value={hackForm.teamSizeMax ?? 4} onChange={e => setHackForm(p => ({ ...p, teamSizeMax: parseInt(e.target.value) }))} /></div>
                    <div className="form-group"><label className="form-label">Capacity</label><input type="number" min={1} style={iStyle} value={hackForm.capacity ?? 200} onChange={e => setHackForm(p => ({ ...p, capacity: parseInt(e.target.value) }))} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Prizes (comma-separated)</label><input style={iStyle} value={(hackForm.prizes || []).join(', ')} onChange={e => setHackForm(p => ({ ...p, prizes: e.target.value.split(',').map(s => s.trim()) }))} /></div>

                  <div className="form-group"><label className="form-label">Description *</label><textarea rows={3} style={{ ...iStyle, resize: 'vertical' } as any} value={hackForm.description ?? ''} onChange={e => setHackForm(p => ({ ...p, description: e.target.value }))} required /></div>
                </div>
                <div className="panel-footer"><button type="button" className="btn btn-secondary" onClick={closePanel}>Cancel</button><button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Publish'}</button></div>
              </form>
            )}

            {panelMode === 'course' && (
              <form onSubmit={submitCourse} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="panel-body">
                  <div className="form-group"><label className="form-label">Title *</label><input style={iStyle} value={courseForm.title ?? ''} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Category</label><select style={iStyle} value={courseForm.category ?? ''} onChange={e => setCourseForm(p => ({ ...p, category: e.target.value }))}><option>Web Development</option><option>AI / ML</option><option>Design</option><option>Mobile Development</option><option>Data Science</option><option>Cybersecurity</option><option>Other</option></select></div>
                    <div className="form-group"><label className="form-label">Level</label><select style={iStyle} value={courseForm.level ?? 'Beginner'} onChange={e => setCourseForm(p => ({ ...p, level: e.target.value as any }))}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Duration</label><input style={iStyle} value={courseForm.duration ?? ''} onChange={e => setCourseForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 8 weeks" /></div>
                    <div className="form-group"><label className="form-label">Capacity</label><input type="number" min={1} style={iStyle} value={courseForm.capacity ?? 50} onChange={e => setCourseForm(p => ({ ...p, capacity: parseInt(e.target.value) }))} /></div>
                    <div className="form-group"><label className="form-label">Price</label><input style={iStyle} value={courseForm.price ?? ''} onChange={e => setCourseForm(p => ({ ...p, price: e.target.value }))} placeholder="Free or $49" /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Syllabus (comma-separated)</label><input style={iStyle} value={(courseForm.syllabus || []).join(', ')} onChange={e => setCourseForm(p => ({ ...p, syllabus: e.target.value.split(',').map(s => s.trim()) }))} /></div>

                  <div className="form-group"><label className="form-label">Description *</label><textarea rows={3} style={{ ...iStyle, resize: 'vertical' } as any} value={courseForm.description ?? ''} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} required /></div>
                </div>
                <div className="panel-footer"><button type="button" className="btn btn-secondary" onClick={closePanel}>Cancel</button><button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Publish'}</button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
