// ─── Shared Type Definitions ──────────────────────────────────────────

export type UserRole = 'student' | 'mentor' | 'admin' | 'STUDENT' | 'COLLEGE_ADMIN' | 'SUPER_ADMIN';

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
  // Onboarding — set once, immutable after
  onboardingComplete?: boolean;
  age?: string;
  country?: string;
  state?: string;
  city?: string;
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
  communityId?: string;
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
  collegeId?: string;
  memberCount?: number;
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
  reactions?: Record<string, string[]>; // emoji → [userId, ...]
  replyTo?: { id: string; text: string; senderName: string };
  edited?: boolean;
}

export interface TypingUser {
  userId: string;
  name: string;
  ts: number; // epoch ms — used to auto-expire stale typing signals
}

// ─── Target Architecture Types (Phase 1A) ─────────────────────────────

export type AppRole = 'STUDENT' | 'COLLEGE_ADMIN' | 'SUPER_ADMIN';
export type AccountStatus = 'PENDING_ONBOARDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface College {
  id: string; // Document ID
  name: string;
  shortName: string;
  city: string;
  state: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: number;
  createdBy: string;
}

export interface CollegeDomain {
  id: string; // Document ID
  domain: string;
  collegeId: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: number;
  createdBy: string;
}

export interface AppUser {
  id: string; // UID
  displayName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  learningInterests: string[];
  teachingInterests: string[];
  course: string;
  year: string;
  friendCode: string;
  collegeId: string;
  role: AppRole;
  status: AccountStatus;
  createdAt: number;
  updatedAt: number;
}

export interface AppCommunity {
  id: string;
  collegeId: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  createdBy: string;
  status: 'ACTIVE' | 'ARCHIVED';
  memberCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CommunityMember {
  id: string; // communityId_userId
  communityId: string;
  userId: string;
  collegeId: string;
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  joinedAt: number;
}

export interface CommunitySuspension {
  id: string; // communityId_userId
  communityId: string;
  userId: string;
  collegeId: string;
  suspendedBy: string;
  reason: string;
  status: 'ACTIVE' | 'LIFTED';
  createdAt: number;
}

export interface StorageMetadata {
  storagePath: string;
  fileName: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface Post {
  id: string;
  collegeId: string;
  communityId: string;
  authorId: string;
  content: string;
  attachments: StorageMetadata[]; // Max 5
  likeCount: number;
  commentCount: number;
  status: 'ACTIVE' | 'DELETED' | 'MODERATED';
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  collegeId: string;
  communityId: string;
  postId: string;
  authorId: string;
  content: string;
  status: 'ACTIVE' | 'DELETED' | 'MODERATED';
  createdAt: number;
  updatedAt: number;
}

export interface PostLike {
  id: string; // userId
  userId: string;
  createdAt: number;
}

export interface AppChatMessage {
  id: string;
  collegeId: string;
  communityId: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  content: string;
  attachments: StorageMetadata[];
  replyToMessageId: string | null;
  mentionedUserIds: string[];
  status: 'ACTIVE' | 'DELETED' | 'MODERATED';
  createdAt: number;
}

export interface AppEvent {
  id: string;
  collegeId: string;
  communityId: string | null;
  scope: 'COLLEGE' | 'COMMUNITY';
  title: string;
  description: string;
  location: string;
  startsAt: number;
  endsAt: number;
  createdBy: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  registrationEnabled: boolean;
  registrationCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface EventRegistration {
  id: string; // eventId_userId
  eventId: string;
  userId: string;
  collegeId: string;
  registeredAt: number;
}

export interface FriendRequest {
  id: string; // canonical pairId
  collegeId: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: number;
  respondedAt: number | null;
}

export interface Friendship {
  id: string; // canonical pairId
  collegeId: string;
  userIds: string[];
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: number;
}

export interface Block {
  id: string; // canonical pairId
  collegeId: string;
  userIds: string[];
  initiatedBy: string;
  createdAt: number;
  status: 'ACTIVE' | 'LIFTED';
}

export interface Conversation {
  id: string; // canonical pairId
  collegeId: string;
  participantIds: string[];
  lastMessageText: string;
  lastMessageAt: number;
  lastMessageSenderId: string;
  readState: Record<string, number>; // userId -> timestamp
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: number;
}

export interface ConversationMessage {
  id: string;
  senderId: string;
  content: string;
  attachments: StorageMetadata[];
  status: 'ACTIVE' | 'DELETED';
  createdAt: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  collegeId: string;
  type: 'DIRECT_MESSAGE' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'MENTION' | 'COMMUNITY_ANNOUNCEMENT';
  actorId: string;
  entityType: string;
  entityId: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface FriendCode {
  id: string; // friend code string
  userId: string;
  collegeId: string;
  createdAt: number;
}

export interface CommunityReadState {
  id: string; // communityId_userId
  communityId: string;
  userId: string;
  collegeId: string;
  lastReadAt: number;
}
