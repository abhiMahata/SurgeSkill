# SurgeSkill Product Requirements Document

## 1. Document Purpose

This PRD is the authoritative product definition for SurgeSkill. It defines what the product must do, for whom, behavioral requirements, scope boundaries, invariants, and success criteria. Implementation details belong in architecture documents.

## 2. Product Overview

SurgeSkill is a non-profit, college-scoped learning and collaboration platform where students learn from and teach peers within communities belonging to their verified college. It combines persistent posts, real-time chat, events, an internal calendar, controlled social connections, direct messaging, and college administration. The product consists of a public marketing website and an authenticated application.

## 3. Product Vision

Make collaborative, peer-led learning within colleges accessible, organized, engaging, and trustworthy.

## 4. Problem Statement

Students lack a single college-specific environment for discovering peers with shared learning interests, exchanging knowledge, organizing educational activities, and sustaining collaborative learning communities. SurgeSkill creates verified college ecosystems for these activities.

## 5. Product Principles

1. College-scoped by default.
2. Learning and education are the primary purposes.
3. Privacy is preferred over unrestricted social discovery.
4. Persistent knowledge and real-time conversation are separate concepts.
5. The application must feel coherent, responsive, and production-grade.
6. Product data must remain consistent across surfaces.
7. Client-side UI restrictions are never sufficient authorization.
8. Useful existing UI and functionality should be preserved where practical.

## 6. Target Users and Roles

### STUDENT
Accesses only the verified college ecosystem; joins communities; participates in posts/chat; views events/calendar; forms accepted friendships; direct-messages friends; receives notifications.

### COLLEGE_ADMIN
Administers only the assigned college, including communities, events, members, moderation, and analytics.

### SUPER_ADMIN
Manages platform-level colleges, recognized email domains, college-admin provisioning, and oversight.

## 7. Product Scope

The target product includes the public marketing website, authenticated student application, verified college tenancy, communities, posts, real-time chat, media, events, internal calendar, notifications, controlled profiles, friend-code social connections, direct messaging, college administration, super administration, and college-scoped discovery.

## 7. Public Marketing Website

**PUB-001** — Provide a public landing page explaining SurgeSkill's identity, mission, objectives, and operation.

**PUB-002** — Provide team and contact information, with optional blog and official social links.

**PUB-003** — Provide clear calls to action leading to the authenticated application.

**PUB-004** — Provide a professional, energetic, responsive experience consistent with SurgeSkill branding.

**PUB-005** — Use the existing Framer landing page as a migration reference, subject to future design changes.

## 8. Authentication and College Verification

**AUTH-001** — Students shall register and authenticate using supported methods associated with a recognized college email identity.

**AUTH-002** — College-scoped onboarding shall require the defined email-verification process.

**AUTH-003** — Recognized student email domains shall map to colleges.

**AUTH-004** — Unrecognized domains shall not cause automatic college assignment and shall receive a clear unavailable/request-contact path.

**AUTH-005** — All roles may enter through the same authentication surface and be routed according to authorized role.

**AUTH-006** — Privileged credentials and role assignment shall not depend on secrets embedded in client code.

**AUTH-007** — Support logout and account recovery.

## 9. College Tenancy

**TEN-001** — Every student belongs to exactly one verified college tenant.

**TEN-002** — Every college admin is assigned to a specific college tenant.

**TEN-003** — Students access only tenant-scoped resources belonging to their verified college.

**TEN-004** — College admins administer only their assigned college.

**TEN-005** — Isolation applies to communities, users, events, posts, chat, search, and all tenant-scoped resources.

**TEN-006** — Students cannot edit college association through normal settings; authorized platform administration may correct exceptional assignments.

## 10. Student Dashboard

**USR-001** — Provide a personalized authenticated dashboard.

**USR-002** — Surface relevant communities, upcoming events, reminders, notifications, and learning activity.

**USR-003** — Dashboard data shall remain consistent with source data elsewhere.

**USR-004** — Navigation shall be coherent, responsive, and production-grade.

