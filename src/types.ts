// ─── Shared Type Definitions ──────────────────────────────────────────

export type UserRole = 'student' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  organization: string;
  registeredEvents: string[];
  enrolledCourses: string[];
  registeredHackathons: string[];
  joinedCommunities: string[];
  // Student-specific
  college?: string;
  department?: string;
  yearOfStudy?: string;
  phone?: string;
  studentId?: string;
  // Mentor-specific
  expertise?: string;
  linkedin?: string;
  photoURL?: string;
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
  createdBy?: string;
}

export interface Hackathon {
  id: string;
  title: string;
  date: string;
  endDate: string;
  venue: string;
  mode: 'online' | 'offline' | 'hybrid';
  teamSizeMin: number;
  teamSizeMax: number;
  prizes: string[];
  description: string;
  image: string;
  registrationsCount: number;
  capacity: number;
  status: 'Upcoming' | 'Live' | 'Completed';
  createdBy: string;
}

export interface Course {
  id: string;
  title: string;
  mentor: string;
  mentorId: string;
  description: string;
  image: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  syllabus: string[];
  enrolledCount: number;
  capacity: number;
  price: string;
  status: 'Active' | 'Draft' | 'Completed';
  createdBy: string;
}

export interface ActivityLog {
  timestamp: string;
  date: string;
  action: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  type: 'college' | 'interest';
  college?: string;
  memberIds: string[];
  createdBy: string;
  image?: string;
}

export interface ChatMessage {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  mediaBase64?: string;
  mediaType?: string;
  timestamp: number;
}
