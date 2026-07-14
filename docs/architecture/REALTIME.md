# SurgeSkill Real-Time Architecture (REALTIME.md)

## Purpose
Defines SurgeSkill's real-time architecture for community chat, direct messaging, notifications, unread state, events, listeners, pagination, attachments, mentions, cost control, and Spark-only limitations.

## Core Principles
1. Real-time behavior is feature-specific, not global.
2. Scope listeners to the smallest relevant dataset.
3. Every listener must have an explicit owner and cleanup lifecycle.
4. Paginate history instead of listening to complete datasets.
5. Deduplicate historical and live results by Firestore document ID.
6. Store binary media in Firebase Storage, never Base64 in Firestore.
7. Exclude typing indicators, presence, push notifications, message editing, and message deletion from the MVP.
8. Firestore Security Rules remain the authorization boundary.

## Data Classification

### Real-Time
- Active community chat
- Active DM thread
- DM conversation inbox
- User notifications
- Relevant events while event-dependent screens are open

### Request and Refetch
- Posts
- Comments
- Community membership mutations
- Community discovery
- Profile discovery

### Mostly Static
- College information
- Approved domains
- User profiles
- Community metadata
- Role information

## Listener Lifecycle
```text
Feature Activates
→ Load Required Data
→ Start Bounded Listener
→ Receive Updates
→ Feature Deactivates
→ Unsubscribe
```

Unmanaged Firestore listeners are prohibited.

Authenticated-session listeners may include user notifications and the DM inbox. Community chat, DM threads, and event listeners are screen-scoped.

## Community Chat
Community messages contain:
- `collegeId`
- `communityId`
- `senderId`
- `content`
- `attachments`
- `replyToMessageId`
- `mentionedUserIds`
- `status`
- `createdAt`

Students require an active account, same-college tenancy, active membership, and no applicable community suspension. Same-college College Admins may read and moderate chat without joining, but may not participate as ordinary Students.

Student messages are immutable after creation. Message editing and deletion are excluded from the MVP.

### Loading Strategy
```text
Open Chat
→ Validate Access
→ Load Latest 30 Messages
→ Start Listener for New Messages
→ Scroll Up
→ Load Previous 30 Using Cursor
```

Historical and live results must be merged by stable document ID.

## Direct Messaging
Direct messages use:
```text
conversations/{pairId}
conversations/{pairId}/messages/{messageId}
```

Each Student pair has one canonical conversation.

Conversation fields include:
- `collegeId`
- `participantIds`
- `lastMessageText`
- `lastMessageAt`
- `lastMessageSenderId`
- `readState`
- `status`
- `createdAt`

DM access requires an active same-college Student, active friendship, conversation participation, and no applicable block state. Only participants may read private DMs. College Admins and Super Admins receive no default private-DM access.

### Inbox
The authenticated Student's inbox may use a bounded real-time listener over conversations containing the current UID, ordered by `lastMessageAt`.

### Thread Loading
DM threads use the same latest-30 plus live-listener plus cursor-history pattern as community chat.

### Sending DMs
A send operation may create a message, update conversation metadata, and create notifications. Where Security Rules permit, related writes should use Firestore batched writes. Atomicity does not replace authorization.

## Read State
The MVP uses simple read cursors, not per-message sent/delivered/read states.

DM conversations may store bounded participant read state:
```text
readState: {
    userA: timestamp,
    userB: timestamp
}
```

This avoids updating every unread message.

## Community Unread State
Use:
```text
communityReadStates/{communityId_userId}
```

Fields:
- `communityId`
- `userId`
- `collegeId`
- `lastReadAt`

Opening a community chat advances `lastReadAt`.

For the MVP, prefer an unread indicator over expensive exact unread counts.

## Notifications
Persistent in-app notification types may include:
- `DIRECT_MESSAGE`
- `FRIEND_REQUEST`
- `FRIEND_ACCEPTED`
- `EVENT_CREATED`
- `EVENT_UPDATED`
- `MENTION`
- `COMMUNITY_ANNOUNCEMENT`

Maintain one recipient-scoped, bounded notification listener during the authenticated session. Notification history uses cursor pagination. Browser push notifications and automated cleanup are deferred.

## Mentions
Mentions are supported in community chat and comments. Use stable user IDs via bounded `mentionedUserIds` arrays rather than treating display names as identifiers.

