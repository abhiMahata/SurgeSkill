import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

/* ── Inline styles for the toggle switch ── */
const toggleTrack = (on: boolean): React.CSSProperties => ({
  position: 'relative', display: 'inline-flex', alignItems: 'center',
  width: 44, height: 24, borderRadius: 9999,
  background: on ? '#18181B' : 'var(--border)',
  cursor: 'pointer', transition: 'background 200ms', flexShrink: 0,
  border: '1px solid ' + (on ? '#3d3d3d' : 'var(--border-strong)'),
});
const toggleThumb = (on: boolean): React.CSSProperties => ({
  position: 'absolute', top: 2,
  left: on ? 20 : 2,
  width: 18, height: 18, borderRadius: '50%',
  background: on ? '#fff' : 'var(--text-muted)',
  transition: 'left 200ms, background 200ms',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
});

// ── IMPORTANT: Field defined OUTSIDE component to prevent remount on every keystroke ──
const iStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 120ms, box-shadow 120ms',
  boxSizing: 'border-box',
};

const onF = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--text-primary)';
  e.target.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.07)';
};
const onB = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow = 'none';
};

interface FProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
}

function Field({ label, value, onChange, type = 'text', disabled, placeholder, minLength, autoComplete }: FProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={disabled ? undefined : onF}
        onBlur={disabled ? undefined : onB}
        disabled={disabled}
        placeholder={placeholder}
        minLength={minLength}
        autoComplete={autoComplete}
        required={!disabled}
        style={{
          ...iStyle,
          background: disabled ? 'var(--bg)' : 'var(--surface)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

// ── Component ──
export const UserProfile: React.FC = () => {
  const { currentUser, updateProfile, showToast, theme, setTheme, myMemberships } = useApp();

  const [name, setName]   = useState(currentUser?.name ?? '');
  const [desig, setDesig] = useState(currentUser?.designation ?? '');
  
  // Student fields — none editable post-onboarding (set once, locked)
  // Mentor fields
  const [org, setOrg]             = useState(currentUser?.organization ?? '');
  const [expertise, setExpertise] = useState(currentUser?.expertise   ?? '');
  const [linkedin, setLinkedin]   = useState(currentUser?.linkedin     ?? '');



  if (!currentUser) return null;

  const saveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    let data: any = { name, designation: desig };
    if (currentUser.role !== 'student') {
      data = { ...data, organization: org, expertise, linkedin };
    }
    const ok = updateProfile(data);
    if (ok) showToast('Profile updated');
  };



  return (
    <div style={{ maxWidth: 780 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">Manage your account, profile, and security settings.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left — identity */}
        <div className="card" style={{ padding: '24px 20px', textAlign: 'center', position: 'sticky', top: 68 }}>
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.name}
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', marginBottom: 12 }}
            />
          ) : (
            <div style={{
              width: 64, height: 64, borderRadius: '50%', marginBottom: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
              border: '2px solid var(--border)', flexShrink: 0,
            }}>
              {currentUser.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{currentUser.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 4 }}>{currentUser.designation}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{currentUser.organization}</div>
          <span className={`badge ${(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COLLEGE_ADMIN' || currentUser.role === 'admin') ? 'badge-black' : currentUser.role === 'mentor' ? 'badge-purple' : 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>
            {currentUser.role}
          </span>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>Account</div>

            {/* Email */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-all' }}>{currentUser.email}</div>
            </div>

            {/* Member Tag — copyable */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Member Tag</div>
              <button
                title="Click to copy your Member ID"
                onClick={() => {
                  navigator.clipboard.writeText(currentUser.id).then(() => showToast('Member ID copied!'));
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '5px 9px', cursor: 'pointer',
                  transition: 'border-color 120ms', width: '100%',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>badge</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  #{currentUser.id.slice(0, 10).toUpperCase()}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>content_copy</span>
              </button>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                Unique across all of SurgeSkill
              </div>
            </div>

            {/* Communities joined */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Communities</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{Object.keys(myMemberships).filter(k => myMemberships[k].status === 'ACTIVE').length} joined</div>
            </div>
          </div>

          {/* Location — set during onboarding, locked */}
          {(currentUser.country || currentUser.college) && (
            <div style={{ marginTop: 4, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Location</div>
                <span title="Set during onboarding — cannot be changed" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--text-muted)' }}>lock</span>
                </span>
              </div>
              {[
                { l: 'Country',     v: currentUser.country },
                { l: 'State',       v: currentUser.state },
                { l: 'City',        v: currentUser.city },
                { l: 'Institution', v: currentUser.college },
              ].filter(r => r.v).map(r => (
                <div key={r.l} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{r.l}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{r.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Right — forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Personal info */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Personal Information</div>
                <div className="card-subtitle">Update your profile details</div>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={saveInfo} autoComplete="off">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <Field label="Full Name"    value={name}  onChange={setName}  autoComplete="off" />
                  <Field label="Email"        value={currentUser.email} onChange={() => {}} disabled />
                  
                  {currentUser.role !== 'student' && (
                    <>
                      <Field label="Designation"  value={desig} onChange={setDesig} autoComplete="off" />
                      <Field label="Organization" value={org}   onChange={setOrg}   autoComplete="off" />
                      <Field label="Expertise" value={expertise} onChange={setExpertise} autoComplete="off" placeholder="e.g. Full-Stack Dev" />
                      <Field label="LinkedIn" value={linkedin} onChange={setLinkedin} autoComplete="off" type="url" />
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Save changes</button>
                </div>
              </form>
            </div>
          </div>

          {/* Preferences — dark mode */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Preferences</div>
                <div className="card-subtitle">Customize your visual experience</div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: theme === 'dark' ? '#1a1a2e' : 'var(--bg)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: theme === 'dark' ? '#a78bfa' : 'var(--text-muted)' }}>
                      {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Dark Mode</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                      {theme === 'dark' ? 'Dark theme is active' : 'Switch to dark theme'}
                    </div>
                  </div>
                </div>
                <button
                  id="dark-mode-toggle"
                  role="switch"
                  aria-checked={theme === 'dark'}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  style={toggleTrack(theme === 'dark')}
                >
                  <span style={toggleThumb(theme === 'dark')} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
