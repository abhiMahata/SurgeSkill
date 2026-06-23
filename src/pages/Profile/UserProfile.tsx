import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

// ── IMPORTANT: Field defined OUTSIDE component to prevent remount on every keystroke ──
const iStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: '#fff', color: 'var(--text-primary)',
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
          background: disabled ? 'var(--bg)' : '#fff',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

// ── Component ──
export const UserProfile: React.FC = () => {
  const { currentUser, updateProfile, showToast } = useApp();

  const [name, setName]   = useState(currentUser?.name ?? '');
  const [desig, setDesig] = useState(currentUser?.designation ?? '');
  
  // Student fields
  const [college, setCollege] = useState(currentUser?.college ?? currentUser?.organization ?? '');
  const [dept, setDept]       = useState(currentUser?.department ?? '');
  const [year, setYear]       = useState(currentUser?.yearOfStudy ?? '');
  const [phone, setPhone]     = useState(currentUser?.phone ?? '');
  
  // Mentor fields
  const [org, setOrg]         = useState(currentUser?.organization ?? '');
  const [expertise, setExpertise] = useState(currentUser?.expertise ?? '');
  const [linkedin, setLinkedin]   = useState(currentUser?.linkedin ?? '');

  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');

  if (!currentUser) return null;

  const saveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    let data: any = { name, designation: desig };
    if (currentUser.role === 'student') {
      data = { ...data, college, organization: college, department: dept, yearOfStudy: year, phone };
    } else {
      data = { ...data, organization: org, expertise, linkedin };
    }
    const ok = updateProfile(data);
    if (ok) showToast('Profile updated');
  };

  const savePw = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confPw) { alert('Passwords do not match.'); return; }
    const ok = updateProfile({ password: newPw });
    if (ok) { showToast('Password updated'); setNewPw(''); setConfPw(''); }
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
          <img
            src={currentUser.photoURL || (currentUser.role === 'admin' || currentUser.role === 'mentor'
              ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=3&w=128&h=128'
              : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=3&w=128&h=128')}
            alt={currentUser.name}
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', marginBottom: 12 }}
          />
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{currentUser.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 4 }}>{currentUser.designation}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{currentUser.organization}</div>
          <span className={`badge ${currentUser.role === 'admin' ? 'badge-black' : currentUser.role === 'mentor' ? 'badge-purple' : 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>
            {currentUser.role}
          </span>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>Account</div>
            {[
              { l: 'Email',      v: currentUser.email },
              { l: 'User ID',    v: currentUser.id },
              { l: 'Communities',v: `${currentUser.joinedCommunities?.length || 0} joined` },
            ].map(r => (
              <div key={r.l} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{r.l}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-all' }}>{r.v}</div>
              </div>
            ))}
          </div>
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
                  
                  {currentUser.role === 'student' ? (
                    <>
                      <Field label="College / University" value={college} onChange={setCollege} autoComplete="off" />
                      <Field label="Department" value={dept} onChange={setDept} autoComplete="off" />
                      <Field label="Year of Study" value={year} onChange={setYear} autoComplete="off" placeholder="e.g. 3rd Year" />
                      <Field label="Phone" value={phone} onChange={setPhone} autoComplete="off" type="tel" />
                    </>
                  ) : (
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

          {/* Password */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Password & Security</div>
                <div className="card-subtitle">Update your account password</div>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={savePw} autoComplete="off">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <Field label="New Password"     type="password" value={newPw}   onChange={setNewPw}   minLength={4} placeholder="Min. 4 characters" autoComplete="new-password" />
                  <Field label="Confirm Password" type="password" value={confPw}  onChange={setConfPw}  minLength={4} placeholder="Repeat password"    autoComplete="new-password" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">Update password</button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
