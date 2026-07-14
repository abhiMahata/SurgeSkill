import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface Props {
  children: React.ReactNode;
  /** If true, only users with role 'COLLEGE_ADMIN' or 'SUPER_ADMIN' may pass. All others redirect to /dashboard/user */
  adminOnly?: boolean;
}

/**
 * Wraps protected routes. Redirects unauthenticated users to /login.
 * Optionally restricts a route to admins only.
 */
export const ProtectedRoute: React.FC<Props> = ({ children, adminOnly = false }) => {
  const { currentUser, authLoading } = useApp();

  // While Firebase is determining auth state, render nothing (avoids flash)
  if (authLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 14,
        fontFamily: 'Inter, sans-serif',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
      </div>
    );
  }

  // Not logged in → send to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Non-admin trying to reach an admin-only route
  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COLLEGE_ADMIN' || currentUser.role === 'admin';
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard/user" replace />;
  }

  return <>{children}</>;
};
