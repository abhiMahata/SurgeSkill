import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  designation: string;
  organization: string;
  registeredEvents: string[];
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  capacity: number;
  price: string;
  image: string;
  description: string;
  type: string;
  registrationsCount: number;
  status: 'Confirmed' | 'Draft' | 'Cancelled' | 'Completed';
}

export interface ActivityLog {
  timestamp: string;
  date: string;
  action: string;
}

interface AppContextType {
  currentUser: User | null;
  events: EventItem[];
  activities: ActivityLog[];
  theme: 'light' | 'dark';
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
  login: (email: string, password: string, role: 'user' | 'admin') => { success: boolean; message: string };
  register: (name: string, email: string, password: string, role: 'user' | 'admin') => { success: boolean; message: string };
  logout: () => void;
  toggleEventRegistration: (id: string) => { success: boolean; registered: boolean };
  createEvent: (eventData: Omit<EventItem, 'id' | 'registrationsCount' | 'status'>) => void;
  updateEvent: (id: string, eventData: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateProfile: (profileData: { name?: string; designation?: string; organization?: string; password?: string }) => boolean;
  addActivity: (action: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'gis-2024',
    title: 'Global Innovation Summit 2026',
    date: '2026-05-22',
    description: 'Join industry leaders for an immersive experience in the future of AI and sustainable technology architecture.',
    venue: 'Moscone Center South, San Francisco',
    capacity: 500,
    price: '$299',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    type: 'Conference',
    registrationsCount: 489,
    status: 'Confirmed'
  },
  {
    id: 'ux-paradigm',
    title: 'The UX Paradigm Shift',
    date: '2026-05-28',
    description: 'Learn the new methodologies for building high-conversion spatial layouts in spatial computing and modern UI schemas.',
    venue: 'Metropolitan Pavilion, New York',
    capacity: 150,
    price: '$99',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    type: 'Workshop',
    registrationsCount: 132,
    status: 'Confirmed'
  },
  {
    id: 'tech-tea',
    title: 'Networking: Tech & Tea',
    date: '2026-06-05',
    description: 'An informal gathering of engineers, organizers, and developers looking to share ideas and projects.',
    venue: 'Prestige Hall, Chicago',
    capacity: 100,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    type: 'Networking',
    registrationsCount: 45,
    status: 'Confirmed'
  },
  {
    id: 'data-arch-2025',
    title: 'Data Architecture 2025',
    date: '2025-10-15',
    description: 'Understanding real-time analytics stream sync protocols, Apache Kafka clusters, and modern distributed storage layers.',
    venue: 'Silicon Center, San Jose',
    capacity: 300,
    price: '$199',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    type: 'Conference',
    registrationsCount: 300,
    status: 'Completed'
  },
  {
    id: 'prod-strategy-sync',
    title: 'Product Strategy Sync',
    date: '2025-12-08',
    description: 'Annual gathering of product leads discussing outcome-based roadmapping and high-density interface metrics.',
    venue: 'Hybrid / Silicon Valley',
    capacity: 80,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    type: 'Workshop',
    registrationsCount: 80,
    status: 'Completed'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial databases
  const [users, setUsers] = useState<any[]>(() => {
    const data = localStorage.getItem('ec_users');
    if (data) return JSON.parse(data);
    const defaults = [
      {
        id: 'user-sarah',
        name: 'Sarah Jenkins',
        email: 'user@company.com',
        password: 'user',
        role: 'user',
        designation: 'Senior Product Designer',
        organization: 'DesignSystems Inc.',
        registeredEvents: ['gis-2024']
      },
      {
        id: 'admin-alex',
        name: 'Alex Rivera',
        email: 'admin@company.com',
        password: 'admin',
        role: 'admin',
        designation: 'Executive Director',
        organization: 'EventCommand Inc.',
        registeredEvents: []
      }
    ];
    localStorage.setItem('ec_users', JSON.stringify(defaults));
    return defaults;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const data = localStorage.getItem('ec_events');
    if (data) return JSON.parse(data);
    localStorage.setItem('ec_events', JSON.stringify(DEFAULT_EVENTS));
    return DEFAULT_EVENTS;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const data = localStorage.getItem('ec_activities');
    return data ? JSON.parse(data) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const email = sessionStorage.getItem('ec_current_user');
    if (email) {
      const storedUsers = localStorage.getItem('ec_users');
      if (storedUsers) {
        const found = JSON.parse(storedUsers).find((u: any) => u.email === email);
        if (found) {
          return {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role,
            designation: found.designation,
            organization: found.organization,
            registeredEvents: found.registeredEvents || []
          };
        }
      }
    }
    return null;
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('ec_theme') as 'light' | 'dark';
    return stored || 'light';
  });

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('ec_theme', theme);
  }, [theme]);

  const addActivity = (action: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const log: ActivityLog = { timestamp: timeStr, date: dateStr, action };

    setActivities(prev => {
      const updated = [log, ...prev];
      localStorage.setItem('ec_activities', JSON.stringify(updated));
      return updated;
    });
  };

