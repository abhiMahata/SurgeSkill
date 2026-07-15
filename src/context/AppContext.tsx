import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, signInAnonymously,
  updateProfile as fbUpdateProfile, sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection, onSnapshot, getDocs, collectionGroup,
  addDoc, deleteDoc, query, orderBy, limit, increment, serverTimestamp, getCountFromServer, where
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import type {
  User, AppUser, UserRole, Hackathon, Course, ActivityLog, Community, ChatMessage, TypingUser, AppCommunityMember,
  FriendRequest, Friendship, Block, Conversation, ConversationMessage, StorageMetadata, AppEvent, EventRegistration, GlobalSearchResults, Post,
  AppNotification, NotificationType, AdminLog
} from '../types';
import { MAX_NOTIFICATION_BATCH_SIZE } from '../types';
import { hashPassword, verifyPassword } from '../utils/auth';

export type { User, Hackathon, Course, ActivityLog, Community, ChatMessage, TypingUser, AppEvent, EventRegistration };

export interface PendingGoogleUser { uid: string; name: string; email: string; photoURL: string; }

// Removed legacy hardcoded admin credentials

export type HydrationState = 'LOADING' | 'ACTIVE' | 'NEEDS_ONBOARDING' | 'PENDING_MIGRATION';

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  hydrationState: HydrationState;
  pendingGoogleUser: PendingGoogleUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string; newUser?: boolean }>;
  completeGoogleSignup: (role: UserRole) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: (data: { name: string; age: string; collegeId: string; friendCode: string; isMigration: boolean }) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<boolean>;
  events: AppEvent[];
  myEventRegistrations: string[];
  createEvent: (data: Omit<AppEvent, 'id' | 'registrationCount' | 'status' | 'createdAt' | 'updatedAt' | 'collegeId' | 'createdBy'>) => Promise<void>;
  updateEvent: (id: string, data: Partial<AppEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleEventRegistration: (id: string) => Promise<{ success: boolean; registered: boolean }>;
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
  myMemberships: Record<string, AppCommunityMember>;
  memberCounts: Record<string, number>;
  suspendMember: (communityId: string, userId: string) => Promise<void>;
  restoreMember: (communityId: string, userId: string) => Promise<void>;

  // Admin
  adminLogs: AdminLog[];
  logAdminAction: (action: string, targetId: string, details: string) => Promise<void>;
  moderateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  moderateContent: (pathSegments: string[], updates: any) => Promise<void>;
  
  // Friends
  friendRequests: FriendRequest[];
  friendships: Friendship[];
  blocks: Block[];
  searchFriendCode: (code: string) => Promise<AppUser | null>;
  sendFriendRequest: (targetId: string) => Promise<void>;
  acceptFriendRequest: (targetId: string) => Promise<void>;
  rejectFriendRequest: (targetId: string) => Promise<void>;
  removeFriend: (targetId: string) => Promise<void>;
  blockUser: (targetId: string) => Promise<void>;
  unblockUser: (targetId: string) => Promise<void>;

  // Direct Messaging
  conversations: Conversation[];
  sendDirectMessage: (targetId: string, text: string, attachments?: StorageMetadata[]) => Promise<void>;
  markConversationRead: (targetId: string) => Promise<void>;

  // Canonical Search
  globalSearch: (q: string) => Promise<GlobalSearchResults>;

  // Canonical Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  notifyUser: (recipientId: string, type: NotificationType, entityType: AppNotification['entityType'], entityId: string, message: string) => Promise<void>;
  parseMentions: (text: string, entityType: AppNotification['entityType'], entityId: string) => Promise<void>;

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
  const [hydrationState, setHydrationState]   = useState<HydrationState>('LOADING');
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingGoogleUser | null>(null);
  const [events, setEvents]                   = useState<AppEvent[]>([]);
  const [myEventRegistrations, setMyEventRegistrations] = useState<string[]>([]);
  const [hackathons, setHackathons]           = useState<Hackathon[]>([]);
  const [courses, setCourses]                 = useState<Course[]>([]);
  const [communities, setCommunities]         = useState<Community[]>([]);
  const [activities, setActivities]           = useState<ActivityLog[]>([]);
  const [theme, setThemeState]                = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('ss_theme') as 'light' | 'dark') || 'light');
  const [toast, setToast]                     = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [typingUsers, setTypingUsers]         = useState<TypingUser[]>([]);
  const [myMemberships, setMyMemberships]     = useState<Record<string, AppCommunityMember>>({});
  const [memberCounts, setMemberCounts]       = useState<Record<string, number>>({});
  
  const [friendRequests, setFriendRequests]   = useState<FriendRequest[]>([]);
  const [friendships, setFriendships]         = useState<Friendship[]>([]);
  const [blocks, setBlocks]                   = useState<Block[]>([]);
  const [conversations, setConversations]     = useState<Conversation[]>([]);
  const [notifications, setNotifications]     = useState<AppNotification[]>([]);
  const [adminLogs, setAdminLogs]             = useState<AdminLog[]>([]);
  
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
      if (email) {
        const users = JSON.parse(localStorage.getItem('ss_users') || '[]');
        const found = users.find((u: any) => u.email === email);
        if (found) setCurrentUser(found);
      }
      setHydrationState('ACTIVE');
      setAuthLoading(false);
      return;
    }

    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'events'),      s => setEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as AppEvent)))));
    if (auth.currentUser) {
      unsubs.push(onSnapshot(query(collection(db, 'eventRegistrations'), where('userId', '==', auth.currentUser.uid)), s => {
        setMyEventRegistrations(s.docs.map(d => d.data().eventId));
      }));
    }
    unsubs.push(onSnapshot(collection(db, 'hackathons'),  s => setHackathons(s.docs.map(d => ({ id: d.id, ...d.data() } as Hackathon)))));
    unsubs.push(onSnapshot(collection(db, 'courses'),     s => setCourses(s.docs.map(d => ({ id: d.id, ...d.data() } as Course)))));
    unsubs.push(onSnapshot(collection(db, 'communities'), s => setCommunities(s.docs.map(d => ({ id: d.id, ...d.data() } as Community)))));
    unsubs.push(onSnapshot(query(collection(db, 'activities'), orderBy('ts', 'desc'), limit(50)), s =>
      setActivities(s.docs.map(d => d.data() as ActivityLog))));

    // We do NOT use onAuthStateChanged for fetching memberships directly here because we need communities array first.

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Enforce email verification (for password auth, skip if google because google auto-verifies)
        // Wait, onAuthStateChanged fires immediately. If email is not verified, we can log them out or block hydration.
        // The prompt asks to enforce email verification. We'll enforce it during login instead.
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (!userDoc.exists()) {
          setHydrationState('NEEDS_ONBOARDING');
          setCurrentUser(null);
        } else {
          const data = userDoc.data() as User;
          setCurrentUser({ id: fbUser.uid, ...data });
          
          if (!data.collegeId || !data.friendCode || data.status === 'PENDING_ONBOARDING') {
            setHydrationState('PENDING_MIGRATION');
          } else {
            setHydrationState('ACTIVE');
          }

          // Fetch admin logs if admin
          if (data.role === 'SUPER_ADMIN' || data.role === 'COLLEGE_ADMIN') {
            let logQuery = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(50));
            if (data.role === 'COLLEGE_ADMIN') {
              logQuery = query(collection(db, 'adminLogs'), where('collegeId', '==', data.collegeId), orderBy('timestamp', 'desc'), limit(50));
            }
            unsubs.push(onSnapshot(logQuery, s => setAdminLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as AdminLog)))));
          }
        }
      } else {
        setCurrentUser(null);
        setHydrationState('ACTIVE');
      }
      setAuthLoading(false);
    });

    return () => { unsubAuth(); unsubs.forEach(u => u()); };
  }, [fbReady]);

  // Fetch myMemberships when communities or currentUser changes
  useEffect(() => {
    if (!fbReady || !currentUser || !currentUser.collegeId || hydrationState !== 'ACTIVE') return;
    const fetchMemberships = async () => {
      const mems: Record<string, AppCommunityMember> = {};
      const authorizedCommunities = communities.filter(c => c.collegeId === currentUser.collegeId || currentUser.role === 'SUPER_ADMIN');
      await Promise.all(authorizedCommunities.map(async (c) => {
        try {
          const snap = await getDoc(doc(db, 'communities', c.id, 'members', currentUser.id));
          if (snap.exists()) {
             mems[c.id] = snap.data() as AppCommunityMember;
          }
        } catch (e: any) {
          console.warn(`[Initialization] Failed to fetch membership for community ${c.id}. Reason: ${e.message}`);
        }
      }));
      setMyMemberships(mems);
    };
    if (communities.length > 0) fetchMemberships();
  }, [communities.length, currentUser, fbReady, hydrationState]);

  // Fetch memberCounts for all communities
  useEffect(() => {
    if (!fbReady || communities.length === 0 || hydrationState !== 'ACTIVE' || !currentUser) return;
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      const authorizedCommunities = communities.filter(c => c.collegeId === currentUser.collegeId || currentUser.role === 'SUPER_ADMIN');
      await Promise.all(authorizedCommunities.map(async (c) => {
        try {
          const q = query(collection(db, 'communities', c.id, 'members'), where('status', '==', 'ACTIVE'));
          const snapshot = await getCountFromServer(q);
          counts[c.id] = snapshot.data().count;
        } catch (e: any) {
          console.warn(`[Initialization] Failed to fetch member count for community ${c.id}. Reason: ${e.message}`);
          counts[c.id] = 0;
        }
      }));
      setMemberCounts(counts);
    };
    fetchCounts();
  }, [communities.length, fbReady, hydrationState, currentUser]);

  // ── Friends Listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!fbReady || !currentUser) return;
    const unsubs: (() => void)[] = [];
    
    unsubs.push(onSnapshot(collection(db, 'friendRequests'), s => {
      const all = s.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
      setFriendRequests(all.filter(r => r.senderId === currentUser.id || r.receiverId === currentUser.id));
    }));
    
    unsubs.push(onSnapshot(collection(db, 'friendships'), s => {
      const all = s.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
      setFriendships(all.filter(f => f.userIds.includes(currentUser.id)));
    }));
    
    unsubs.push(onSnapshot(collection(db, 'blocks'), s => {
      const all = s.docs.map(d => ({ id: d.id, ...d.data() } as Block));
      setBlocks(all.filter(b => b.userIds.includes(currentUser.id)));
    }));

    unsubs.push(onSnapshot(collection(db, 'conversations'), s => {
      const all = s.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
      setConversations(all.filter(c => c.participantIds.includes(currentUser.id)).sort((a, b) => b.lastMessageAt - a.lastMessageAt));
    }));

    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('recipientId', '==', currentUser.id), orderBy('createdAt', 'desc'), limit(50)),
      s => setNotifications(s.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification)))
    ));

    return () => unsubs.forEach(u => u());
  }, [fbReady, currentUser?.id]);

  const getLocalUsers = () => JSON.parse(localStorage.getItem('ss_users') || '[]');
  const saveLocalUsers = (u: any[]) => localStorage.setItem('ss_users', JSON.stringify(u));
  const persistLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const normEmail = email.trim().toLowerCase();

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
      if (!cred.user.emailVerified) {
        await signOut(auth);
        return { success: false, message: 'Please verify your email address before logging in.' };
      }
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) {
        // Registration started but not onboarded
        setHydrationState('NEEDS_ONBOARDING');
        return { success: true, message: 'Success' };
      }
      const data = userDoc.data() as User;
      setCurrentUser({ id: cred.user.uid, ...data });
      if (!data.collegeId || !data.friendCode || data.status === 'PENDING_ONBOARDING') {
        setHydrationState('PENDING_MIGRATION');
      } else {
        setHydrationState('ACTIVE');
      }
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
      // We no longer write to Firestore here! Onboarding will do it, satisfying the rule restrictions.
      // We must send email verification and log them out, since email verification is enforced.
      // Firebase auth auto-logs in on create, so we sign out immediately.
      import('firebase/auth').then(({ sendEmailVerification }) => {
        sendEmailVerification(cred.user).catch(() => {});
      });
      await signOut(auth);
      return { success: true, message: 'Account created! Please check your email to verify your address.' };
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
      // New Google user — they don't need email verification because Google provides it.
      // We don't write to Firestore here. Onboarding will do it.
      setHydrationState('NEEDS_ONBOARDING');
      setCurrentUser(null);
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
    name: string; age: string; collegeId: string; friendCode: string; isMigration: boolean;
  }) => {
    const user = auth.currentUser;
    if (fbReady && !user) return { success: false, message: 'Not logged in.' };
    
    try {
      if (fbReady) {
        if (data.isMigration) {
          if (!currentUser) return { success: false, message: 'Current user state missing.' };
          const updateData: any = {};
          if (data.name) updateData.name = data.name;
          if (data.age) updateData.age = data.age;
          if (!currentUser.collegeId) updateData.collegeId = data.collegeId;
          if (!currentUser.friendCode) updateData.friendCode = data.friendCode;
          updateData.status = 'ACTIVE';
          updateData.onboardingComplete = true;
          
          await updateDoc(doc(db, 'users', currentUser.id), updateData);
          if (data.name) await fbUpdateProfile(user!, { displayName: data.name });
          
          setCurrentUser(prev => prev ? { ...prev, ...updateData } : null);
          setHydrationState('ACTIVE');
          addActivity(`${data.name || currentUser.name} migrated profile`);
        } else {
          // New user creation
          const profile: User = {
            id: user!.uid,
            name: data.name,
            email: user!.email || '',
            role: 'STUDENT',
            status: 'ACTIVE',
            collegeId: data.collegeId,
            friendCode: data.friendCode,
            age: data.age,
            designation: 'Student',
            organization: '',
            registeredEvents: [],
            enrolledCourses: [],
            registeredHackathons: [],
            joinedCommunities: [],
            onboardingComplete: true,
          };
          await setDoc(doc(db, 'users', user!.uid), profile);
          await fbUpdateProfile(user!, { displayName: data.name });
          setCurrentUser(profile);
          setHydrationState('ACTIVE');
          addActivity(`${data.name} completed onboarding`);
        }
      } else {
        // Local mock for dev
        setHydrationState('ACTIVE');
      }
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
    if (fbReady) signOut(auth);
    setCurrentUser(null);
    setHydrationState('ACTIVE');
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
  const createEvent = async (data: Omit<AppEvent, 'id' | 'registrationCount' | 'status' | 'createdAt' | 'updatedAt' | 'collegeId' | 'createdBy'>) => {
    if (!currentUser) return;
    const ev: AppEvent = { 
      ...data, 
      id: `ev-${Date.now()}`, 
      collegeId: currentUser.collegeId || 'surgeskill',
      createdBy: currentUser.id,
      registrationCount: 0, 
      status: 'ACTIVE',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    if (fbReady) {
      await setDoc(doc(db, 'events', ev.id), ev);
      if (ev.scope === 'COMMUNITY' && ev.communityId) {
        try {
          const { getDocs, query, collection, limit, writeBatch } = await import('firebase/firestore');
          const membersSnap = await getDocs(query(collection(db, 'communities', ev.communityId, 'members'), limit(MAX_NOTIFICATION_BATCH_SIZE)));
          const batch = writeBatch(db);
          membersSnap.forEach(d => {
            const memberId = d.id;
            if (memberId !== currentUser.id) {
              const notifRef = doc(collection(db, 'notifications'));
              batch.set(notifRef, {
                recipientId: memberId,
                actorId: currentUser.id,
                collegeId: currentUser.collegeId,
                type: 'EVENT_CREATED',
                entityType: 'event',
                entityId: ev.id,
                message: `${currentUser.displayName} created a new event: ${ev.title}`,
                read: false,
                createdAt: Date.now()
              });
            }
          });
          await batch.commit();
        } catch (e) {
          console.error('Fan-out event notification failed', e);
        }
      }
    } else { const u = [...events, ev]; setEvents(u); persistLocal('ss_events', u); }
    addActivity(`Created event "${data.title}"`);
  };
  const updateEvent = (id: string, data: Partial<AppEvent>) => {
    if (fbReady) updateDoc(doc(db, 'events', id), { ...data, updatedAt: Date.now() });
    else { const u = events.map(e => e.id === id ? { ...e, ...data, updatedAt: Date.now() } : e); setEvents(u); persistLocal('ss_events', u); }
  };
  const deleteEvent = (id: string) => {
    const t = events.find(e => e.id === id);
    if (fbReady) deleteDoc(doc(db, 'events', id));
    else { const u = events.filter(e => e.id !== id); setEvents(u); persistLocal('ss_events', u); }
    addActivity(`Deleted event "${t?.title}"`);
  };
  const toggleEventRegistration = async (id: string) => {
    if (!currentUser) return { success: false, registered: false };
    const regId = `${id}_${currentUser.id}`;
    const isReg = myEventRegistrations.includes(id);
    
    if (fbReady) {
      if (isReg) {
        await deleteDoc(doc(db, 'eventRegistrations', regId));
      } else {
        await setDoc(doc(db, 'eventRegistrations', regId), {
          eventId: id,
          userId: currentUser.id,
          collegeId: currentUser.collegeId || 'surgeskill',
          registeredAt: Date.now()
        });
        const ev = events.find(e => e.id === id);
        if (ev && ev.createdBy && ev.createdBy !== currentUser.id) {
          await notifyUser(ev.createdBy, 'EVENT_REGISTRATION', 'event', id, `${currentUser.displayName} registered for your event: ${ev.title}`);
        }
      }
      await updateDoc(doc(db, 'events', id), { registrationCount: increment(isReg ? -1 : 1) });
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

  const createCommunity = async (data: Omit<Community, 'id' | 'memberIds' | 'memberCount'>) => {
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'COLLEGE_ADMIN' && currentUser?.role !== 'admin') throw new Error('Only admins can create communities.');
    
    if (fbReady) {
      const ref = await addDoc(collection(db, 'communities'), data);
      await setDoc(doc(db, 'communities', ref.id, 'members', currentUser.id), {
        communityId: ref.id,
        userId: currentUser.id,
        collegeId: currentUser.collegeId,
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: Date.now()
      });
      addActivity(`Created community "${data.name}"`);
      return ref.id;
    } else {
      const c: Community = { ...data, id: `comm-${Date.now()}` } as any;
      const u = [...communities, c];
      setCommunities(u);
      persistLocal('ss_communities', u);
      addActivity(`Created community "${data.name}"`);
      return c.id;
    }
  };

  const joinCommunity = async (id: string) => {
    if (!currentUser || !currentUser.collegeId) return;
    if (myMemberships[id] && myMemberships[id].status === 'ACTIVE') return;

    // Optimistic
    setMyMemberships(prev => ({
      ...prev,
      [id]: {
        id: `${id}_${currentUser.id}`,
        communityId: id,
        userId: currentUser.id,
        collegeId: currentUser.collegeId!,
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: Date.now()
      }
    }));

    if (fbReady) {
      try {
        await setDoc(doc(db, 'communities', id, 'members', currentUser.id), {
          communityId: id,
          userId: currentUser.id,
          collegeId: currentUser.collegeId,
          role: 'MEMBER',
          status: 'ACTIVE',
          joinedAt: Date.now()
        });
      } catch (err: any) {
        console.error(err);
        showToast('Error joining community');
      }
    }
    addActivity(`${currentUser.name} joined community`);
  };

  const leaveCommunity = async (id: string) => {
    if (!currentUser) return;
    
    // Optimistic update
    setMyMemberships(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (fbReady) {
      try {
        await updateDoc(doc(db, 'communities', id, 'members', currentUser.id), {
          status: 'INACTIVE'
        });
      } catch (err: any) {
        console.error('Leave community failed:', err);
        showToast('Failed to leave community');
      }
    }
  };

  const suspendMember = async (communityId: string, userId: string) => {
    if (!fbReady) return;
    try {
      await updateDoc(doc(db, 'communities', communityId, 'members', userId), {
        status: 'SUSPENDED'
      });
      showToast('Member suspended');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to suspend member');
    }
  };

  const restoreMember = async (communityId: string, userId: string) => {
    if (!fbReady) return;
    try {
      await updateDoc(doc(db, 'communities', communityId, 'members', userId), {
        status: 'ACTIVE'
      });
      showToast('Member restored');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to restore member');
    }
  };

  // ── Friends System ────────────────────────────────────────────────────────
  
  const getPairId = (u1: string, u2: string) => (u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`);

  const searchFriendCode = async (code: string): Promise<User | null> => {
    try {
      const snap = await getDoc(doc(db, 'friendCodes', code.toUpperCase()));
      if (snap.exists()) {
        const uId = snap.data().userId;
        const uSnap = await getDoc(doc(db, 'users', uId));
        return uSnap.exists() ? { id: uSnap.id, ...uSnap.data() } as User : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const globalSearch = async (q: string): Promise<GlobalSearchResults> => {
    if (!q || !q.trim() || !currentUser?.collegeId) {
      return { communities: [], users: [], events: [], posts: [] };
    }
    const term = q.trim();
    const endTerm = term + '\uf8ff';
    const cid = currentUser.collegeId;

    try {
      const [comSnap, userSnap, fcSnap, evSnap, postSnap] = await Promise.all([
        getDocs(query(collection(db, 'communities'), where('collegeId', '==', cid), where('name', '>=', term), where('name', '<', endTerm), limit(20))),
        getDocs(query(collection(db, 'users'), where('collegeId', '==', cid), where('displayName', '>=', term), where('displayName', '<', endTerm), limit(20))),
        getDoc(doc(db, 'friendCodes', term.toUpperCase())),
        getDocs(query(collection(db, 'events'), where('collegeId', '==', cid), where('title', '>=', term), where('title', '<', endTerm), limit(20))),
        getDocs(query(collectionGroup(db, 'posts'), where('collegeId', '==', cid), where('content', '>=', term), where('content', '<', endTerm), limit(20)))
      ]);

      const communities = comSnap.docs.map(d => ({ id: d.id, ...d.data() } as Community));
      const events = evSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppEvent));
      const posts = postSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      
      const usersMap = new Map<string, AppUser>();
      userSnap.docs.forEach(d => usersMap.set(d.id, { id: d.id, ...d.data() } as AppUser));
      
      if (fcSnap.exists()) {
        const uId = fcSnap.data().userId;
        const uSnap = await getDoc(doc(db, 'users', uId));
        if (uSnap.exists()) {
          const u = { id: uSnap.id, ...uSnap.data() } as AppUser;
          if (u.collegeId === cid) {
            usersMap.set(uSnap.id, u);
          }
        }
      }

      return { communities, users: Array.from(usersMap.values()), events, posts };
    } catch (err) {
      console.error('globalSearch error', err);
      return { communities: [], users: [], events: [], posts: [] };
    }
  };

  const notifyUser = async (recipientId: string, type: NotificationType, entityType: AppNotification['entityType'], entityId: string, message: string) => {
    if (!currentUser || !fbReady || recipientId === currentUser.id) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientId,
        actorId: currentUser.id,
        collegeId: currentUser.collegeId,
        type,
        entityType,
        entityId,
        message,
        read: false,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error('Failed to notify', e);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!fbReady) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    if (!fbReady || !currentUser) return;
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const parseMentions = async (text: string, entityType: AppNotification['entityType'], entityId: string) => {
    if (!currentUser || !fbReady || !text) return;
    const mentions = text.match(/@([\w\s]+?)(?=\s|$|[.,!?])/g);
    // Note: the regex matches "@Name" or "@FriendCode". A simpler regex is: /@(\S+)/g to just grab non-whitespace
    const simpleMentions = text.match(/@([a-zA-Z0-9_]+)/g);
    if (!simpleMentions) return;
    
    const uniqueMentions = Array.from(new Set(simpleMentions.map(m => m.substring(1))));
    
    for (const m of uniqueMentions) {
      try {
        let targetId = null;
        // 1. Friend code exact match
        const fcSnap = await getDoc(doc(db, 'friendCodes', m.toUpperCase()));
        if (fcSnap.exists()) {
          targetId = fcSnap.data().userId;
        } else {
          // 2. Display name match
          const { getDocs, query, collection, where, limit } = await import('firebase/firestore');
          const nameSnap = await getDocs(query(collection(db, 'users'), where('collegeId', '==', currentUser.collegeId), where('displayName', '==', m), limit(2)));
          if (nameSnap.size === 1) {
            targetId = nameSnap.docs[0].id;
          }
        }
        if (targetId && targetId !== currentUser.id) {
          const typeMap: Record<string, NotificationType> = {
            'post': 'POST_MENTION',
            'message': 'CHAT_MENTION'
          };
          const nType = typeMap[entityType] || 'POST_MENTION';
          await notifyUser(targetId, nType, entityType, entityId, `${currentUser.displayName} mentioned you.`);
        }
      } catch (e) {}
    }
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!currentUser || !fbReady) return;
    const pairId = getPairId(currentUser.id, targetId);
    try {
      await setDoc(doc(db, 'friendRequests', pairId), {
        collegeId: currentUser.collegeId,
        senderId: currentUser.id,
        receiverId: targetId,
        status: 'PENDING',
        createdAt: Date.now(),
        respondedAt: null
      });
      await notifyUser(targetId, 'FRIEND_REQUEST', 'user', currentUser.id, `${currentUser.displayName} sent you a friend request.`);
      showToast('Friend request sent!');
    } catch (e) {
      showToast('Could not send request.');
    }
  };

  const acceptFriendRequest = async (targetId: string) => {
    if (!currentUser || !fbReady) return;
    const pairId = getPairId(currentUser.id, targetId);
    try {
      await updateDoc(doc(db, 'friendRequests', pairId), {
        status: 'ACCEPTED',
        respondedAt: Date.now()
      });
      await setDoc(doc(db, 'friendships', pairId), {
        collegeId: currentUser.collegeId,
        userIds: [currentUser.id, targetId].sort(),
        status: 'ACTIVE',
        createdAt: Date.now()
      });
      await notifyUser(targetId, 'FRIEND_ACCEPTED', 'user', currentUser.id, `${currentUser.displayName} accepted your friend request.`);
      showToast('Friend request accepted!');
    } catch (e) {
      showToast('Could not accept request.');
    }
  };

  const rejectFriendRequest = async (targetId: string) => {
    if (!currentUser || !fbReady) return;
    const pairId = getPairId(currentUser.id, targetId);
    try {
      await updateDoc(doc(db, 'friendRequests', pairId), {
        status: 'REJECTED',
        respondedAt: Date.now()
      });
      showToast('Friend request rejected.');
    } catch (e) {
      showToast('Could not reject request.');
    }
  };

  const removeFriend = async (targetId: string) => {
    if (!currentUser || !fbReady) return;
    const pairId = getPairId(currentUser.id, targetId);
    try {
      await deleteDoc(doc(db, 'friendships', pairId));
      await deleteDoc(doc(db, 'friendRequests', pairId));
      showToast('Friend removed.');
    } catch (e) {
      showToast('Could not remove friend.');
    }
  };

  const blockUser = async (targetId: string) => {
    if (!currentUser || !fbReady) return;
    const pairId = getPairId(currentUser.id, targetId);
    try {
      await setDoc(doc(db, 'blocks', pairId), {
        collegeId: currentUser.collegeId,
        userIds: [currentUser.id, targetId].sort(),
        initiatedBy: currentUser.id,
        status: 'ACTIVE',
        createdAt: Date.now()
      });
      try { await deleteDoc(doc(db, 'friendships', pairId)); } catch {}
      try { await deleteDoc(doc(db, 'friendRequests', pairId)); } catch {}
      showToast('User blocked.');
    } catch (e) {
      showToast('Could not block user.');
    }
  };

  const unblockUser = async (targetId: string) => {
    if (!currentUser || !fbReady) return;
    const pairId = getPairId(currentUser.id, targetId);
    try {
      await deleteDoc(doc(db, 'blocks', pairId));
      showToast('User unblocked.');
    } catch (e) {
      showToast('Could not unblock user.');
    }
  };

  // ── Direct Messaging ──────────────────────────────────────────────────────

  const sendDirectMessage = async (targetId: string, text: string, attachments: StorageMetadata[] = []) => {
    if (!currentUser || !fbReady || (!text.trim() && attachments.length === 0)) return;
    const pairId = getPairId(currentUser.id, targetId);

    try {
      // Upsert conversation document
      const convRef = doc(db, 'conversations', pairId);
      await setDoc(convRef, {
        collegeId: currentUser.collegeId,
        participantIds: [currentUser.id, targetId].sort(),
        lastMessageText: text.trim() || (attachments.length > 0 ? 'Sent an attachment' : ''),
        lastMessageAt: Date.now(),
        lastMessageSenderId: currentUser.id,
        status: 'ACTIVE',
        createdAt: Date.now()
      }, { merge: true });

      // Add message to subcollection
      const msg: Omit<ConversationMessage, 'id'> = {
        senderId: currentUser.id,
        content: text.trim(),
        attachments,
        status: 'ACTIVE',
        createdAt: Date.now()
      };
      
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'conversations', pairId, 'messages'), msg);
      await notifyUser(targetId, 'DIRECT_MESSAGE', 'message', pairId, `${currentUser.displayName} sent you a message.`);

    } catch (e) {
      console.error(e);
      showToast('Failed to send message.');
      throw e;
    }
  };

  const markConversationRead = async (targetId: string) => {
    if (!currentUser || !fbReady) return;
    const pairId = getPairId(currentUser.id, targetId);
    try {
      const convRef = doc(db, 'conversations', pairId);
      await setDoc(convRef, {
        readState: {
          [currentUser.id]: Date.now()
        }
      }, { merge: true });
    } catch (e) {}
  };

  // ── Admin ───────────────────────────────────────────────────────────────

  const logAdminAction = async (action: string, targetId: string, details: string) => {
    if (!fbReady || !currentUser) return;
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'adminLogs'), {
        actorId: currentUser.id,
        targetId,
        collegeId: currentUser.collegeId,
        action,
        details,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Failed to log admin action', e);
    }
  };

  const moderateUser = async (userId: string, updates: Partial<User>) => {
    if (!fbReady || !currentUser) return;
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COLLEGE_ADMIN') return;
    
    // Only SUPER_ADMIN can update roles.
    if (updates.role && currentUser.role !== 'SUPER_ADMIN') {
      showToast('Insufficient permissions to modify role.');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'users', userId), { ...updates, updatedAt: Date.now() });
      await logAdminAction('MODERATE_USER', userId, `Updated fields: ${Object.keys(updates).join(', ')}`);
      showToast('User updated successfully.');
    } catch (e) {
      console.error(e);
      showToast('Failed to moderate user.');
    }
  };

  const moderateContent = async (pathSegments: string[], updates: any) => {
    if (!fbReady || !currentUser) return;
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COLLEGE_ADMIN') return;
    
    try {
      const docRef = doc(db, pathSegments[0], ...pathSegments.slice(1));
      await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
      await logAdminAction('MODERATE_CONTENT', pathSegments[pathSegments.length - 1], `Updated content in ${pathSegments.join('/')}`);
      showToast('Content moderated successfully.');
    } catch (e) {
      console.error(e);
      showToast('Failed to moderate content.');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, authLoading, hydrationState, pendingGoogleUser,
      login, register, loginWithGoogle, completeGoogleSignup, completeOnboarding, forgotPassword, logout, updateProfile: updateProfileFn,
      events, myEventRegistrations, createEvent, updateEvent, deleteEvent, toggleEventRegistration,
      hackathons, createHackathon, updateHackathon, deleteHackathon, toggleHackathonRegistration,
      courses, createCourse, updateCourse, deleteCourse, toggleCourseEnrollment,
      communities, createCommunity, joinCommunity, leaveCommunity,
      myMemberships, memberCounts, suspendMember, restoreMember,
      
      friendRequests, friendships, blocks, searchFriendCode, sendFriendRequest,
      acceptFriendRequest, rejectFriendRequest, removeFriend, blockUser, unblockUser,
      conversations, sendDirectMessage, markConversationRead, globalSearch,
      notifications, markNotificationRead, markAllNotificationsRead, notifyUser, parseMentions,
      theme, setTheme: setThemeState, toast, showToast,
      typingUsers, setTyping, subscribeTyping,
      adminLogs, logAdminAction, moderateUser, moderateContent
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
