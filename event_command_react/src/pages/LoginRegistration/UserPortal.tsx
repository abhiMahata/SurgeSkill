import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const BG = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

type Tab = 'login' | 'register';

const iStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: '#fff', color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 120ms, box-shadow 120ms',
  boxSizing: 'border-box',
};

const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--text-primary)';
  e.target.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.07)';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow = 'none';
};

export const UserPortal: React.FC = () => {
  const { login, register, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');

  const [em, setEm] = useState('user@company.com');
  const [pw, setPw] = useState('user');
  const [err, setErr] = useState('');

  const [rn, setRn] = useState('');
  const [re, setRe] = useState('');
  const [rp, setRp] = useState('');
  const [rerr, setRerr] = useState('');

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(em, pw, 'user');
    if (res.success) { showToast('Welcome back!'); navigate('/dashboard/user'); }
    else setErr(res.message);
  };

  const doRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const res = register(rn, re, rp, 'user');
    if (res.success) { showToast('Account created!'); navigate('/dashboard/user'); }
    else setRerr(res.message);
  };

  return (
    <div className="auth-layout">
      {/* Left */}
      <div className="auth-panel" style={{ flex: '0 0 44%' }}>
        <div className="auth-panel-bg" style={{ backgroundImage: `url(${BG})` }} />
        <div className="auth-panel-overlay" style={{ background: 'linear-gradient(160deg,rgba(8,4,18,0.94) 0%,rgba(15,12,40,0.88) 55%,rgba(25,20,65,0.8) 100%)' }} />
        <div className="auth-panel-content">
          <div style={{ display: 'inline-block', background: '#fff', borderRadius: 10, padding: '8px 16px' }}>
            <img src="/logo.png" alt="SurgeSkills" style={{ height: 36, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
        <div className="auth-panel-content">
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Attendee Portal</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 16 }}>
            Your events,<br/>your schedule.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Discover conferences, workshops, and networking events curated for your professional growth.
          </p>
        </div>
        <div className="auth-panel-content">
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.22)' }}>© 2026 SurgeSkills Inc.</span>
        </div>
      </div>

      {/* Right */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ marginBottom: 28, paddingLeft: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back
          </button>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              {tab === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {tab === 'login' ? 'Attendee access to SurgeSkills.' : 'Register as a new attendee.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="auth-tab-row">
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} className={`auth-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setErr(''); setRerr(''); }}>
                {t === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          {tab === 'login' && (
            <form onSubmit={doLogin} autoComplete="off">
              {err && <div className="error-box">{err}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input style={iStyle} type="email" value={em} onChange={e => setEm(e.target.value)} onFocus={onFocus} onBlur={onBlur} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input style={iStyle} type="password" value={pw} onChange={e => setPw(e.target.value)} onFocus={onFocus} onBlur={onBlur} required autoComplete="current-password" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px', marginTop: 4 }}>
                  Sign in to dashboard
                </button>
              </div>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={doRegister} autoComplete="off">
              {rerr && <div className="error-box">{rerr}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input style={iStyle} type="text" value={rn} onChange={e => setRn(e.target.value)} onFocus={onFocus} onBlur={onBlur} required autoComplete="name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input style={iStyle} type="email" value={re} onChange={e => setRe(e.target.value)} onFocus={onFocus} onBlur={onBlur} required autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input style={iStyle} type="password" value={rp} onChange={e => setRp(e.target.value)} onFocus={onFocus} onBlur={onBlur} required minLength={4} autoComplete="new-password" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px', marginTop: 4 }}>
                  Create account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
