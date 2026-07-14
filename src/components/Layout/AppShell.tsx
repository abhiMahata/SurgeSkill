import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV: { label: string; icon: string; path: string; adminOnly?: boolean }[] = [
  { label: 'Dashboard',   icon: 'space_dashboard', path: 'dashboard' },
  { label: 'Explore',     icon: 'search',          path: '/explore' },
  { label: 'Communities', icon: 'groups',          path: '/communities' },
  { label: 'My Calendar', icon: 'calendar_today',  path: '/calendar' },
  { label: 'Manage',      icon: 'tune',            path: '/manage',  adminOnly: true },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, toast } = useApp();
  const location  = useLocation();
  const navigate  = useNavigate();

  if (!currentUser) { navigate('/'); return null; }

  const isAdmin   = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COLLEGE_ADMIN' || currentUser.role === 'admin';
  const dashPath  = isAdmin ? '/dashboard/admin' : '/dashboard/user';

  const navItems = NAV
    .filter(n => !n.adminOnly || isAdmin)
    .map(n => ({ ...n, path: n.path === 'dashboard' ? dashPath : n.path }));

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => { logout(); navigate('/'); };

  const pageTitle = (() => {
    const p = location.pathname;
    if (p.includes('dashboard')) return isAdmin ? 'Admin Console' : 'Dashboard';
    if (p === '/explore')  return 'Explore';
    if (p === '/calendar') return 'My Calendar';
    if (p === '/manage')   return 'Manage Content';
    if (p === '/profile')  return 'Settings';
    if (p.startsWith('/communities')) return 'Communities';
    return 'SurgeSkill';
  })();

  const roleLabel = isAdmin ? 'Admin Console' : currentUser.role === 'mentor' ? 'Mentor Hub' : 'Student Hub';

  const initials = currentUser.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
        {/* Unified blue header: logo + role label */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="SurgeSkill" style={{ height: 44, objectFit: 'contain', maxWidth: '100%', display: 'block', mixBlendMode: 'screen' }} />
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)',
            marginTop: 6,
          }}>
            {roleLabel}
          </span>
        </div>

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
            {currentUser.photoURL ? (
              <img className="user-avatar" src={currentUser.photoURL} alt={currentUser.name} />
            ) : (
              <div className="user-avatar" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isAdmin ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                color: '#fff', fontSize: 13, fontWeight: 700,
              }}>
                {initials}
              </div>
            )}
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
        <header className="top-bar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span>SurgeSkill</span>
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
              {currentUser.photoURL ? (
                <img className="user-avatar" src={currentUser.photoURL} alt={currentUser.name} style={{ width: 26, height: 26 }} />
              ) : (
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: isAdmin ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                }}>
                  {initials}
                </div>
              )}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
};
