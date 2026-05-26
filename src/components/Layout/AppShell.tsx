import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV: { label: string; icon: string; path: string; adminOnly?: boolean }[] = [
  { label: 'Dashboard',     icon: 'space_dashboard', path: 'dashboard' },
  { label: 'Explore',       icon: 'search',          path: '/explore' },
  { label: 'My Calendar',   icon: 'calendar_today',  path: '/calendar' },
  { label: 'Manage Events', icon: 'tune',            path: '/manage',   adminOnly: true },
  { label: 'Nexus AI',      icon: 'auto_awesome',    path: '/nexus' },
];

function useCountdown(dateStr: string) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(dateStr).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [dateStr]);
  const total = Math.max(0, diff);
  const d = Math.floor(total / 86400000);
  const h = Math.floor((total % 86400000) / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { d, h, m, s };
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, toast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) { navigate('/'); return null; }

  const dashPath = currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

  const navItems = NAV.filter(n => !n.adminOnly || currentUser.role === 'admin').map(n => ({
    ...n,
    path: n.path === 'dashboard' ? dashPath : n.path,
  }));

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => { logout(); navigate('/'); };

  const pageTitle = (() => {
    const p = location.pathname;
    if (p.includes('dashboard')) return currentUser.role === 'admin' ? 'Admin Dashboard' : 'Dashboard';
    if (p === '/explore')  return 'Explore Events';
    if (p === '/calendar') return 'My Calendar';
    if (p === '/manage')   return 'Manage Events';
    if (p === '/profile')  return 'Settings';
    if (p === '/nexus')    return 'Nexus AI';
    return 'SurgeSkills';
  })();

  return (
    <div className="app-layout">
      {/* Toast */}
      {toast.visible && (
        <div className="toast">
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check_circle</span>
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="SurgeSkills" style={{ height: 40, objectFit: 'contain' }} />
        </div>

        {/* Role label */}
        <div style={{ padding: '10px 16px 0' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            {currentUser.role === 'admin' ? 'Admin Console' : 'Attendee Hub'}
          </span>
        </div>

        {/* Nav */}
        <nav className="sidebar-section" style={{ flex: 1 }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined ms">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 10px' }} />
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
            <span className="material-symbols-outlined ms">settings</span>
            Settings
          </Link>
        </nav>

        {/* User */}
        <div className="sidebar-footer">
          <div className="user-row" onClick={() => navigate('/profile')}>
            <img
              className="user-avatar"
              src={
                currentUser.role === 'admin'
                  ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=64&h=64'
                  : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=64&h=64'
              }
              alt={currentUser.name}
            />
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role">{currentUser.role}</div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); handleLogout(); }}
              className="btn-icon"
              style={{ border: 'none', marginLeft: 'auto' }}
              title="Sign out"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        {/* Top bar */}
        <header className="top-bar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span>SurgeSkills</span>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--border-strong)' }}>chevron_right</span>
              <span className="current">{pageTitle}</span>
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
              <span className="notif-dot" />
            </button>
            <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '4px 6px', borderRadius: 'var(--radius-sm)' }}
              onClick={() => navigate('/profile')}
            >
              <img
                className="user-avatar"
                src={
                  currentUser.role === 'admin'
                    ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=64&h=64'
                    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=64&h=64'
                }
                alt={currentUser.name}
                style={{ width: 26, height: 26 }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};
