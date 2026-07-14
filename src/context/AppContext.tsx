import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, signInAnonymously,
  updateProfile as fbUpdateProfile, sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection, onSnapshot,
  addDoc, deleteDoc, query, orderBy, limit, increment, serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import type {
  User, UserRole, EventItem, Hackathon, Course, ActivityLog, Community, ChatMessage, TypingUser,
} from '../types';
import { hashPassword, verifyPassword } from '../utils/auth';

export type { User, EventItem, Hackathon, Course, ActivityLog, Community, ChatMessage, TypingUser };

export interface PendingGoogleUser { uid: string; name: string; email: string; photoURL: string; }

// ── Admin credentials loaded from .env (never commit .env to git) ────────────
const ADMIN_EMAIL    = (import.meta.env.VITE_ADMIN_EMAIL    as string | undefined) ?? '';
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? '';
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
  onboardingComplete: true, // admin skips onboarding
};

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  pendingGoogleUser: PendingGoogleUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string; newUser?: boolean }>;
  completeGoogleSignup: (role: UserRole) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: (data: { name: string; role: UserRole; age: string; country: string; state: string; city: string; college: string }) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
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
  typingUsers: TypingUser[];
  setTyping: (communityId: string, isTyping: boolean) => void;
  subscribeTyping: (communityId: string) => () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function isFirebaseConfigured(): boolean {
  try { return auth.app.options.apiKey !== 'YOUR_API_KEY'; } catch { return false; }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fbReady = isFirebaseConfigured();

  const [currentUser, setCurrentUser]         = useState<User | null>(null);
  const [authLoading, setAuthLoading]         = useState(true);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingGoogleUser | null>(null);
  const [events, setEvents]                   = useState<EventItem[]>([]);
  const [hackathons, setHackathons]           = useState<Hackathon[]>([]);
  const [courses, setCourses]                 = useState<Course[]>([]);
  const [communities, setCommunities]         = useState<Community[]>([]);
  const [activities, setActivities]           = useState<ActivityLog[]>([]);
  const [theme, setThemeState]                = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('ss_theme') as 'light' | 'dark') || 'light');
  const [toast, setToast]                     = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [typingUsers, setTypingUsers]         = useState<TypingUser[]>([]);
  const typingTimerRef                        = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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


  useEffect(() => {
    if (!fbReady) {
      // Load only what the user has saved themselves — no defaults seeded
      const e  = localStorage.getItem('ss_events');       if (e)  setEvents(JSON.parse(e));
      const h  = localStorage.getItem('ss_hackathons');   if (h)  setHackathons(JSON.parse(h));
      const c  = localStorage.getItem('ss_courses');      if (c)  setCourses(JSON.parse(c));
      const cm = localStorage.getItem('ss_communities');  if (cm) setCommunities(JSON.parse(cm));
      const a  = localStorage.getItem('ss_activities');   if (a)  setActivities(JSON.parse(a));
      const email = localStorage.getItem('ss_current_user');
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
        const email = localStorage.getItem('ss_current_user');
        if (email === ADMIN_EMAIL) {
          // Restore admin and sign in anonymously so Firestore rules pass
          if (!auth.currentUser) { try { await signInAnonymously(auth); } catch {} }
          setCurrentUser(ADMIN_USER);
        } else {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => { unsubAuth(); unsubs.forEach(u => u()); };
  }, [fbReady]);

  const getLocalUsers = () => JSON.parse(localStorage.getItem('ss_users') || '[]');
  const saveLocalUsers = (u: any[]) => localStorage.setItem('ss_users', JSON.stringify(u));
  const persistLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const normEmail = email.trim().toLowerCase();
    // Admin intercept — credentials live in .env, not source code
    if (ADMIN_EMAIL && normEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      localStorage.setItem('ss_current_user', ADMIN_EMAIL);
      // Give admin a real Firebase Auth token (anonymous) so Firestore writes succeed
      if (fbReady && !auth.currentUser) {
        try { await signInAnonymously(auth); } catch {}
      }
      setCurrentUser(ADMIN_USER);
      addActivity('Admin logged in');
      return { success: true, message: 'Success' };
    }

    if (!fbReady) {
      const users = getLocalUsers();
      const matched = users.find((u: any) => u.email === normEmail);
      if (!matched) return { success: false, message: 'No account found with that email.' };
      const valid = await verifyPassword(password, matched.password);
      if (!valid) return { success: false, message: 'Incorrect password.' };
      localStorage.setItem('ss_current_user', normEmail);
      const { password: _pw, ...safe } = matched;
      setCurrentUser(safe);
      addActivity(`${matched.name} logged in`);
      return { success: true, message: 'Success' };
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, normEmail, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) return { success: false, message: 'User profile not found.' };
      const data = userDoc.data() as User;
      setCurrentUser({ id: cred.user.uid, ...data });
      addActivity(`${data.name} logged in`);
      return { success: true, message: 'Success' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed.' };
    }
  };

  // ── Register (minimal — onboarding collects name/role/location) ─────────
  const register = async (email: string, password: string) => {
    const normEmail = email.trim().toLowerCase();
    const profile: Omit<User, 'id'> = {
      name: normEmail.split('@')[0], email: normEmail, role: 'student',
      designation: 'Student', organization: '',
      registeredEvents: [], enrolledCourses: [], registeredHackathons: [], joinedCommunities: [],
      onboardingComplete: false,
    };
    if (!fbReady) {
      const users = getLocalUsers();
      if (users.some((u: any) => u.email === normEmail)) return { success: false, message: 'Email already registered.' };
      const hashed = await hashPassword(password);
      const newUser = { ...profile, id: `student-${Date.now()}`, password: hashed };
      saveLocalUsers([...users, newUser]);
      localStorage.setItem('ss_current_user', normEmail);
      const { password: _pw, ...safe } = newUser;
      setCurrentUser(safe as User);
      addActivity('New user registered');
      return { success: true, message: 'Success' };
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, normEmail, password);
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      setCurrentUser({ id: cred.user.uid, ...profile });
      addActivity('New user registered');
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
      // New Google user — create profile with onboardingComplete: false
      // The OnboardingWizard will show automatically and collect the rest
      const profile: Omit<User, 'id'> = {
        name:     result.user.displayName || 'User',
        email:    result.user.email       || '',
        role:     'student', designation: 'Student', organization: '',
        registeredEvents: [], enrolledCourses: [], registeredHackathons: [], joinedCommunities: [],
        photoURL: result.user.photoURL || '',
        onboardingComplete: false,
      };
      await setDoc(doc(db, 'users', uid), profile);
      setCurrentUser({ id: uid, ...profile });
      addActivity(`${profile.name} registered via Google`);
      return { success: true, message: 'Success' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google sign-in failed.' };
    }
  };

  // ── Complete Google signup after role is chosen (kept for backward compat) ──
  const completeGoogleSignup = async (role: UserRole) => {
    if (!pendingGoogleUser) return { success: false, message: 'No pending sign-in.' };
    const { uid, name, email, photoURL } = pendingGoogleUser;
    const profile: Omit<User, 'id'> = {
      name, email, role,
      designation: role === 'mentor' ? 'Mentor' : 'Student',
      organization: '',
      registeredEvents: [], enrolledCourses: [], registeredHackathons: [], joinedCommunities: [],
      photoURL, onboardingComplete: false,
    };
    try {
      await setDoc(doc(db, 'users', uid), profile);
      setCurrentUser({ id: uid, ...profile });
      setPendingGoogleUser(null);
      addActivity(`${name} registered via Google as ${role}`);
      return { success: true, message: 'Success' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Could not complete sign-up.' };
    }
  };

  // ── Complete Onboarding ─────────────────────────────────────────────
  const completeOnboarding = async (data: {
    name: string; role: UserRole; age: string;
    country: string; state: string; city: string; college: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };
    const update = {
      name:               data.name,
      role:               data.role,
      age:                data.age,
      country:            data.country,
      state:              data.state,
      city:               data.city,
      college:            data.college,
      organization:       data.college,
      designation:        data.role === 'mentor' ? 'Mentor' : 'Student',
      onboardingComplete: true,
    };
    try {
      if (fbReady && currentUser.id !== 'admin-local') {
        await updateDoc(doc(db, 'users', currentUser.id), update);
        if (auth.currentUser) await fbUpdateProfile(auth.currentUser, { displayName: data.name });
      } else {
        const users = getLocalUsers().map((u: any) => u.id === currentUser.id ? { ...u, ...update } : u);
        saveLocalUsers(users);
      }
      setCurrentUser(prev => prev ? { ...prev, ...update } : null);
      addActivity(`${data.name} completed onboarding`);
      return { success: true, message: 'Success' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Could not save onboarding data.' };
    }
  };

  // ── Forgot Password ───────────────────────────────────────────────────────
  const forgotPassword = async (email: string) => {
    if (!fbReady) return { success: false, message: 'Password reset requires Firebase. Contact your admin.' };
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      return { success: true, message: 'Reset email sent. Check your inbox.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Could not send reset email.' };
    }
  };

  const logout = () => {
    if (currentUser) addActivity(`${currentUser.name} logged out`);
    localStorage.removeItem('ss_current_user');
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
      image: data.image || '',
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
  // ── Typing indicator ─────────────────────────────────────────────────────
  const setTyping = useCallback((communityId: string, isTyping: boolean) => {
    if (!currentUser || !fbReady) return;
    const ref = doc(db, 'communities', communityId, 'typing', currentUser.id);
    if (isTyping) {
      setDoc(ref, { userId: currentUser.id, name: currentUser.name, ts: Date.now() }).catch(() => {});
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        deleteDoc(ref).catch(() => {});
      }, 3500);
    } else {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      deleteDoc(ref).catch(() => {});
    }
  }, [currentUser, fbReady]);

  const subscribeTyping = useCallback((communityId: string) => {
    if (!fbReady) return () => {};
    const q = collection(db, 'communities', communityId, 'typing');
    return onSnapshot(q, snap => {
      const now = Date.now();
      const live = snap.docs
        .map(d => d.data() as TypingUser)
        .filter(t => t.userId !== currentUser?.id && now - t.ts < 5000);
      setTypingUsers(live);
    });
  }, [currentUser, fbReady]);

  // ── Communities ───────────────────────────────────────────────────────────
  const createCommunity = async (data: Omit<Community, 'id' | 'memberIds'>) => {
    if (currentUser?.role !== 'admin') throw new Error('Only admins can create communities.');
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
      currentUser, authLoading, pendingGoogleUser,
      login, register, loginWithGoogle, completeGoogleSignup, completeOnboarding, forgotPassword, logout, updateProfile: updateProfileFn,
      events, createEvent, updateEvent, deleteEvent, toggleEventRegistration,
      hackathons, createHackathon, updateHackathon, deleteHackathon, toggleHackathonRegistration,
      courses, createCourse, updateCourse, deleteCourse, toggleCourseEnrollment,
      communities, createCommunity, joinCommunity, leaveCommunity,
      activities, addActivity, theme, setTheme, toast, showToast,
      typingUsers, setTyping, subscribeTyping,
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
