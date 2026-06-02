import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/gateway');
  };

  return (
    <div className="lp-container">
      {/* Header */}
      <header className="lp-header animate-fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
            <img src="/logo.png" alt="SurgeSkills" style={{ height: 26, objectFit: 'contain' }} />
          </div>
        </div>
        <nav className="lp-nav-links">
          <a href="#about" className="lp-nav-link">About</a>
          <a href="#offerings" className="lp-nav-link">Offerings</a>
          <a href="#tech-stack" className="lp-nav-link">Tech Stack</a>
          <button onClick={handleGetStarted} className="btn btn-secondary btn-sm">
            Choose Portal
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-badge animate-fade-in-up delay-100">
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#7C3AED' }}>auto_awesome</span>
          Next-Gen Event Management
        </div>
        <h1 className="lp-title animate-fade-in-up delay-200">
          Orchestrate high-impact events with <span className="lp-title-gradient">SurgeSkills</span>
        </h1>
        <p className="lp-subtitle animate-fade-in-up delay-300">
          The ultimate event intelligence platform built for event coordinators, administrators, and professional attendees. Experience precision management and AI-guided schedules.
        </p>
        <div className="animate-fade-in-up delay-400" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={handleGetStarted} className="btn btn-primary btn-lg" style={{ background: '#7C3AED', border: '1px solid #7C3AED', color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
            Get Started
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
          <a href="#offerings" className="btn btn-secondary btn-lg">
            Learn More
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="lp-section animate-fade-in-up delay-400" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="lp-section-title">What is SurgeSkills?</div>
        <p className="lp-section-subtitle">
          SurgeSkills is an enterprise-ready dashboard application designed to coordinate events, sessions, speakers, and registrations in real time. We streamline communication between attendees and admins through clean interactive tools.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '36px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ flex: '1 1 350px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 20, marginBottom: 12, fontWeight: 700 }}>Built for Scale and Speed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
              Traditional event software is slow, cluttered, and difficult to customize. SurgeSkills changes that by offering distinct portal experiences for attendees and staff alike, coupled with advanced search, calendars, and AI recommendations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Separate Attendee Hub and Admin Console views',
                'Dynamic, interactive schedule calendar feeds',
                'Advanced AI integration for custom session planning',
                'High-performance design system with 12ms latency'
              ].map(text => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#7C3AED', fontSize: 15 }}>check_circle</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(37,99,235,0.03) 100%)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '28px', width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#7C3AED', marginBottom: 8, letterSpacing: '0.05em' }}>Realtime Metrics</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#6D28D9', marginBottom: 4, letterSpacing: '-0.04em' }}>12ms</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>Database fetch and rendering latency</div>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 18 }} />
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>99.9%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Uptime SLA</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>500+</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Global Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section id="offerings" className="lp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="lp-section-title">What We Offer</div>
        <p className="lp-section-subtitle">A centralized workspace with tailored interfaces to orchestrate every stage of the event lifecycle.</p>

        <div className="lp-grid">
          <div className="lp-card">
            <div className="lp-card-icon">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="lp-card-title">Attendee Hub</div>
            <p className="lp-card-desc">
              Search and register for professional workshops, view customized schedule timelines, export details to your personal calendar, and edit profile details seamlessly.
            </p>
          </div>

          <div className="lp-card">
            <div className="lp-card-icon">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div className="lp-card-title">Admin Console</div>
            <p className="lp-card-desc">
              Manage complete events catalogs, edit sessions, modify registration parameters, audit attendee capacity levels, and dispatch real-time system notifications.
            </p>
          </div>

          <div className="lp-card">
            <div className="lp-card-icon">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div className="lp-card-title">Nexus AI Intelligence</div>
            <p className="lp-card-desc">
              An intelligent assistant to check session schedules, draft event proposals, identify room conflicts, and match attendees to optimal tracks automatically.
            </p>
          </div>

          <div className="lp-card">
            <div className="lp-card-icon">
              <span className="material-symbols-outlined">dashboard</span>
            </div>
            <div className="lp-card-title">Edge Dashboard</div>
            <p className="lp-card-desc">
              Elegant layouts showing upcoming events, stats strips (total registered, capacity limits, total hours), interactive widgets, and quick action filters.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="lp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="lp-section-title">Frontend Layer Tech Stack</div>
        <p className="lp-section-subtitle">
          SurgeSkills is built using the latest industry standards to deliver optimal performance, security, and a modular architectural design.
        </p>

        <div className="lp-stack-grid">
          <div className="lp-stack-card">
            <div className="lp-stack-name">React 19</div>
            <div className="lp-stack-version">Core Logic & State</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
              Utilizes modern React Hooks, context-based state manager, and efficient rendering patterns.
            </p>
          </div>
          <div className="lp-stack-card">
            <div className="lp-stack-name">Vite 8</div>
            <div className="lp-stack-version">Build & Dev Server</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
              Provides instantaneous hot module replacement (HMR) and highly optimized production assets bundle.
            </p>
          </div>
          <div className="lp-stack-card">
            <div className="lp-stack-name">TypeScript</div>
            <div className="lp-stack-version">Type-Safe Coding</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
              Enforces compile-time checks for sessions, calendar items, user roles, and dashboard feeds.
            </p>
          </div>
          <div className="lp-stack-card">
            <div className="lp-stack-name">TailwindCSS v4</div>
            <div className="lp-stack-version">Utility Compilation</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
              Compiles modern utility styles quickly, ensuring responsive layouts across mobile, tablet, and desktops.
            </p>
          </div>
          <div className="lp-stack-card">
            <div className="lp-stack-name">Vanilla CSS</div>
            <div className="lp-stack-version">Design Tokens</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
              Defines harmonious color systems, glassmorphism filters, responsive grids, and CSS transitions.
            </p>
          </div>
          <div className="lp-stack-card">
            <div className="lp-stack-name">Vercel</div>
            <div className="lp-stack-version">Edge Hosting</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
              Hosts the SPA globally with CDNs and client-side router redirects configured in vercel.json.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="lp-cta-banner">
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.025em' }}>Ready to launch your next event?</h2>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          Enter our gateway portal now to access the Attendee Hub or Admin Console and explore all features.
        </p>
        <button onClick={handleGetStarted} className="btn btn-primary btn-lg" style={{ background: '#7C3AED', border: '1px solid #7C3AED', color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
          Join Us
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div>© 2026 SurgeSkills Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#about" style={{ color: 'var(--text-secondary)' }}>About</a>
          <a href="#offerings" style={{ color: 'var(--text-secondary)' }}>Offerings</a>
          <a href="#tech-stack" style={{ color: 'var(--text-secondary)' }}>Tech Stack</a>
        </div>
      </footer>
    </div>
  );
};