## 11. College Communities

**COM-001** — Students discover only communities belonging to their verified college.

**COM-002** — A college may contain multiple learning communities.

**COM-003** — Students may join multiple communities within their college and voluntarily leave them.

**COM-004** — Each community provides feed, chat, events, and member context as applicable.

**COM-005** — Only authorized college admins create, modify, or remove communities for their college.

**COM-006** — Destructive administration requires explicit authorization and safeguards.

## 12. Community Feed and Posts

**POST-001** — Communities provide a persistent feed separate from real-time chat.

**POST-002** — The feed supports educational content, learning resources, announcements, and relevant posts.

**POST-003** — Authorized members may create posts.

**POST-004** — Posts remain persistent until removed according to deletion/moderation rules and remain correctly college/community scoped.

## 13. Community Chat

**CHAT-001** — Community members exchange messages in real time with retained history.

**CHAT-002** — Support replies, reactions, deletion of own messages, and approved media/document sharing.

**CHAT-003** — Chat access requires appropriate college and community membership authorization.

**CHAT-004** — Unauthorized students shall not access community messages.

**CHAT-005** — Message editing is not required for the current scope.

## 14. Media Sharing

**MED-001** — Support approved image and document sharing with type/size validation.

**MED-002** — Do not embed large Base64 payloads in primary application records.

**MED-003** — Media access/deletion follows authorization of the owning resource.

**MED-004** — Video sharing may be deferred for cost or scope reasons.

## 15. Events and Calendar

**EVT-001** — Authorized college admins create, update, and cancel events.

**EVT-002** — Events belong to the appropriate college and may be community-associated.

**EVT-003** — Students discover authorized events and may register/unregister where enabled.

**EVT-004** — The event record is the source of truth for event views, dashboard reminders, calendar, and notifications.

**EVT-005** — Event changes propagate consistently to dependent surfaces.

**CAL-001** — Provide an internal calendar displaying relevant authorized events.

**CAL-002** — Event dates/changes remain consistent across event pages, dashboard, and calendar.

**CAL-003** — External calendar integration is outside current scope.

## 16. Notifications

**NOT-001** — Provide persistent in-app notifications.

**NOT-002** — Triggers include relevant direct messages, mentions, event changes, and event reminders.

**NOT-003** — Notifications link to relevant authorized context where practical.

**NOT-004** — Users shall not receive tenant-scoped notifications for unauthorized resources.

**NOT-005** — Browser push notifications are post-MVP.

## 17. Private Identity and Profiles

**PRIV-001** — Do not publicly display student email addresses, phone numbers, or sensitive contact information.

**PRIV-002** — College-visible identity may include display name, avatar, college, learning interests, and teaching interests.

**PRIV-003** — Avoid unrestricted public-profile discovery outside the authorized college context.

**PRIV-004** — Private communication follows the controlled friendship model.

## 18. Friend System and Direct Messaging

**FRD-001** — Every eligible student receives a unique friend code or equivalent controlled identifier.

**FRD-002** — Students initiate friend requests using valid codes; recipients explicitly accept or reject.

**FRD-003** — Friendship exists only after acceptance; prevent invalid, duplicate, and self-directed requests.

**DM-001** — Accepted friends may exchange direct messages.

**DM-002** — Non-friends cannot initiate unrestricted direct messaging.

**DM-003** — Direct messaging supports real-time delivery, history, and approved media.

**DM-004** — Authorization is enforced independently of UI visibility.

## 19. College and Super Administration

**CADM-001** — College admins receive a dedicated dashboard and relevant college analytics.

**CADM-002** — College admins manage communities, events, authorized members, and basic moderation only for their assigned college.

**CADM-003** — Multiple college admins may exist across the platform.

**SADM-001** — Super admins manage college records and recognized email-domain associations.

**SADM-002** — Super admins provision/manage college-admin access through trusted processes.

**SADM-003** — Super-admin operations shall not depend solely on client-side authorization.

## 20. Search and Discovery

