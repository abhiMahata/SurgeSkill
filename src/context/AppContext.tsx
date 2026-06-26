import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, onSnapshot,
  addDoc, deleteDoc, query, orderBy, limit, serverTimestamp, increment,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import type {
  User, UserRole, EventItem, Hackathon, Course, ActivityLog, Community, ChatMessage,
} from '../types';
import { DEFAULT_EVENTS, DEFAULT_HACKATHONS, DEFAULT_COURSES } from '../utils/seedData';

export type { User, EventItem, Hackathon, Course, ActivityLog, Community, ChatMessage };

// ── Hardcoded admin credentials (bypasses Firebase) ─────────────────────────
const ADMIN_EMAIL    = 'admin@surgeskill.com';
const ADMIN_PASSWORD = 'surgeadmin2026';
const ADMIN_USER: User = {
  id: 'admin-local',
  name: 'Admin',
  email: ADMIN_EMAIL,
  role: 'admin',
  designation: 'Administrator',
  organization: 'SurgeSkill',
  registeredEvents: [],
  enrolledCourses: [],
  registeredHackathons: [],
  joinedCommunities: [],
};

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, role: UserRole, extra?: Partial<User>) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<boolean>;
  events: EventItem[];
  createEvent: (data: Omit<EventItem, 'id' | 'registrationsCount' | 'status'>) => Promise<void>;
  updateEvent: (id: string, data: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  toggleEventRegistration: (id: string) => { success: boolean; registered: boolean };
  hackathons: Hackathon[];
  createHackathon: (data: Omit<Hackathon, 'id' | 'registrationsCount' | 'status'>) => Promise<void>;
  updateHackathon: (id: string, data: Partial<Hackathon>) => void;
  deleteHackathon: (id: string) => void;
  toggleHackathonRegistration: (id: string) => { success: boolean; registered: boolean };
  courses: Course[];
  createCourse: (data: Omit<Course, 'id' | 'enrolledCount' | 'status'>) => Promise<void>;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  toggleCourseEnrollment: (id: string) => { success: boolean; enrolled: boolean };
  communities: Community[];
  createCommunity: (data: Omit<Community, 'id' | 'memberIds'>) => Promise<string>;
  joinCommunity: (id: string) => Promise<void>;
  leaveCommunity: (id: string) => void;
  activities: ActivityLog[];
  addActivity: (action: string) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toast: { message: string; visible: boolean };
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function isFirebaseConfigured(): boolean {
  try { return auth.app.options.apiKey !== 'YOUR_API_KEY'; } catch { return false; }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fbReady = isFirebaseConfigured();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [events, setEvents]             = useState<EventItem[]>([]);
  const [hackathons, setHackathons]     = useState<Hackathon[]>([]);
  const [courses, setCourses]           = useState<Course[]>([]);
  const [communities, setCommunities]   = useState<Community[]>([]);
  const [activities, setActivities]     = useState<ActivityLog[]>([]);
  const [theme, setThemeState]          = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('ss_theme') as 'light' | 'dark') || 'light');
  const [toast, setToast]               = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const addActivity = useCallback((action: string) => {
    const now = new Date();
    const log: ActivityLog = {
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      action,
    };
    if (fbReady) addDoc(collection(db, 'activities'), { ...log, ts: Date.now() }).catch(() => {});
    setActivities(prev => {
      const updated = [log, ...prev];
      if (!fbReady) localStorage.setItem('ss_activities', JSON.stringify(updated));
      return updated;
    });
  }, [fbReady]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem('ss_theme', theme);
  }, [theme]);
  const setTheme = (t: 'light' | 'dark') => setThemeState(t);

  const seedLocalData = useCallback(() => {
    const e = localStorage.getItem('ss_events');
    if (!e) { localStorage.setItem('ss_events', JSON.stringify(DEFAULT_EVENTS)); setEvents(DEFAULT_EVENTS); }
    else setEvents(JSON.parse(e));
    const h = localStorage.getItem('ss_hackathons');
    if (!h) { localStorage.setItem('ss_hackathons', JSON.stringify(DEFAULT_HACKATHONS)); setHackathons(DEFAULT_HACKATHONS); }
    else setHackathons(JSON.parse(h));
    const c = localStorage.getItem('ss_courses');
    if (!c) { localStorage.setItem('ss_courses', JSON.stringify(DEFAULT_COURSES)); setCourses(DEFAULT_COURSES); }
    else setCourses(JSON.parse(c));
    const cm = localStorage.getItem('ss_communities');
    if (cm) setCommunities(JSON.parse(cm));
    const a = localStorage.getItem('ss_activities');
    if (a) setActivities(JSON.parse(a));
  }, []);

  const seedFirestore = useCallback(async () => {
    const snap = await getDocs(collection(db, 'events'));
    if (snap.empty) {
      const batch = writeBatch(db);
      DEFAULT_EVENTS.forEach(ev => batch.set(doc(db, 'events', ev.id), ev));
      DEFAULT_HACKATHONS.forEach(h => batch.set(doc(db, 'hackathons', h.id), h));
      DEFAULT_COURSES.forEach(c => batch.set(doc(db, 'courses', c.id), c));
      await batch.commit();
    }
  }, []);

  useEffect(() => {
    if (!fbReady) {
      seedLocalData();
      const email = sessionStorage.getItem('ss_current_user');
      if (email === ADMIN_EMAIL) {
        setCurrentUser(ADMIN_USER);
      } else if (email) {
        const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
        const found = users.find((u: any) => u.email === email);
        if (found) setCurrentUser(found);
      }
      setAuthLoading(false);
      return;
    }

    seedFirestore();
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'events'),      s => setEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as EventItem)))));
    unsubs.push(onSnapshot(collection(db, 'hackathons'),  s => setHackathons(s.docs.map(d => ({ id: d.id, ...d.data() } as Hackathon)))));
    unsubs.push(onSnapshot(collection(db, 'courses'),     s => setCourses(s.docs.map(d => ({ id: d.id, ...d.data() } as Course)))));
    unsubs.push(onSnapshot(collection(db, 'communities'), s => setCommunities(s.docs.map(d => ({ id: d.id, ...d.data() } as Community)))));
    unsubs.push(onSnapshot(query(collection(db, 'activities'), orderBy('ts', 'desc'), limit(50)), s =>
      setActivities(s.docs.map(d => d.data() as ActivityLog))));

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) setCurrentUser({ id: fbUser.uid, ...userDoc.data() } as User);
      } else {
        // Check if admin session is still active
        const email = sessionStorage.getItem('ss_current_user');
        if (email === ADMIN_EMAIL) setCurrentUser(ADMIN_USER);
        else setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => { unsubAuth(); unsubs.forEach(u => u()); };
  }, [fbReady, seedLocalData, seedFirestore]);

  const getLocalUsers = () => JSON.parse(localStorage.getItem('ss_users') || '[]');
  const saveLocalUsers = (u: any[]) => localStorage.setItem('ss_users', JSON.stringify(u));
  const persistLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // ── Login (no role param — unified) ─────────────────────────────────────
  const login = async (email: string, password: string) => {
    // Admin intercept
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('ss_current_user', ADMIN_EMAIL);
      setCurrentUser(ADMIN_USER);
      addActivity('Admin logged in');
      return { success: true, message: 'Success' };
    }

    if (!fbReady) {
      const users = getLocalUsers();
      const matched = users.find((u: any) => u.email === email);
      if (!matched || matched.password !== password) return { success: false, message: 'Invalid credentials.' };
      sessionStorage.setItem('ss_current_user', email);
      const { password: _, ...safe } = matched;
      setCurrentUser(safe);
      addActivity(`${matched.name} logged in`);
      return { success: true, message: 'Success' };
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) return { success: false, message: 'User profile not found.' };
      const data = userDoc.data() as any;
      setCurrentUser({ id: cred.user.uid, ...data });
      addActivity(`${data.name} logged in`);
      return { success: true, message: 'Success' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed.' };
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string, role: UserRole, extra?: Partial<User>) => {
    const profile: Omit<User, 'id'> = {
      name, email, role,
      designation: role === 'mentor' ? 'Mentor' : 'Student',
      organization: extra?.organization || extra?.college || '',
      registeredEvents: [], enrolledCourses: [], registeredHackathons: [], joinedCommunities: [],
      college: extra?.college || '', department: extra?.department || '',
      yearOfStudy: extra?.yearOfStudy || '', phone: extra?.phone || '',
      expertise: extra?.expertise || '', linkedin: extra?.linkedin || '',
    };
    if (!fbReady) {
      const users = getLocalUsers();
      if (users.some((u: any) => u.email === email)) return { success: false, message: 'Email already registered.' };
      const newUser = { ...profile, id: `${role}-${Date.now()}`, password };
      saveLocalUsers([...users, newUser]);
      sessionStorage.setItem('ss_current_user', email);
      const { password: _, ...safe } = newUser as any;
      setCurrentUser(safe);
      addActivity(`${name} registered as ${role}`);
      return { success: true, message: 'Success' };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await fbUpdateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      setCurrentUser({ id: cred.user.uid, ...profile });
      addActivity(`${name} registered as ${role}`);
      return { success: true, message: 'Success' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  };

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    if (!fbReady) return { success: false, message: 'Google sign-in requires Firebase configuration.' };
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setCurrentUser({ id: uid, ...userDoc.data() } as User);
        addActivity(`${result.user.displayName} logged in via Google`);
        return { success: true, message: 'Success' };
      }
      const profile: Omit<User, 'id'> = {
        name: result.user.displayName || 'User', email: result.user.email || '',
        role: 'student', designation: 'Student', organization: '',
        registeredEvents: [], enrolledCourses: [], registeredHackathons: [], joinedCommunities: [],
        photoURL: result.user.photoURL || '',
      };
      await setDoc(doc(db, 'users', uid), profile);
      setCurrentUser({ id: uid, ...profile });
      addActivity(`${profile.name} registered via Google`);
      return { success: true, message: 'Success' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google sign-in failed.' };
    }
  };

  const logout = () => {
    if (currentUser) addActivity(`${currentUser.name} logged out`);
    sessionStorage.removeItem('ss_current_user');
    if (fbReady && currentUser?.id !== 'admin-local') signOut(auth);
    setCurrentUser(null);
  };

  const updateProfileFn = async (data: Partial<User> & { password?: string }) => {
    if (!currentUser) return false;
    if (!fbReady) {
      const users = getLocalUsers().map((u: any) => u.id === currentUser.id ? { ...u, ...data } : u);
      saveLocalUsers(users);
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      return true;
    }
    try {
      const { password, ...rest } = data;
      await updateDoc(doc(db, 'users', currentUser.id), rest as any);
      setCurrentUser(prev => prev ? { ...prev, ...rest } : null);
      return true;
    } catch { return false; }
  };

  // ── Events ────────────────────────────────────────────────────────────────
  const createEvent = async (data: Omit<EventItem, 'id' | 'registrationsCount' | 'status'>) => {
    const ev: EventItem = { ...data, id: `ev-${Date.now()}`, registrationsCount: 0, status: 'Confirmed',
      image: data.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
      createdBy: currentUser?.id || '' };
    if (fbReady) await setDoc(doc(db, 'events', ev.id), ev);
    else { const u = [...events, ev]; setEvents(u); persistLocal('ss_events', u); }
    addActivity(`Created event "${data.title}"`);
  };
  const updateEvent = (id: string, data: Partial<EventItem>) => {
    if (fbReady) updateDoc(doc(db, 'events', id), data as any);
    else { const u = events.map(e => e.id === id ? { ...e, ...data } : e); setEvents(u); persistLocal('ss_events', u); }
  };
  const deleteEvent = (id: string) => {
    const t = events.find(e => e.id === id);
    if (fbReady) deleteDoc(doc(db, 'events', id));
    else { const u = events.filter(e => e.id !== id); setEvents(u); persistLocal('ss_events', u); }
    addActivity(`Deleted event "${t?.title}"`);
  };
  const toggleEventRegistration = (id: string) => {
    if (!currentUser) return { success: false, registered: false };
    const isReg = currentUser.registeredEvents.includes(id);
    const newList = isReg ? currentUser.registeredEvents.filter(e => e !== id) : [...currentUser.registeredEvents, id];
    setCurrentUser(prev => prev ? { ...prev, registeredEvents: newList } : null);
    if (fbReady) {
      updateDoc(doc(db, 'users', currentUser.id), { registeredEvents: newList });
      updateDoc(doc(db, 'events', id), { registrationsCount: increment(isReg ? -1 : 1) });
    } else {
      const users = getLocalUsers().map((u: any) => u.id === currentUser.id ? { ...u, registeredEvents: newList } : u);
      saveLocalUsers(users);
      const evs = events.map(e => e.id === id ? { ...e, registrationsCount: e.registrationsCount + (isReg ? -1 : 1) } : e);
      setEvents(evs); persistLocal('ss_events', evs);
    }
    addActivity(`${currentUser.name} ${isReg ? 'left' : 'registered for'} event`);
    return { success: true, registered: !isReg };
  };

  // ── Hackathons ────────────────────────────────────────────────────────────
  const createHackathon = async (data: Omit<Hackathon, 'id' | 'registrationsCount' | 'status'>) => {
    const h: Hackathon = { ...data, id: `hack-${Date.now()}`, registrationsCount: 0, status: 'Upcoming', createdBy: currentUser?.id || '' };
    if (fbReady) await setDoc(doc(db, 'hackathons', h.id), h);
    else { const u = [...hackathons, h]; setHackathons(u); persistLocal('ss_hackathons', u); }
    addActivity(`Created hackathon "${data.title}"`);
  };
  const updateHackathon = (id: string, data: Partial<Hackathon>) => {
    if (fbReady) updateDoc(doc(db, 'hackathons', id), data as any);
    else { const u = hackathons.map(h => h.id === id ? { ...h, ...data } : h); setHackathons(u); persistLocal('ss_hackathons', u); }
  };
  const deleteHackathon = (id: string) => {
    if (fbReady) deleteDoc(doc(db, 'hackathons', id));
    else { const u = hackathons.filter(h => h.id !== id); setHackathons(u); persistLocal('ss_hackathons', u); }
  };
  const toggleHackathonRegistration = (id: string) => {
    if (!currentUser) return { success: false, registered: false };
    const isReg = currentUser.registeredHackathons.includes(id);
    const newList = isReg ? currentUser.registeredHackathons.filter(e => e !== id) : [...currentUser.registeredHackathons, id];
    setCurrentUser(prev => prev ? { ...prev, registeredHackathons: newList } : null);
    if (fbReady) {
      updateDoc(doc(db, 'users', currentUser.id), { registeredHackathons: newList });
      updateDoc(doc(db, 'hackathons', id), { registrationsCount: increment(isReg ? -1 : 1) });
    } else {
      const users = getLocalUsers().map((u: any) => u.id === currentUser.id ? { ...u, registeredHackathons: newList } : u);
      saveLocalUsers(users);
      const hs = hackathons.map(h => h.id === id ? { ...h, registrationsCount: h.registrationsCount + (isReg ? -1 : 1) } : h);
      setHackathons(hs); persistLocal('ss_hackathons', hs);
    }
    return { success: true, registered: !isReg };
  };

  // ── Courses ────────────────────────────────────────────────────────────────
  const createCourse = async (data: Omit<Course, 'id' | 'enrolledCount' | 'status'>) => {
    const c: Course = { ...data, id: `course-${Date.now()}`, enrolledCount: 0, status: 'Active', createdBy: currentUser?.id || '' };
    if (fbReady) await setDoc(doc(db, 'courses', c.id), c);
    else { const u = [...courses, c]; setCourses(u); persistLocal('ss_courses', u); }
    addActivity(`Created course "${data.title}"`);
  };
  const updateCourse = (id: string, data: Partial<Course>) => {
    if (fbReady) updateDoc(doc(db, 'courses', id), data as any);
    else { const u = courses.map(c => c.id === id ? { ...c, ...data } : c); setCourses(u); persistLocal('ss_courses', u); }
  };
  const deleteCourse = (id: string) => {
    if (fbReady) deleteDoc(doc(db, 'courses', id));
    else { const u = courses.filter(c => c.id !== id); setCourses(u); persistLocal('ss_courses', u); }
  };
  const toggleCourseEnrollment = (id: string) => {
    if (!currentUser) return { success: false, enrolled: false };
    const isEn = currentUser.enrolledCourses.includes(id);
    const newList = isEn ? currentUser.enrolledCourses.filter(e => e !== id) : [...currentUser.enrolledCourses, id];
    setCurrentUser(prev => prev ? { ...prev, enrolledCourses: newList } : null);
    if (fbReady) {
      updateDoc(doc(db, 'users', currentUser.id), { enrolledCourses: newList });
      updateDoc(doc(db, 'courses', id), { enrolledCount: increment(isEn ? -1 : 1) });
    } else {
      const users = getLocalUsers().map((u: any) => u.id === currentUser.id ? { ...u, enrolledCourses: newList } : u);
      saveLocalUsers(users);
      const cs = courses.map(c => c.id === id ? { ...c, enrolledCount: c.enrolledCount + (isEn ? -1 : 1) } : c);
      setCourses(cs); persistLocal('ss_courses', cs);
    }
    addActivity(`${currentUser.name} ${isEn ? 'left' : 'enrolled in'} course`);
    return { success: true, enrolled: !isEn };
  };

  // ── Communities ───────────────────────────────────────────────────────────
  const createCommunity = async (data: Omit<Community, 'id' | 'memberIds'>) => {
    const memberIds = [currentUser?.id || ''];
    if (fbReady) {
      // Don't embed a custom `id` — let Firestore generate the document ID.
      // The onSnapshot listener maps `d.id` (the real Firestore doc ID) onto each community.
      const ref = await addDoc(collection(db, 'communities'), { ...data, memberIds });
      addActivity(`Created community "${data.name}"`);
      return ref.id;
    } else {
      const c: Community = { ...data, id: `comm-${Date.now()}`, memberIds };
      const u = [...communities, c];
      setCommunities(u);
      persistLocal('ss_communities', u);
      addActivity(`Created community "${data.name}"`);
      return c.id;
    }
  };

  const joinCommunity = async (id: string) => {
    if (!currentUser) return;
    const comm = communities.find(c => c.id === id);
    if (!comm || comm.memberIds.includes(currentUser.id)) return;
    const updated = [...comm.memberIds, currentUser.id];
    // Optimistic update first
    const updatedComms = communities.map(c => c.id === id ? { ...c, memberIds: updated } : c);
    setCommunities(updatedComms);
    if (!fbReady) persistLocal('ss_communities', updatedComms);
    const newJoined = [...(currentUser.joinedCommunities || []), id];
    setCurrentUser(prev => prev ? { ...prev, joinedCommunities: newJoined } : null);
    // Then persist
    if (fbReady) {
      await updateDoc(doc(db, 'communities', id), { memberIds: updated });
      await updateDoc(doc(db, 'users', currentUser.id), { joinedCommunities: newJoined });
    } else {
      const users = getLocalUsers().map((u: any) => u.id === currentUser.id ? { ...u, joinedCommunities: newJoined } : u);
      saveLocalUsers(users);
    }
    addActivity(`${currentUser.name} joined community`);
  };

  const leaveCommunity = (id: string) => {
    if (!currentUser) return;
    const comm = communities.find(c => c.id === id);
    if (!comm) return;
    const updated = comm.memberIds.filter(m => m !== currentUser.id);
    const updatedComms = communities.map(c => c.id === id ? { ...c, memberIds: updated } : c);
    setCommunities(updatedComms);
    if (fbReady) updateDoc(doc(db, 'communities', id), { memberIds: updated });
    else persistLocal('ss_communities', updatedComms);
    const newJoined = (currentUser.joinedCommunities || []).filter(c => c !== id);
    setCurrentUser(prev => prev ? { ...prev, joinedCommunities: newJoined } : null);
    if (fbReady) updateDoc(doc(db, 'users', currentUser.id), { joinedCommunities: newJoined });
    else {
      const users = getLocalUsers().map((u: any) => u.id === currentUser.id ? { ...u, joinedCommunities: newJoined } : u);
      saveLocalUsers(users);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, authLoading, login, register, loginWithGoogle, logout, updateProfile: updateProfileFn,
      events, createEvent, updateEvent, deleteEvent, toggleEventRegistration,
      hackathons, createHackathon, updateHackathon, deleteHackathon, toggleHackathonRegistration,
      courses, createCourse, updateCourse, deleteCourse, toggleCourseEnrollment,
      communities, createCommunity, joinCommunity, leaveCommunity,
      activities, addActivity, theme, setTheme, toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
