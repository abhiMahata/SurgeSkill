import React from 'react';
import { useNavigate } from 'react-router-dom';

const BG = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80';

export const GatewayPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-panel" style={{ flex: '0 0 52%' }}>
        <div className="auth-panel-bg" style={{ backgroundImage: `url(${BG})` }} />
        <div
          className="auth-panel-overlay"
          style={{ background: 'linear-gradient(160deg, rgba(10,5,20,0.92) 0%, rgba(18,15,50,0.85) 60%, rgba(30,25,80,0.78) 100%)' }}
        />

        {/* Logo */}
        <div className="auth-panel-content">
          <div style={{ display: 'inline-block', background: '#fff', borderRadius: 10, padding: '8px 16px' }}>
            <img src="/logo.png" alt="SurgeSkills" style={{ height: 36, objectFit: 'contain', display: 'block' }} />
          </div>
        </div>

        {/* Copy */}
        <div className="auth-panel-content">
          <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
            Event Intelligence Platform
          </p>
          <h1 style={{ fontFamily: 'Inter', fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 20 }}>
            Master the art of<br />event orchestration.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 360 }}>
            The enterprise command center built for high-stakes event directors — precision analytics, seamless registration, and AI-powered insights.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 36, marginTop: 40 }}>
            {[['500+', 'Global Events'], ['40K+', 'Attendees'], ['98%', 'Satisfaction']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="auth-panel-content">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© 2026 SurgeSkills Inc.</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-form-side" style={{ flexDirection: 'column', gap: 0 }}>
        <div className="auth-form-wrap">
          {/* Logo */}
          <img src="/logo.png" alt="SurgeSkills" style={{ height: 44, objectFit: 'contain', marginBottom: 40 }} />

          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Choose your portal
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 32 }}>
            Select the portal that matches your role.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Attendee */}
            <button
              onClick={() => navigate('/login/user')}
              style={{
                width: '100%', textAlign: 'left', padding: '16px 18px',
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'border-color 150ms, box-shadow 150ms',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--accent)'; el.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.06)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-primary)' }}>person</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Attendee Portal</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Browse events, register, manage your schedule</div>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-muted)' }}>arrow_forward</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => navigate('/login/admin')}
              style={{
                width: '100%', textAlign: 'left', padding: '16px 18px',
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'border-color 150ms, box-shadow 150ms',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--accent)'; el.style.boxShadow = '0 0 0 3px rgba(10,10,10,0.06)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-primary)' }}>shield_person</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Admin Portal</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Create events, manage analytics, full control</div>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-muted)' }}>arrow_forward</span>
            </button>
          </div>

          {/* Demo hint */}
          <div className="info-box" style={{ marginTop: 24, marginBottom: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>info</span>
            <div>
              <strong>Demo:</strong> user@company.com / <code>user</code> &nbsp;|&nbsp; admin@company.com / <code>admin</code> &nbsp;·&nbsp; Key: <code>EC-ADM-2026</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
