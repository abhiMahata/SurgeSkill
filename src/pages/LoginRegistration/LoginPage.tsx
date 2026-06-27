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
  e.target.style.boxShadow   = '0 0 0 3px rgba(10,10,10,0.07)';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow   = 'none';
};

/** Returns strength 0-4 and a label */
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const clamp = Math.min(score, 4);
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  return { score: clamp, label: labels[clamp], color: colors[clamp] };
}

type Tab = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const { login, register, loginWithGoogle, forgotPassword, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [em, setEm]           = useState('');
  const [pw, setPw]           = useState('');
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotMsg, setForgotMsg]       = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Register state (minimal — onboarding collects the rest)
  const [re, setRe]             = useState('');
  const [rp, setRp]             = useState('');
  const [rpc, setRpc]           = useState('');
  const [rerr, setRerr]         = useState('');
  const [rloading, setRloading] = useState(false);

  const strength = passwordStrength(rp);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await login(em, pw);
    setLoading(false);
    if (res.success) {
      showToast('Welcome back!');
      if (em.trim().toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL as string || '').toLowerCase()) {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/user');
      }
    } else {
      setErr(res.message);
    }
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rp !== rpc) { setRerr('Passwords do not match.'); return; }
    if (rp.length < 8) { setRerr('Password must be at least 8 characters.'); return; }
    setRloading(true); setRerr('');
    const res = await register(re, rp);
    setRloading(false);
    if (res.success) { showToast('Account created! Complete your profile to get started.'); navigate('/dashboard/user'); }
    else setRerr(res.message);
  };

  const doGoogle = async () => {
    const res = await loginWithGoogle();
    if (res.success) { showToast('Welcome!'); navigate('/dashboard/user'); }
    else setErr(res.message);
  };

  const doForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true); setForgotMsg('');
    const res = await forgotPassword(forgotEmail);
    setForgotLoading(false);
    setForgotMsg(res.message);
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
          <img
            src="/logo.png"
            alt="SurgeSkill"
            style={{ height: 52, objectFit: 'contain', display: 'block', mixBlendMode: 'screen' }}
          />
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
          <div style={{ marginTop: 40, padding: '16px 20px', background: 'rgba(255,255,255,0.07)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', maxWidth: 360 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              🚀 Built for students and mentors. Create your free account and start connecting with your college community today.
            </p>
          </div>
        </div>
        <div className="auth-panel-content">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 SurgeSkill Inc.</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <img src="/logo.png" alt="SurgeSkill" style={{ height: 36, objectFit: 'contain', marginBottom: 32 }} />

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
            id="btn-google-signin"
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
            <form id="form-login" onSubmit={doLogin} autoComplete="off">
              {err && <div className="error-box" style={{ marginBottom: 14 }}>{err}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input id="input-login-email" style={iStyle} type="email" value={em} onChange={e => setEm(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input id="input-login-password" style={iStyle} type="password" value={pw} onChange={e => setPw(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required />
                </div>
                <div style={{ textAlign: 'right', marginTop: -8 }}>
                  <button type="button" onClick={() => { setShowForgot(true); setForgotMsg(''); setForgotEmail(em); }}
                    style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Forgot password?
                  </button>
                </div>
                <button id="btn-login-submit" type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
                  disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* Register form — minimal, onboarding collects the rest */}
          {tab === 'register' && (
            <form id="form-register" onSubmit={doRegister} autoComplete="off">
              {rerr && <div className="error-box" style={{ marginBottom: 14 }}>{rerr}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input id="input-reg-email" style={iStyle} type="email" value={re} onChange={e => setRe(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 8 chars)</span></label>
                  <input id="input-reg-password" style={iStyle} type="password" value={rp} onChange={e => setRp(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required minLength={8} />
                  {rp.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99,
                            background: i <= strength.score ? strength.color : 'var(--border)',
                            transition: 'background 0.2s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input id="input-reg-confirm" style={{
                    ...iStyle, borderColor: rpc && rpc !== rp ? '#ef4444' : undefined,
                  }} type="password" value={rpc} onChange={e => setRpc(e.target.value)}
                    onFocus={onFocus as any} onBlur={onBlur as any} required minLength={8} />
                  {rpc && rpc !== rp && (
                    <span style={{ fontSize: 11, color: '#ef4444' }}>Passwords don't match</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, lineHeight: 1.5 }}>
                  ✨ After registering, you'll complete a quick setup to personalize your experience.
                </div>
                <button id="btn-register-submit" type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
                  disabled={rloading}>
                  {rloading ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password modal */}
      {showForgot && (
        <div className="overlay" onClick={() => setShowForgot(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Reset Password</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={doForgot}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input id="input-forgot-email" style={iStyle} type="email" value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" required />
                  {forgotMsg && (
                    <div style={{ fontSize: 13, color: forgotMsg.includes('sent') ? '#16a34a' : '#ef4444', fontWeight: 500 }}>
                      {forgotMsg}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForgot(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                      {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

