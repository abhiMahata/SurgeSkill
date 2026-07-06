import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { Community } from '../../context/AppContext';
import { COUNTRIES, getStates, getCities, getColleges } from '../../utils/locationData';

const iStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};

export const Communities: React.FC = () => {
  const { currentUser, communities, createCommunity, joinCommunity, leaveCommunity, showToast } = useApp();
  const navigate = useNavigate();

  const [q, setQ]                   = useState('');
  const [showCreate, setShowCreate]  = useState(false);
  const [name, setName]             = useState('');
  const [desc, setDesc]             = useState('');
  const [type, setType]             = useState<'college' | 'interest'>('college');
  const [creating, setCreating]     = useState(false);

  // College cascade for community creation
  const [cCountry,  setCCountry]  = useState('India');
  const [cState,    setCState]    = useState('');
  const [cCity,     setCCity]     = useState('');
  const [cCollege,  setCCollege]  = useState('');

  const cStates   = getStates(cCountry);
  const cCities   = cState   ? getCities(cCountry, cState)           : [];
  const cColleges = cCity    ? getColleges(cCountry, cState, cCity)  : [];

  const isAdmin     = currentUser?.role === 'admin';
  const myCollege   = currentUser?.college ?? '';

  /* ── Visibility filter ──────────────────────────────────────────────────
     College communities: only show to users whose college matches (admins see all).
     Interest communities: visible to everyone.
  ──────────────────────────────────────────────────────────────────────── */
  const visibleCommunities = communities.filter(c => {
    if (c.type === 'college' && c.college && !isAdmin) {
      return c.college === myCollege;
    }
    return true;
  });

  const filtered = (list: Community[]) =>
    list.filter(c =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(q.toLowerCase())
    );

  const myCollegeCommunities  = filtered(visibleCommunities.filter(c => c.type === 'college' && (!c.college || c.college === myCollege)));
  const otherCollegeCommunities = isAdmin
    ? filtered(visibleCommunities.filter(c => c.type === 'college' && c.college && c.college !== myCollege))
    : [];
  const interestCommunities   = filtered(visibleCommunities.filter(c => c.type === 'interest'));

  const isMember = (c: Community) => c.memberIds?.includes(currentUser?.id || '');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (type === 'college' && !cCollege.trim()) {
      showToast('Please select a college from the dropdown.');
      return;
    }
    setCreating(true);
    try {
      await createCommunity({
        name: name.trim(),
        description: desc.trim(),
        type,
        college: type === 'college' ? cCollege.trim() : undefined,
        createdBy: currentUser?.id || '',
        image: '',
      });
      showToast(`Community "${name}" created!`);
      setShowCreate(false);
      setName(''); setDesc(''); setType('college');
      setCCountry('India'); setCState(''); setCCity(''); setCCollege('');
    } catch (err: any) {
      showToast(err.message || 'Failed to create community.');
    }
    setCreating(false);
  };

  /* ── Community Card ───────────────────────────────────────────────────── */
  const CommunityCard = ({ c }: { c: Community }) => {
    const member = isMember(c);
    const isCollege = c.type === 'college';
    const accentGrad = isCollege
      ? 'linear-gradient(90deg, #2563EB, #7C3AED)'
      : 'linear-gradient(90deg, #16A34A, #2563EB)';

    return (
      <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 5, background: accentGrad }} />
        <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Badges row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <span className={`badge ${isCollege ? 'badge-blue' : 'badge-green'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                {isCollege ? 'school' : 'interests'}
              </span>
              {isCollege ? 'College' : 'Interest'}
            </span>
            {c.college && (
              <span className="badge badge-gray" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>location_city</span>
                {c.college}
              </span>
            )}
            {member && <span className="badge badge-purple">Joined</span>}
          </div>

          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {c.name}
          </div>
          <p style={{
            fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {c.description || 'A community for members to connect and share.'}
          </p>

          {/* Footer row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
              {c.memberIds?.length || 0} members
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {member ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/communities/${c.id}`)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>forum</span>
                    Open Chat
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--red)' }}
                    onClick={() => { leaveCommunity(c.id); showToast(`Left "${c.name}"`); }}
                  >
                    Leave
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    await joinCommunity(c.id);
                    showToast(`Joined "${c.name}"!`);
                    navigate(`/communities/${c.id}`);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>
                  Join & Open
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── Section renderer ─────────────────────────────────────────────────── */
  const Section = ({ title, icon, list }: { title: string; icon: string; list: Community[] }) => {
    if (list.length === 0) return null;
    return (
      <>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
          {title}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
          {list.map(c => <CommunityCard key={c.id} c={c} />)}
        </div>
      </>
    );
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 960 }}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Communities</h1>
          <p className="page-desc">
            {myCollege
              ? `Showing communities for ${myCollege} and open interest groups.`
              : 'Connect with peers across interest groups.'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            New Community
          </button>
        )}
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: 340, marginBottom: 24 }}>
        <span className="material-symbols-outlined ms" style={{ fontSize: 16 }}>search</span>
        <input className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search communities…" />
      </div>

      {/* Non-admin notice when no college set */}
      {!myCollege && !isAdmin && (
        <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--amber)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
          College communities are only visible after completing onboarding with your institution.
        </div>
      )}

      {/* Your college communities */}
      <Section
        title={myCollege ? `${myCollege} — Your College` : 'College Communities'}
        icon="school"
        list={myCollegeCommunities}
      />

      {/* Admin: other college communities */}
      {isAdmin && otherCollegeCommunities.length > 0 && (
        <Section title="Other College Communities" icon="corporate_fare" list={otherCollegeCommunities} />
      )}

      {/* Interest communities */}
      <Section title="Interest Communities" icon="interests" list={interestCommunities} />

      {/* Empty state */}
      {myCollegeCommunities.length === 0 && interestCommunities.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">group_off</span>
            <div className="empty-title">No communities yet</div>
            <div className="empty-desc">
              {isAdmin ? 'Create the first community using the button above.' : 'Ask your admin to create communities for your college.'}
            </div>
          </div>
        </div>
      )}

      {/* Create modal — admin only */}
      {showCreate && isAdmin && (
        <div className="overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Create Community</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Set up a college-specific or interest-based community.
              </p>

              <form onSubmit={handleCreate}>
                {/* Type selector */}
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Type *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['college', 'interest'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        style={{
                          flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600,
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          border: `1px solid ${type === t ? 'var(--blue)' : 'var(--border)'}`,
                          background: type === t ? 'var(--blue-light)' : 'var(--surface)',
                          color: type === t ? 'var(--blue)' : 'var(--text-secondary)',
                          transition: 'all 120ms',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                          {t === 'college' ? 'school' : 'interests'}
                        </span>
                        {t === 'college' ? 'College' : 'Interest'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* College cascade — only for college type */}
                {type === 'college' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>school</span>
                      Select College *
                    </div>

                    {/* Country */}
                    <select style={iStyle} value={cCountry} onChange={e => { setCCountry(e.target.value); setCState(''); setCCity(''); setCCollege(''); }}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* State */}
                    {cStates.length > 0 && (
                      <select style={iStyle} value={cState} onChange={e => { setCState(e.target.value); setCCity(''); setCCollege(''); }}>
                        <option value="">Select state…</option>
                        {cStates.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}

                    {/* City */}
                    {cState && cCities.length > 0 && (
                      <select style={iStyle} value={cCity} onChange={e => { setCCity(e.target.value); setCCollege(''); }}>
                        <option value="">Select city…</option>
                        {cCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}

                    {/* College */}
                    {cCity && cColleges.length > 0 && (
                      <select style={iStyle} value={cCollege} onChange={e => setCCollege(e.target.value)}>
                        <option value="">Select college…</option>
                        {cColleges.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Other">Other (not listed)</option>
                      </select>
                    )}
                    {cCollege === 'Other' && (
                      <input
                        style={iStyle}
                        placeholder="Type college name exactly as students will enter it"
                        onChange={e => setCCollege(e.target.value === '' ? 'Other' : e.target.value)}
                      />
                    )}

                    {cCollege && cCollege !== 'Other' && (
                      <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                        Only students from <strong>&nbsp;{cCollege}&nbsp;</strong> will see this community.
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Community Name *</label>
                  <input style={iStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. CSE Batch 2025" />
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    style={{ ...iStyle, resize: 'vertical' } as any}
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="What is this community about?"
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Creating…' : 'Create Community'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
