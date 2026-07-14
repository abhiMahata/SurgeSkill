# SurgeSkill Database

## Purpose
This document defines the Firestore-centered data model for SurgeSkill. It is designed around the required access patterns, tenant isolation, security rules, and the current MVP constraints.

## Design Principles
1. Model the query, not the abstract entity graph.
2. Use stable identifiers for tenants and pairwise relationships.
3. Prefer small bounded arrays for owned metadata only.
4. Avoid unbounded arrays for memberships or relationships.
5. Denormalize intentionally and minimally.
6. Keep college identity consistent everywhere through collegeId.
7. Avoid storing large Base64 media payloads in Firestore documents.
8. Keep event data as the source of truth for calendar/reminder presentations.
9. Design with Firestore Security Rules in mind from the beginning.
10. Prefer deterministic IDs for one-to-one or one-to-pair relationships where useful.

## Core Collections
Recommended top-level collections:
```text
colleges/
collegeDomains/
friendCodes/
users/

communities/
posts/
events/

friendRequests/
friendships/
blocks/

conversations/
notifications/
communityReadStates/
```

Nested subcollections are used where ownership is strong:
- posts/{postId}/comments
- posts/{postId}/likes
- communities/{communityId}/members
- communities/{communityId}/messages
- conversations/{conversationId}/messages

## Entity Model
### colleges/{collegeId}
Fields:
- name
- shortName
- city
- state
- country
- status
- createdAt
- createdBy

### collegeDomains/{domainId}
Fields:
- domain
- collegeId
- status
- createdAt
- createdBy

### friendCodes/{friendCode}

Fields

- userId
- createdAt

### users/{uid}
Fields:
- displayName
- email
- avatarUrl
- bio
- learningInterests
- teachingInterests
- course
- year
- friendCode
- collegeId
- role
- status
- createdAt
- updatedAt

Protected fields:
- role
- collegeId
- status
- email
- createdAt

### communities/{communityId}
Fields:
- collegeId
- name
- description
- category
- imageUrl
- createdBy
- status
- memberCount
- createdAt
- updatedAt

### communities/{communityId}/members/{userId}

Fields:

- communityId
- userId
- collegeId
- role
- status
- joinedAt

### communitySuspensions/{communityId_userId}
Fields:
- communityId
- userId
- collegeId
- suspendedBy
- reason
- status
- createdAt

### posts/{postId}
Fields:
- collegeId
- communityId
- authorId
- content
- attachments
- likeCount
- commentCount
- status
- createdAt
- updatedAt

Attachments:
- bounded list of up to 5 items
- each item stores metadata only:
  - storagePath
  - fileName
  - mimeType
  - size

### posts/{postId}/comments/{commentId}
Fields:
- collegeId
- communityId
- postId
- authorId
- content
- status
- createdAt
- updatedAt

### posts/{postId}/likes/{userId}
Fields:
- userId
- createdAt

### communityReadStates/{communityId_userId}
Fields:
- communityId
- userId
- collegeId
- lastReadAt

### events/{eventId}
Fields:
- collegeId
- communityId
- scope
- title
- description
- location
- startsAt
- endsAt
- createdBy
- status
- registrationEnabled
- registrationCount
- createdAt
- updatedAt

Scope values:
- COLLEGE
- COMMUNITY

### eventRegistrations/{eventId_userId}
Fields:
- eventId
- userId
- collegeId
- registeredAt

### friendRequests/{pairId}
Fields:
- collegeId
- senderId
- receiverId
- status
- createdAt
- respondedAt

Status values:
- PENDING
- ACCEPTED
- REJECTED

### friendships/{pairId}
Fields:
- collegeId
- userIds
- status
- createdAt

### blocks/{pairId}
Fields:
- collegeId
- userIds
- initiatedBy
- createdAt
- status

### conversations/{pairId}
Fields:
- collegeId
- participantIds
- lastMessageText
- lastMessageAt
- lastMessageSenderId
- status
- createdAt

### communities/{communityId}/messages/{messageId}

Fields:
- collegeId
- communityId
- senderId
- content
- attachments
- replyToMessageId
- mentionedUserIds
- status
- createdAt

Notes:
- Student messages are immutable.
- Message editing is excluded from the MVP.
- Message deletion is excluded from the MVP.

### conversations/{pairId}/messages/{messageId}
Fields:
- senderId
- content
- attachments
- status
- createdAt

### notifications/{notificationId}
Fields:
- recipientId
- collegeId
- type
- actorId
- entityType
- entityId
- message
- read
- createdAt

## Query Patterns
- get user by UID
- get college from user record
- get approved domain mapping
- get communities by collegeId
- get communities joined by userId
- get members by communityId
- get posts by communityId
- get comments by postId
- get likes by postId
- get messages by communityId
- get events by collegeId
- get events by communityId
- get registrations by userId
- get friend request by canonical pair ID
- get friendship by canonical pair ID
- get block by canonical pair ID
- get conversation by canonical pair ID
- get direct messages by conversation ID
- get notifications by recipientId

## Deterministic IDs
Recommended for:
- communityMembers/{communityId}_{userId}
- communitySuspensions/{communityId}_{userId}
- eventRegistrations/{eventId}_{userId}
- friendRequests/{pairId}
- friendships/{pairId}
- blocks/{pairId}
- conversations/{pairId}

## Denormalization Strategy
Use denormalization only where it directly improves query performance or UI rendering:
- memberCount on community records
- likeCount and commentCount on post records
- registrationCount on event records
- lastMessageText and lastMessageAt on conversation records

## Avoid Bad Firestore Patterns
Avoid:
- unbounded membership arrays
- storing Base64 media payloads in documents
- duplicating source-of-truth data without a consistency plan
- using names instead of IDs for tenancy or relationships
- relying on client-side filtering as if it were authorization

## Security Implications
The schema must align with Firestore Security Rules:
- every tenant-scoped document includes collegeId
- user-scoped records include userId or authorId where needed
- pairwise records use canonical IDs
- rules should verify ownership, role, and college alignment
- rules must reject cross-college reads and writes

## Storage Model
Firestore stores metadata only. Attachments and media files should live in Firebase Storage. Firestore keeps attachment metadata, storage paths, file names, mime types, sizes, and ownership references.

## Cost Model Considerations
To keep SurgeSkill compatible with Spark constraints:
- prefer deterministic lookups where possible
- page large lists
- avoid unnecessary real-time listeners on broad collections
- avoid large documents
- keep media small and bounded
- do not introduce video hosting in the MVP
- query only the currently relevant college/feature context

## Relationship to Architecture
This database model supports:
- college-scoped tenancy
- feature-oriented frontend modules
- real-time chat
- community posts
- events/calendar consistency
- friend-code-based social connections
- one-thread-per-pair direct messaging
- in-app notifications
- college and super-admin behavior

## Acceptance
This model is acceptable if it supports the PRD and user stories, enforces tenant boundaries when paired with rules, avoids unbounded relationship arrays, supports required queries efficiently, keeps media out of Firestore documents, and remains understandable to both developers and AI coding agents.
