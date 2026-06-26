import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/Layout/AppShell';

// Auth — single unified login
import { LoginPage } from './pages/LoginRegistration/LoginPage';

// Dashboards
import { UserDashboard }  from './pages/Dashboard/UserDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';

// Explore & Manage
import { ExploreAll }    from './pages/Explore/ExploreAll';
import { ManageContent } from './pages/Manage/ManageContent';

// Community
import { Communities }   from './pages/Community/Communities';
import { CommunityChat } from './pages/Community/CommunityChat';

// Other
import { MyCalendar }  from './pages/Calendar/MyCalendar';
import { UserProfile } from './pages/Profile/UserProfile';

const App: React.FC = () => (
  <Router>
    <Routes>
      {/* Public — single unified login */}
      <Route path="/"       element={<LoginPage />} />
      <Route path="/login"  element={<LoginPage />} />

      {/* Protected — wrapped in AppShell */}
      <Route path="/dashboard/user"  element={<AppShell><UserDashboard /></AppShell>} />
      <Route path="/dashboard/admin" element={<AppShell><AdminDashboard /></AppShell>} />
      <Route path="/explore"         element={<AppShell><ExploreAll /></AppShell>} />
      <Route path="/manage"          element={<AppShell><ManageContent /></AppShell>} />
      <Route path="/communities"     element={<AppShell><Communities /></AppShell>} />
      <Route path="/communities/:id" element={<AppShell><CommunityChat /></AppShell>} />
      <Route path="/calendar"        element={<AppShell><MyCalendar /></AppShell>} />
      <Route path="/profile"         element={<AppShell><UserProfile /></AppShell>} />
    </Routes>
  </Router>
);

export default App;