**SRCH-001** — Students discover communities and events only within authorized college scope.

**SRCH-002** — User discovery, where provided, remains within college and privacy boundaries.

**SRCH-003** — Search shall not expose unauthorized tenant resources.

## 21. Non-Functional Requirements

**NFR-001** — Provide responsive desktop and mobile interfaces.

**NFR-002** — Core interactions provide clear loading, empty, success, and error states.

**NFR-003** — Security-sensitive behavior is enforced by trusted services/data controls, not solely by the client.

**NFR-004** — Use stable identifiers for core entities.

**NFR-005** — Evolve toward modular feature/service boundaries rather than increasing AppContext responsibility.

**NFR-006** — Critical auth, authorization, tenant-isolation, and core flows receive automated tests.

**NFR-007** — Production failures are diagnosable through appropriate logging/error visibility.

**NFR-008** — Maintain acceptable initial free-tier performance and avoid inefficient data/media patterns.

**NFR-009** — Destructive admin actions provide appropriate safeguards.

## 22. Product-Wide Invariants
1. A student must never access tenant-scoped resources belonging to another college.
2. A college admin may administer only the assigned college.
3. Only authorized super admins manage platform-level college, domain, and college-admin configuration.
4. Client-side UI restrictions are never sufficient authorization.
5. Events are the source of truth for calendar, reminder, and event representations.
6. Direct messaging requires an accepted friendship.
7. Private student contact information is not publicly exposed.
8. Privileged credentials and trusted operations must not depend on untrusted client code.
9. Data shown in multiple locations remains consistent with its source of truth.
10. Migration preserves useful existing UI/functionality where this does not retain insecure architecture.

## 23. Out of Scope for Current Product Phase
- Group voice/video calls.
- External calendar integration.
- Monetization and payments.
- Public cross-college social networking.
- Unrestricted direct messaging.
- Message editing.
- Advanced presence systems.
- Read receipts and typing indicators where deferred by MVP scope.
- Large-scale video hosting where infrastructure constraints make it unsuitable.

## 24. Success Criteria
1. Verified students enter the correct college ecosystem.
2. Cross-college resource access is prevented.
3. Students can discover, join, and leave college communities.
4. Members can use persistent posts and authorized real-time chat.
5. College admins manage communities/events only for their college.
6. Events remain consistent across event views, dashboard, calendar, and reminders.
7. Students can form controlled friendships and direct-message accepted friends.
8. The application provides reliable in-app notifications for defined triggers.
9. Useful existing UI is retained or improved without preserving insecure architecture.
10. Critical security and product flows are testable and demonstrably functional.

## 25. Relationship to Existing Application
SurgeSkill is a brownfield project. The existing React/TypeScript/Vite/Firebase application contains useful UI and feature scaffolding and shall not be rewritten wholesale without evidence.

Migration shall preserve useful product surfaces, retain Firebase services where appropriate, replace client-side admin credential logic, redesign RBAC and tenant isolation, replace free-form college identity with stable identifiers, harden Firestore access rules, modularize AppContext incrementally, preserve and harden real-time chat, replace Base64 media handling, refactor events/calendar, build missing posts/notifications/friends/direct messaging/super-admin systems, and add testing and observability.

The authoritative existing-system baseline is maintained in `docs/discovery/CURRENT_STATE.md`, `CODEBASE_MAP.md`, and `GAP_ANALYSIS.md`.

## 26. Requirement Priority Definitions
- **P0 — Foundation/Critical:** Security, tenant correctness, or viable product foundation.
- **P1 — Core Product:** Required to demonstrate SurgeSkill's intended value proposition.
- **P2 — Enhancement:** Valuable but deferrable.
- **Future:** Outside the current implementation phase.

Detailed prioritization belongs in `MVP_SCOPE.md` and roadmap artifacts.

## 27. Document Boundary
This PRD defines the target product. It does not define implementation details, sprint schedules, database schemas, API contracts, or deployment procedures. Those concerns belong to their respective context artifacts.
