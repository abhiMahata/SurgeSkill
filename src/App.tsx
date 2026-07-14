import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/Layout/AppShell';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { useApp } from './context/AppContext';

// Auth
import { LoginPage } from './pages/LoginRegistration/LoginPage';

// Dashboards
import { UserDashboard } from './pages/Dashboard/UserDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';

// Explore & Manage
import { ExploreAll } from './pages/Explore/ExploreAll';
import { ManageContent } from './pages/Manage/ManageContent';

// Community
import { Communities } from './pages/Community/Communities';
import { CommunityChat } from './pages/Community/CommunityChat';

// Other
import { MyCalendar } from './pages/Calendar/MyCalendar';
import { UserProfile } from './pages/Profile/UserProfile';
import { Friends } from './pages/Friends/Friends';
import { NotificationCenter } from './pages/Notifications/NotificationCenter';
import { Messages } from './pages/Messages/Messages';
import { EventDetail } from './pages/Events/EventDetail';

/** Renders the full route tree + the onboarding overlay when needed */
const AppContent: React.FC = () => {
  const { authLoading, hydrationState } = useApp();
  const needsOnboarding = !authLoading && hydrationState === 'NEEDS_ONBOARDING';
  const needsMigration = !authLoading && hydrationState === 'PENDING_MIGRATION';

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/"      element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route path="/dashboard/user" element={
          <ProtectedRoute><AppShell><UserDashboard /></AppShell></ProtectedRoute>
        } />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute adminOnly><AppShell><AdminDashboard /></AppShell></ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute><AppShell><ExploreAll /></AppShell></ProtectedRoute>
        } />
        <Route path="/manage" element={
          <ProtectedRoute adminOnly><AppShell><ManageContent /></AppShell></ProtectedRoute>
        } />
        <Route path="/communities" element={
          <ProtectedRoute><AppShell><Communities /></AppShell></ProtectedRoute>
        } />
        <Route path="/communities/:id" element={
          <ProtectedRoute><AppShell><CommunityChat /></AppShell></ProtectedRoute>
        } />
        <Route path="/events/:eventId" element={
          <ProtectedRoute><AppShell><EventDetail /></AppShell></ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute><AppShell><MyCalendar /></AppShell></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><AppShell><UserProfile /></AppShell></ProtectedRoute>
        } />
        <Route path="/friends" element={
          <ProtectedRoute><AppShell><Friends /></AppShell></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><AppShell><Messages /></AppShell></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><AppShell><NotificationCenter /></AppShell></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Onboarding overlay — blocks the UI until the user completes setup */}
      {(needsOnboarding || needsMigration) && <OnboardingWizard isMigration={needsMigration} />}
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