Maximum mentions per message or comment: 5.

## Attachments
Community chat and DMs support attachments.

Recommended MVP limits:
- maximum 3 attachments per message;
- maximum image size: 3 MB;
- maximum document size: 5 MB.

Upload flow:
```text
Select
→ Validate Count, Type, and Size
→ Upload to Firebase Storage
→ Store Attachment Metadata in Firestore
→ Create Message
```

Metadata includes:
- `storagePath`
- `fileName`
- `mimeType`
- `size`

## Event Synchronization
Events remain the source of truth for calendars, dashboard reminders, and event pages.

Use bounded screen-scoped listeners only while event-dependent screens are active. Avoid duplicate listeners over identical event datasets.

## Posts and Comments
Posts and comments do not use permanent listeners by default.

Preferred model:
```text
Fetch
→ Display
→ Mutate
→ Refetch or Update Local State
```

Use bounded queries and cursor pagination as datasets grow.

## Optimistic UI
Do not build a complex custom optimistic-message system initially. Use Firestore's normal write/listener behavior first and add custom optimistic behavior only if measured UX requires it.

## Explicit MVP Exclusions
- Message editing
- Message deletion
- Typing indicators
- Online presence
- Browser push notifications
- Video hosting
- Exact community unread counts
- Automated notification retention cleanup

## Feature-Owned Hooks
Recommended structure:
```text
features/
├── chat/hooks/useCommunityMessages.ts
├── messages/hooks/useConversation.ts
├── messages/hooks/useConversations.ts
├── notifications/hooks/useNotifications.ts
└── events/hooks/useEvents.ts
```

Avoid catch-all Firebase subscription hooks. Each feature owns its query construction, subscription lifecycle, cleanup, pagination, deduplication, and state.

## Cost Control
For approximately 500 registered users and 100–150 DAU:
- use cursor pagination;
- bound all queries;
- scope listeners to active features;
- clean up listeners;
- limit global subscriptions;
- never listen to complete histories;
- avoid duplicate subscriptions;
- bound attachments;
- exclude presence, typing, push, and video.

Poor listener architecture is a greater immediate risk than raw scale.

## Spark-Only Limitations
The MVP does not claim to solve:
- robust server-side rate limiting;
- scheduled notification cleanup;
- sophisticated presence;
- push orchestration;
- trusted fan-out workflows;
- complex automated moderation.

These limitations must remain explicit.

## Database Amendments
Synchronize these discoveries into `DATABASE.md`:
```text
friendCodes/
communityReadStates/
```

Add bounded `readState` to conversations and `mentionedUserIds` to relevant messages/comments.

## Security Requirements
Real-time access must follow `AUTH.md` and `RBAC.md`.

At minimum:
- deny unauthenticated protected listeners;
- deny inactive accounts;
- deny cross-college subscriptions;
- deny non-members member-only chat;
- prevent suspended Students from sending community messages;
- limit College Admin moderation to the assigned college;
- deny DM access to non-participants, College Admins, and Super Admins by default;
- enforce attachment limits;
- keep Student messages immutable.

## Testing Requirements
Verify:
- authorized listeners receive new data;
- unauthorized listeners fail;
- cleanup prevents duplicate subscriptions;
- historical/live results deduplicate correctly;
- cursor pagination works;
- cross-college chat access is denied;
- non-members cannot access member chat;
- suspended members cannot send messages;
- DM non-participants cannot read messages;
- read cursors update correctly;
- notification queries remain recipient-scoped;
- attachment limits are enforced.

## Relationship to Other Documents
- `ARCHITECTURE.md` defines overall system structure.
- `DATABASE.md` defines data and queries.
- `AUTH.md` defines identity and onboarding.
- `RBAC.md` defines authorization and tenant isolation.
- `REALTIME.md` defines synchronization, listeners, pagination, unread state, and real-time cost controls.

## Acceptance Criteria
The architecture is acceptable when chat and DMs provide paginated history plus bounded live updates; listeners have explicit cleanup; duplicate data is prevented; private DMs remain participant-only; community chat follows membership and moderation rules; unread state avoids per-message mutations; notifications are scoped and paginated; event surfaces use canonical event data; attachments remain bounded; unnecessary ephemeral systems remain excluded; and the design is practical under Spark-only constraints.
