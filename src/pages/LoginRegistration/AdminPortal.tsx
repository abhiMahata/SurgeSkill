import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const BG = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80';
type Tab = 'login' | 'register';

const iStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', fontSize: 14,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  background: '#fff', color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 120ms, box-shadow 120ms', boxSizing: 'border-box',
};
const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.07)'; };
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

export const AdminPortal: React.FC = () => {
  const { login, register, loginWithGoogle, showToast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [em, setEm] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('');
  const [rn, setRn] = useState(''); const [re, setRe] = useState(''); const [rp, setRp] = useState(''); const [rerr, setRerr] = useState('');
  const [expertise, setExpertise] = useState(''); const [org, setOrg] = useState(''); const [linkedin, setLinkedin] = useState('');

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(em, pw, 'mentor');
    if (res.success) { showToast('Welcome, Mentor.'); navigate('/dashboard/admin'); }
    else setErr(res.message);
  };
  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await register(rn, re, rp, 'mentor', { expertise, organization: org, linkedin });
    if (res.success) { showToast('Mentor account created.'); navigate('/dashboard/admin'); }
    else setRerr(res.message);
  };
  const doGoogle = async () => {
    const res = await loginWithGoogle('mentor');
    if (res.success) { showToast('Welcome!'); navigate('/dashboard/admin'); }
    else setErr(res.message);
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel" style={{ flex: '0 0 44%' }}>
        <div className="auth-panel-bg" style={{ backgroundImage: `url(${BG})` }} />
        <div className="auth-panel-overlay" style={{ background: 'linear-gradient(160deg,rgba(8,4,18,0.94) 0%,rgba(15,12,40,0.88) 55%,rgba(25,20,65,0.8) 100%)' }} />
        <div className="auth-panel-content"><div style={{ display: 'inline-block', background: '#fff', borderRadius: 10, padding: '8px 16px' }}><img src="/logo.png" alt="SurgeSkill" style={{ height: 36, objectFit: 'contain', display: 'block' }} /></div></div>
        <div className="auth-panel-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 'var(--radius-sm)', marginBottom: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#C4B5FD' }}>school</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C4B5FD', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mentor Access</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 16 }}>Inspire the next<br />generation.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Create courses, host hackathons, and guide students on their learning journey.</p>
        </div>
        <div className="auth-panel-content"><span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.22)' }}>© 2026 SurgeSkill Community</span></div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ marginBottom: 28, paddingLeft: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>Back
          </button>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>{tab === 'login' ? 'Mentor sign in' : 'Register as mentor'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Share your expertise with the SurgeSkill community.</p>
          </div>

          <div className="auth-tab-row">
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} className={`auth-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setErr(''); setRerr(''); }}>{t === 'login' ? 'Sign in' : 'Register'}</button>
            ))}
          </div>

          {/* Google Button */}
          <button onClick={doGoogle} style={{ width: '100%', padding: '9px', fontSize: 13.5, fontWeight: 500, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>or</div>

          {tab === 'login' && (
            <form onSubmit={doLogin} autoComplete="off">
              {err && <div className="error-box">{err}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group"><label className="form-label">Email</label><input style={iStyle} type="email" value={em} onChange={e => setEm(e.target.value)} onFocus={onFocus} onBlur={onBlur} required /></div>
                <div className="form-group"><label className="form-label">Password</label><input style={iStyle} type="password" value={pw} onChange={e => setPw(e.target.value)} onFocus={onFocus} onBlur={onBlur} required /></div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px', marginTop: 4 }}>Sign in</button>
              </div>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={doRegister} autoComplete="off">
              {rerr && <div className="error-box">{rerr}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group"><label className="form-label">Full Name *</label><input style={iStyle} type="text" value={rn} onChange={e => setRn(e.target.value)} onFocus={onFocus} onBlur={onBlur} required /></div>
                <div className="form-group"><label className="form-label">Email *</label><input style={iStyle} type="email" value={re} onChange={e => setRe(e.target.value)} onFocus={onFocus} onBlur={onBlur} required /></div>
                <div className="form-group"><label className="form-label">Password *</label><input style={iStyle} type="password" value={rp} onChange={e => setRp(e.target.value)} onFocus={onFocus} onBlur={onBlur} required minLength={4} /></div>
                <div className="form-group"><label className="form-label">Expertise / Specialization *</label><input style={iStyle} type="text" value={expertise} onChange={e => setExpertise(e.target.value)} onFocus={onFocus} onBlur={onBlur} required placeholder="e.g. Full-Stack Development, Machine Learning" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label className="form-label">Organization / College</label><input style={iStyle} type="text" value={org} onChange={e => setOrg(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. MIT Manipal" /></div>
                  <div className="form-group"><label className="form-label">LinkedIn (optional)</label><input style={iStyle} type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="https://linkedin.com/in/..." /></div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px', marginTop: 4 }}>Create mentor account</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
