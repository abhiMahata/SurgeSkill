import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

const BG = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80';

const iStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: '#fff', color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 120ms, box-shadow 120ms', boxSizing: 'border-box',
};
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--text-primary)';
  e.target.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.07)';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow = 'none';
};

type Tab = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const { login, register, loginWithGoogle, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [em, setEm] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Register state
  const [rn, setRn]         = useState('');
  const [re, setRe]         = useState('');
  const [rp, setRp]         = useState('');
  const [role, setRole]     = useState<UserRole>('student');
  const [college, setCollege] = useState('');
  const [dept, setDept]     = useState('');
  const [rerr, setRerr]     = useState('');
  const [rloading, setRloading] = useState(false);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await login(em, pw);
    setLoading(false);
    if (res.success) {
      showToast('Welcome back!');
      // admin intercept routes to admin dashboard
      if (em.trim().toLowerCase() === 'admin@surgeskill.com') navigate('/dashboard/admin');
      else navigate('/dashboard/user');
    } else {
      setErr(res.message);
    }
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRloading(true); setRerr('');
    const res = await register(rn, re, rp, role, { college, department: dept });
    setRloading(false);
    if (res.success) { showToast('Account created! Welcome to SurgeSkill.'); navigate('/dashboard/user'); }
    else setRerr(res.message);
  };

  const doGoogle = async () => {
    const res = await loginWithGoogle();
    if (res.success) { showToast('Welcome!'); navigate('/dashboard/user'); }
    else setErr(res.message);
  };

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-panel" style={{ flex: '0 0 52%' }}>
        <div className="auth-panel-bg" style={{ backgroundImage: `url(${BG})` }} />
        <div className="auth-panel-overlay"
          style={{ background: 'linear-gradient(160deg, rgba(8,4,22,0.95) 0%, rgba(14,10,45,0.88) 55%, rgba(22,16,70,0.80) 100%)' }}
        />

        <div className="auth-panel-content">
          <div style={{ display: 'inline-block', background: '#fff', borderRadius: 10, padding: '8px 16px' }}>
            <img src="/logo.png" alt="SurgeSkill" style={{ height: 36, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>

        <div className="auth-panel-content">
          <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
            Student-Led Learning Community
          </p>
          <h1 style={{ fontFamily: 'Inter', fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 20 }}>
            Learn, teach, and<br />grow together.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 360 }}>
            A community-driven platform connecting mentors and students through courses, events, and collaborative learning.
          </p>

          <div style={{ display: 'flex', gap: 36, marginTop: 40 }}>
            {[['200+', 'Active Courses'], ['5K+', 'Students'], ['150+', 'Mentors']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-panel-content">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 SurgeSkill Inc.</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <img src="/logo.png" alt="SurgeSkill" style={{ height: 40, objectFit: 'contain', marginBottom: 32 }} />

          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome back' : 'Join SurgeSkill'}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 }}>
            {tab === 'login' ? 'Sign in to your account to continue.' : 'Create your free account today.'}
          </p>

          {/* Tabs */}
          <div className="auth-tab-row" style={{ marginBottom: 20 }}>
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                className={`auth-tab ${tab === t ? 'active' : ''}`}
                onClick={() => { setTab(t); setErr(''); setRerr(''); }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={doGoogle}
            style={{
              width: '100%', padding: '9px', fontSize: 13.5, fontWeight: 500,
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              background: '#fff', color: 'var(--text-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 16, transition: 'border-color 120ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>or</div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={doLogin} autoComplete="off">
              {err && <div className="error-box" style={{ marginBottom: 14 }}>{err}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input style={iStyle} type="email" value={em} onChange={e => setEm(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input style={iStyle} type="password" value={pw} onChange={e => setPw(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required />
                </div>
                <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
                  disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={doRegister} autoComplete="off">
              {rerr && <div className="error-box" style={{ marginBottom: 14 }}>{rerr}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input style={iStyle} type="text" value={rn} onChange={e => setRn(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input style={iStyle} type="email" value={re} onChange={e => setRe(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input style={iStyle} type="password" value={rp} onChange={e => setRp(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required minLength={4} />
                </div>
                <div className="form-group">
                  <label className="form-label">I am joining as *</label>
                  <select style={iStyle} value={role} onChange={e => setRole(e.target.value as UserRole)}
                    onFocus={onFocus as any} onBlur={onBlur as any}>
                    <option value="student">Student — I want to learn</option>
                    <option value="mentor">Mentor — I want to teach</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">College / Organization</label>
                    <input style={iStyle} type="text" value={college} onChange={e => setCollege(e.target.value)}
                      onFocus={onFocus as any} onBlur={onBlur as any} placeholder="e.g. MIT Manipal" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input style={iStyle} type="text" value={dept} onChange={e => setDept(e.target.value)}
                      onFocus={onFocus as any} onBlur={onBlur as any} placeholder="e.g. CSE" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
                  disabled={rloading}>
                  {rloading ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
