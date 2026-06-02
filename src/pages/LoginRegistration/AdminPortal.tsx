import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const BG = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80';
const ADMIN_KEY = 'EC-ADM-2026';
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

export const AdminPortal: React.FC = () => {
  const { login, register, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');

  const [em, setEm] = useState('admin@company.com');
  const [pw, setPw] = useState('admin');
  const [key, setKey] = useState('EC-ADM-2026');
  const [err, setErr] = useState('');

  const [rn, setRn] = useState('');
  const [re, setRe] = useState('');
  const [rp, setRp] = useState('');
  const [rk, setRk] = useState('');
  const [rerr, setRerr] = useState('');

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (key !== ADMIN_KEY) { setErr('Invalid admin authorization key.'); return; }
    const res = login(em, pw, 'admin');
    if (res.success) { showToast('Welcome, Administrator.'); navigate('/dashboard/admin'); }
    else setErr(res.message);
  };

  const doRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (rk !== ADMIN_KEY) { setRerr('Invalid admin authorization key.'); return; }
    const res = register(rn, re, rp, 'admin');
    if (res.success) { showToast('Admin account created.'); navigate('/dashboard/admin'); }
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-sm)', marginBottom: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#FCA5A5' }}>lock</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#FCA5A5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Restricted</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 16 }}>
            Executive<br />command centre.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Full platform control for event directors. Valid authorization required.
          </p>
        </div>
        <div className="auth-panel-content">
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.22)' }}>© 2026 SurgeSkills Inc.</span>
        </div>
      </div>

      {/* Right */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <button onClick={() => navigate('/gateway')} className="btn btn-ghost btn-sm" style={{ marginBottom: 28, paddingLeft: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back
          </button>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              {tab === 'login' ? 'Admin sign in' : 'Create admin account'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Authorization key required for access.</p>
          </div>

          <div className="warn-box">
            <span className="material-symbols-outlined" style={{ fontSize: 15, flexShrink: 0 }}>warning</span>
            This portal is restricted to authorized administrators only.
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
                <div className="form-group">
                  <label className="form-label">Authorization Key</label>
                  <input style={{ ...iStyle, fontFamily: 'monospace', letterSpacing: '0.05em' }} type="text" value={key} onChange={e => setKey(e.target.value)} onFocus={onFocus} onBlur={onBlur} required placeholder="EC-ADM-XXXX" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px', marginTop: 4 }}>
                  Access admin console
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
                <div className="form-group">
                  <label className="form-label">Authorization Key</label>
                  <input style={{ ...iStyle, fontFamily: 'monospace' }} type="text" value={rk} onChange={e => setRk(e.target.value)} onFocus={onFocus} onBlur={onBlur} required placeholder="EC-ADM-XXXX" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px', marginTop: 4 }}>
                  Create admin account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
