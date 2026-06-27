import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const Communities: React.FC = () => {
  const { currentUser, communities, createCommunity, joinCommunity, leaveCommunity, showToast } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const iStyle: React.CSSProperties = { width: '100%', padding: '8px 11px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

  const myCollege = currentUser?.college;
  const collegeCommunities = communities.filter(c => c.type === 'college');
  const interestCommunities = communities.filter(c => c.type === 'interest');

  const filtered = (list: typeof communities) =>
    list.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.description || '').toLowerCase().includes(q.toLowerCase()));

  const isMember = (c: typeof communities[0]) => c.memberIds?.includes(currentUser?.id || '');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = await createCommunity({ name, description: desc, type: 'interest', createdBy: currentUser?.id || '', image: '' });
    showToast(`Created "${name}"`);
    setShowCreate(false); setName(''); setDesc('');
  };

  const CommunityCard = ({ c }: { c: typeof communities[0] }) => {
    const member = isMember(c);
    return (
      <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 6, background: c.type === 'college' ? 'linear-gradient(90deg, var(--blue), var(--purple))' : 'linear-gradient(90deg, var(--green), var(--blue))' }} />
        <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span className={`badge ${c.type === 'college' ? 'badge-blue' : 'badge-green'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{c.type === 'college' ? 'school' : 'interests'}</span>
              {c.type === 'college' ? 'College' : 'Interest'}
            </span>
            {member && <span className="badge badge-purple">Joined</span>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>{c.name}</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description || 'A community for members to connect and share.'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
              {c.memberIds?.length || 0} members
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {member ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/communities/${c.id}`)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chat</span>Open Chat
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => { leaveCommunity(c.id); showToast(`Left "${c.name}"`); }}>Leave</button>
                </>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={async () => {
                  await joinCommunity(c.id);
                  showToast(`Joined "${c.name}"!`);
                  navigate(`/communities/${c.id}`);
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>Join & Open
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 940 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Communities</h1>
          <p className="page-desc">Connect with peers from your college and interest groups.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          New Community
        </button>
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: 340, marginBottom: 20 }}>
        <span className="material-symbols-outlined ms" style={{ fontSize: 16 }}>search</span>
        <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search communities…" />
      </div>

      {/* ── Your College Communities ───────────────────────── */}
      {myCollege && (() => {
        const myCollegeCommunities = filtered(collegeCommunities).filter(
          c => c.college === myCollege || c.name.toLowerCase().includes(myCollege.toLowerCase())
        );
        if (myCollegeCommunities.length === 0) return null;
        return (
          <>
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                borderRadius: 6, padding: '3px 7px', fontSize: 11, color: '#fff', fontWeight: 700,
              }}>YOUR COLLEGE</span>
              {myCollege}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
              {myCollegeCommunities.map(c => <CommunityCard key={c.id} c={c} />)}
            </div>
          </>
        );
      })()}

      {/* College Communities */}
      {filtered(collegeCommunities).length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>school</span>All College Communities
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
            {filtered(collegeCommunities).map(c => <CommunityCard key={c.id} c={c} />)}
          </div>
        </>
      )}

      {/* Interest Communities */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>interests</span>Interest Communities
      </div>
      {filtered(interestCommunities).length === 0 ? (
        <div className="card"><div className="empty-state"><span className="material-symbols-outlined empty-icon">group_off</span><div className="empty-title">No communities yet</div><div className="empty-desc">Create one to start connecting with others.</div></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered(interestCommunities).map(c => <CommunityCard key={c.id} c={c} />)}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Create Community</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Start a new interest-based community.</p>
              <form onSubmit={handleCreate}>
                <div className="form-group" style={{ marginBottom: 14 }}><label className="form-label">Name *</label><input style={iStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Web Dev Enthusiasts" /></div>
                <div className="form-group" style={{ marginBottom: 20 }}><label className="form-label">Description</label><textarea rows={3} style={{ ...iStyle, resize: 'vertical' } as any} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this community about?" /></div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
