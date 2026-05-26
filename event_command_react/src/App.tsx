import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/Layout/AppShell';

// Auth
import { GatewayPage } from './pages/LoginRegistration/Gateway';
import { UserPortal }  from './pages/LoginRegistration/UserPortal';
import { AdminPortal } from './pages/LoginRegistration/AdminPortal';

// Dashboards
import { UserDashboard }  from './pages/Dashboard/UserDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';

// Events
import { ExploreEvents } from './pages/Events/ExploreEvents';
import { ManageEvents }  from './pages/Events/ManageEvents';

// Other
import { MyCalendar } from './pages/Calendar/MyCalendar';
import { UserProfile } from './pages/Profile/UserProfile';
import { NexusAI }    from './pages/Nexus/NexusAI';

const App: React.FC = () => (
  <Router>
      <Routes>
        {/* Public */}
        <Route path="/"            element={<GatewayPage />} />
        <Route path="/login/user"  element={<UserPortal />} />
        <Route path="/login/admin" element={<AdminPortal />} />

        {/* Protected — wrapped in AppShell */}
        <Route path="/dashboard/user"  element={<AppShell><UserDashboard /></AppShell>} />
        <Route path="/dashboard/admin" element={<AppShell><AdminDashboard /></AppShell>} />
        <Route path="/explore"         element={<AppShell><ExploreEvents /></AppShell>} />
        <Route path="/manage"          element={<AppShell><ManageEvents /></AppShell>} />
        <Route path="/calendar"        element={<AppShell><MyCalendar /></AppShell>} />
        <Route path="/profile"         element={<AppShell><UserProfile /></AppShell>} />
        <Route path="/nexus"           element={<AppShell><NexusAI /></AppShell>} />
      </Routes>
    </Router>
);

export default App;
