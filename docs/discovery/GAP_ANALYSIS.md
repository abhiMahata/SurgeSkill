# SurgeSkill Gap Analysis

## Purpose
Compare the verified existing repository with the target SurgeSkill product defined during product discovery.

## Target Product Summary
SurgeSkill is a college-scoped, multi-tenant learning and collaboration platform. Students authenticate through recognized college email domains, interact only inside their college ecosystem, join multiple learning communities, use community posts/chat/events, form code-based friendships, direct-message accepted friends, receive notifications, and use an internal calendar. College admins manage only their college; super admins manage platform-level college/domain/admin configuration.

## Gap Matrix
| Capability | Current State | Target State | Decision | Priority |
|---|---|---|---|---|
| React/TS/Vite foundation | Implemented | Retained | KEEP | P0 |
| Existing UI | Broad scaffolding exists | Professional product surface | KEEP/REFACTOR | P1 |
| Firebase Auth | Implemented | Verified college-email auth | REFACTOR | P0 |
| Admin auth | Client-side env credential comparison | Firebase-backed trusted roles | REPLACE | P0 |
| Role model | student/mentor/admin | STUDENT/COLLEGE_ADMIN/SUPER_ADMIN | REPLACE | P0 |
| College identity | Free-form strings | Stable college IDs/domains | REPLACE | P0 |
| Tenant isolation | UI filtering | Security-enforced college isolation | BUILD | P0 |
| Firestore rules | Broad authenticated permissions | Least-privilege tenant/RBAC rules | REPLACE | P0 |
| AppContext | Centralized global responsibilities | Modular feature/data services | REPLACE INCREMENTALLY | P1 |
| Communities | Existing scaffold | College-scoped communities | REFACTOR | P0 |
| Membership | memberIds arrays | Scalable membership model | REFACTOR | P1 |
| Real-time chat | Firestore onSnapshot | Authorized community chat | KEEP/REFACTOR | P0 |
| Media | Base64 message data | Object storage + URL metadata | REPLACE | P1 |
| Posts/feed | Missing | Persistent community feed | BUILD | P1 |
| Events | Existing scaffold | College/community-scoped admin events | REFACTOR | P0 |
| Calendar | Existing presentation | Consistent internal event calendar | REFACTOR | P1 |
| Event reminders | Missing | Scheduled reminders | BUILD | P1 |
| In-app notifications | Missing | Persistent notification system | BUILD | P1 |
| Browser notifications | Missing | Browser push | BUILD LATER | P2 |
| Friend codes/requests | Missing | Code-based private social graph | BUILD | P1 |
| Direct messaging | Missing | Accepted-friends-only real-time DM | BUILD | P1 |
| Super admin | Missing | Platform administration | BUILD | P1 |
| Testing | Missing | Unit/integration/E2E coverage | BUILD | P0/P1 |
| Observability | Missing | Error/log/audit visibility | BUILD | P1 |
| localStorage fallback | Parallel path | Firebase/emulator single architecture | REMOVE | P1 |

## P0: Security and Architectural Foundation
1. Remove client-side admin password authentication.
2. Define stable `collegeId` and college-domain data model.
3. Implement target RBAC.
4. Enforce tenant isolation in Firestore rules and queries.
5. Restrict community/event mutations by role and tenant.
6. Add baseline automated tests for auth, authorization, and tenant isolation.
7. Preserve existing UI while these foundations change.

## P1: Core Product Completion
1. Incrementally decompose `AppContext`.
2. Refactor communities and membership.
3. Harden real-time community chat.
4. Move media to object storage.
5. Add community posts.
6. Refactor events/calendar around a single source of truth.
7. Add in-app notifications and event reminders.
8. Add friend codes, friend requests, and accepted-friend relationships.
9. Add direct messaging.
10. Build college-admin and super-admin capabilities.
11. Add error monitoring and audit logging.

## P2: Deferred Enhancements
- Browser push notifications.
- Video uploads if cost/performance constraints require deferral.
- Typing indicators.
- Read receipts.
- Online presence.
- Group calls.
- External calendar integration.
- Monetization.

## Core Architectural Invariants
1. A student must never access tenant-scoped resources belonging to another college.
2. A college admin may administer only their assigned college.
3. Only a super admin may manage colleges, college domains, and college-admin provisioning.
4. Client UI restrictions are never treated as authorization.
5. Events are the source of truth for calendar/reminder representations.
6. Direct messaging is allowed only after an accepted friendship.
7. Private user data is not exposed through public profiles.
8. Secrets and privileged operations must not execute in untrusted client code.

## Recommended Migration Sequence
```text
Security/RBAC
    ↓
College IDs + Tenant Isolation
    ↓
Firestore Schema/Rules
    ↓
Auth + Onboarding
    ↓
Communities/Membership
    ↓
Chat + Storage
    ↓
Events/Calendar
    ↓
Posts
    ↓
Friends/DM
    ↓
Notifications
    ↓
Admin/Super Admin
    ↓
Testing/Observability Hardening
```

## Definition of Discovery Completion
Discovery is complete when `CURRENT_STATE.md`, `CODEBASE_MAP.md`, and `GAP_ANALYSIS.md` are committed and accepted as the baseline. These documents describe the existing system and the gap to the target product; they do not replace the future PRD, architecture specification, database design, API/security contracts, or implementation roadmap.
