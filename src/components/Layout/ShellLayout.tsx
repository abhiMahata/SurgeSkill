import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Toast } from '../Common/Toast';

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!currentUser) { navigate('/'); return null; }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',     icon: 'space_dashboard', path: currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/user' },
    { id: 'explore',   label: 'Explore Events', icon: 'travel_explore',  path: '/explore' },
    { id: 'calendar',  label: 'My Calendar',    icon: 'calendar_month',  path: '/calendar' },
    ...(currentUser.role === 'admin' ? [{ id: 'manage', label: 'Manage Events', icon: 'edit_note', path: '/manage' }] : []),
    { id: 'nexus',   label: 'Nexus AI',   icon: 'auto_awesome',  path: '/nexus' },
    { id: 'profile', label: 'Settings',   icon: 'settings',      path: '/profile' },
  ];

  const currentPath = location.pathname;

  const getTitle = () => {
    if (currentPath.includes('dashboard')) return currentUser.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard';
    if (currentPath === '/explore') return 'Explore Events';
    if (currentPath === '/calendar') return 'My Calendar';
    if (currentPath === '/manage') return 'Manage Events';
    if (currentPath === '/profile') return 'Settings';
    if (currentPath === '/nexus') return 'Nexus AI';
    return 'SurgeSkills';
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRight: '1px solid #E5E7EB' }}>
      {/* Brand with SurgeSkills logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="SurgeSkills" style={{ height: 32, width: 'auto' }} />
      </div>

      {/* Role badge */}
      <div style={{ padding: '10px 18px 6px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: currentUser.role === 'admin' ? '#EEF2FF' : '#ECFDF5', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: currentUser.role === 'admin' ? '#4338CA' : '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{currentUser.role === 'admin' ? 'admin_panel_settings' : 'person'}</span>
          {currentUser.role === 'admin' ? 'Admin Console' : 'Attendee Hub'}
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.09em', padding: '8px 10px 4px', marginBottom: 2 }}>Navigation</p>
        {navItems.map(item => {
          const active = currentPath === item.path;
          return (
            <Link key={item.id} to={item.path} onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none', transition: 'all 140ms ease',
                background: active ? '#EEF2FF' : 'transparent',
                color: active ? '#4F46E5' : '#4B5563',
                fontWeight: active ? 600 : 500, fontSize: 13.5,
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.color = '#111827'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#4B5563'; } }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: 99, background: '#4F46E5' }} />}
            </Link>
          );
        })}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: '#F9FAFB', marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <img
            src={currentUser.role === 'admin'
              ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=80'
              : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80'}
            alt="avatar"
            style={{ width: 30, height: 30, borderRadius: 99, objectFit: 'cover', flexShrink: 0, border: '2px solid #E5E7EB' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
            <div style={{ fontSize: 10.5, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#6B7280', transition: 'all 140ms ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      <Toast />

      {/* Desktop Sidebar */}
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, zIndex: 30, display: 'none' }} className="md:!block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} className="md:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', width: 260, height: '100%' }}><Sidebar /></div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="md:pl-[260px]">
        {/* Top header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMobileOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'transparent', cursor: 'pointer', color: '#6B7280' }} className="md:hidden">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>SurgeSkills</span>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#D1D5DB' }}>chevron_right</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{getTitle()}</span>
            </div>
          </div>

          {/* Header right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)}
                style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E7EB', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', position: 'relative', transition: 'all 140ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
                <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 99, background: '#4F46E5', border: '2px solid #fff' }} />
              </button>
              {notifOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setNotifOpen(false)} />
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 300, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Notifications</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#4F46E5', cursor: 'pointer' }}>Mark all read</span>
                    </div>
                    {[
                      { title: 'Global Innovation Summit 2026', desc: 'Confirmed for May 22 — 11 spots remaining', time: '2h ago' },
                      { title: 'Nexus AI Advisory', desc: 'Dynamic pricing suggestions ready for review', time: '5h ago' },
                    ].map((n, i) => (
                      <div key={i} style={{ padding: '12px 16px', borderBottom: i < 1 ? '1px solid #F9FAFB' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', transition: 'background 140ms ease' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: 99, background: '#4F46E5', marginTop: 5, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111827' }}>{n.title}</div>
                          <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}>{n.desc}</div>
                          <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 3 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />

            {/* Avatar pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 5px', borderRadius: 99, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <img
                src={currentUser.role === 'admin'
                  ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=80'
                  : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80'}
                alt="avatar"
                style={{ width: 24, height: 24, borderRadius: 99, objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{currentUser.name.split(' ')[0]}</span>
                <span style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'capitalize' }}>{currentUser.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