  const login = (email: string, password: string, role: 'user' | 'admin') => {
    const matched = users.find(u => u.email === email && u.role === role);
    if (!matched) {
      return { success: false, message: 'Invalid credentials or incorrect role access.' };
    }
    if (matched.password !== password) {
      return { success: false, message: 'Invalid credentials.' };
    }

    sessionStorage.setItem('ec_current_user', email);
    setCurrentUser({
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      designation: matched.designation,
      organization: matched.organization,
      registeredEvents: matched.registeredEvents || []
    });

    addActivity(`${matched.name} logged into ${role} portal`);
    return { success: true, message: 'Success' };
  };

  const register = (name: string, email: string, password: string, role: 'user' | 'admin') => {
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Corporate email is already registered in our database.' };
    }

    const newUser = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      password,
      role,
      designation: role === 'admin' ? 'Coordinator Lead' : 'Partner Associate',
      organization: role === 'admin' ? 'EventCommand Corp' : 'Corporate Partner',
      registeredEvents: []
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('ec_users', JSON.stringify(updatedUsers));

    sessionStorage.setItem('ec_current_user', email);
    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      designation: newUser.designation,
      organization: newUser.organization,
      registeredEvents: []
    });

    addActivity(`${name} registered coordinator profile`);
    return { success: true, message: 'Success' };
  };

  const logout = () => {
    if (currentUser) {
      addActivity(`${currentUser.name} logged out`);
    }
    sessionStorage.removeItem('ec_current_user');
    setCurrentUser(null);
  };

  const toggleEventRegistration = (id: string) => {
    if (!currentUser) return { success: false, registered: false };

    let isRegistered = false;
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        const eventsList = u.registeredEvents || [];
        if (eventsList.includes(id)) {
          u.registeredEvents = eventsList.filter((eid: string) => eid !== id);
          isRegistered = false;
        } else {
          u.registeredEvents = [...eventsList, id];
          isRegistered = true;
        }
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('ec_users', JSON.stringify(updatedUsers));

    // Update currentUser state
    setCurrentUser(prev => prev ? { ...prev, registeredEvents: updatedUsers.find(u => u.id === prev.id).registeredEvents } : null);

    // Update registrations count in event list
    const updatedEvents = events.map(ev => {
      if (ev.id === id) {
        return {
          ...ev,
          registrationsCount: isRegistered ? ev.registrationsCount + 1 : Math.max(0, ev.registrationsCount - 1)
        };
      }
      return ev;
    });

    setEvents(updatedEvents);
    localStorage.setItem('ec_events', JSON.stringify(updatedEvents));

    addActivity(`${currentUser.name} ${isRegistered ? 'registered for' : 'unregistered from'} event ${id}`);
    return { success: true, registered: isRegistered };
  };

  const createEvent = (eventData: Omit<EventItem, 'id' | 'registrationsCount' | 'status'>) => {
    const newEvent: EventItem = {
      ...eventData,
      id: `ev-${Date.now()}`,
      registrationsCount: 0,
      status: 'Confirmed',
      image: eventData.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem('ec_events', JSON.stringify(updated));
    addActivity(`Created new event "${eventData.title}"`);
  };

  const updateEvent = (id: string, eventData: Partial<EventItem>) => {
    const updated = events.map(ev => {
      if (ev.id === id) {
        return { ...ev, ...eventData };
      }
      return ev;
    });

    setEvents(updated);
    localStorage.setItem('ec_events', JSON.stringify(updated));
    addActivity(`Updated event params for "${events.find(ev => ev.id === id)?.title}"`);
  };

  const deleteEvent = (id: string) => {
    const target = events.find(ev => ev.id === id);
    const updated = events.filter(ev => ev.id !== id);
    setEvents(updated);
    localStorage.setItem('ec_events', JSON.stringify(updated));
    
    // Also remove registration links for all users
    const updatedUsers = users.map(u => {
      if (u.registeredEvents && u.registeredEvents.includes(id)) {
        u.registeredEvents = u.registeredEvents.filter((eid: string) => eid !== id);
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('ec_users', JSON.stringify(updatedUsers));

    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, registeredEvents: prev.registeredEvents.filter(eid => eid !== id) } : null);
    }

    addActivity(`Deleted event "${target?.title}" from database`);
  };

  const updateProfile = (profileData: { name?: string; designation?: string; organization?: string; password?: string }) => {
    if (!currentUser) return false;

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, ...profileData };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('ec_users', JSON.stringify(updatedUsers));

    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name: profileData.name !== undefined ? profileData.name : prev.name,
        designation: profileData.designation !== undefined ? profileData.designation : prev.designation,
        organization: profileData.organization !== undefined ? profileData.organization : prev.organization
      };
    });

    addActivity(`${currentUser.name} updated profile settings`);
    return true;
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setThemeState(theme);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      events,
      activities,
      theme,
      toast,
      showToast,
      login,
      register,
      logout,
      toggleEventRegistration,
      createEvent,
      updateEvent,
      deleteEvent,
      setTheme,
      updateProfile,
      addActivity
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
