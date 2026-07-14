# SurgeSkill MVP Scope

## 1. Purpose and Authority
This document defines the implementation scope of the SurgeSkill MVP. `PRD.md` defines the target product; this file defines what must be built and hardened in the current implementation program.

## 2. MVP Objective
Deliver a secure, college-scoped, production-credible SurgeSkill that proves the core value proposition: verified students participate in learning communities within their own college, communicate through posts and real-time chat, discover and track events, form controlled peer connections, and operate under correctly enforced tenant and role boundaries.

## 3. Scope Principles
1. Security and tenant correctness precede feature expansion.
2. Preserve useful existing UI unless incompatible with target architecture.
3. Do not add responsibilities to the existing global `AppContext`.
4. Client-side filtering is never authorization.
5. Stable college identifiers replace free-form college identity.
6. Events remain the source of truth for calendar and reminders.
7. Implement bounded phases with explicit exit criteria.
8. Do not partially implement deferred features without an approved dependency.

## 4. Priority Model
- **P0 — Foundation/Critical:** security, tenant correctness, data integrity, and viable product foundation.
- **P1 — Core MVP:** required to demonstrate SurgeSkill's value proposition.
- **P2 — Post-MVP:** valuable but not required for MVP acceptance.
- **Future:** explicitly outside the current implementation program.

## 5. P0 Scope
### Authentication, Roles, and Identity
- Replace client-side admin credential comparison.
- Establish trusted authentication for `STUDENT`, `COLLEGE_ADMIN`, and `SUPER_ADMIN`.
- Establish recognized college/domain association and student email verification.
- Handle unavailable/unrecognized colleges clearly.
- Preserve logout and account recovery.
- Requirements: `AUTH-001` through `AUTH-007`.

### College Tenancy
- Introduce stable college identifiers.
- Associate every student with exactly one college and every college admin with an assigned college.
- Enforce isolation for all tenant-scoped resources.
- Provide a controlled super-admin correction path for exceptional college-assignment errors.
- Requirements: `TEN-001` through `TEN-006`.

### Authorization and Firestore Security
- Replace permissive rules with least-privilege rules.
- Enforce college and role boundaries independently of UI behavior.
- Restrict community/event administration to authorized roles.
- Add negative tests for cross-college access.
- Relevant PRD invariants: 1–4 and 8.

### Testing Baseline
- Configure automated testing infrastructure.
- Test authentication, role authorization, tenant isolation, and critical security rules.
- Establish repeatable validation commands.
- Requirements: `NFR-003`, `NFR-006`.

## 6. P1 Core MVP Scope
### Student Dashboard
Preserve/refactor the dashboard; surface authoritative communities, events, reminders, and notifications; maintain cross-surface consistency. Requirements: `USR-001` through `USR-004`.

### Communities and Membership
College-scoped discovery; join/leave; multiple communities; admin-only management; scalable membership architecture where required. Requirements: `COM-001` through `COM-006`.

### Community Posts
Persistent educational feed, authorized posting, correct tenant/community scoping, and deletion/moderation behavior. Requirements: `POST-001` through `POST-004`.

### Real-Time Community Chat
Preserve the Firestore real-time foundation; enforce college/membership authorization; retain history; support replies, reactions, own-message deletion, and approved media/documents. Message editing is excluded. Requirements: `CHAT-001` through `CHAT-005`.

### Media
Replace Base64 application-record media with validated object storage and authorized access/deletion for MVP image/document types. Requirements: `MED-001` through `MED-003`.

### Events and Calendar
College-admin event management; college/community association; discovery and registration; single source of truth across dashboard, calendar, and reminders. Requirements: `EVT-001` through `EVT-005`, `CAL-001`, `CAL-002`.

### In-App Notifications
Persistent notifications for direct messages, mentions, event changes, and reminders; authorized navigation; no tenant leakage. Requirements: `NOT-001` through `NOT-004`.

### Friend System
Unique friend codes; request, acceptance, and rejection flows; prevent invalid, duplicate, and self-directed requests. Requirements: `FRD-001` through `FRD-003`.

### Direct Messaging
Accepted-friends-only real-time messaging, history, independent authorization, and approved MVP media. Requirements: `DM-001` through `DM-004`.

### College Administration
Dedicated dashboard, appropriate analytics, community/event management, authorized member management/moderation, and strict assigned-college boundaries. Requirements: `CADM-001` through `CADM-003`.

### Super Administration
Manage colleges, domain associations, and college-admin provisioning through trusted authorization. Requirements: `SADM-001` through `SADM-003`.

### Search and Discovery
College-scoped community/event discovery and privacy-aware user discovery without tenant leakage. Requirements: `SRCH-001` through `SRCH-003`.

### Production Hardening
Loading/empty/success/error states, error visibility, free-tier performance review, destructive-action safeguards, and critical-flow tests. Requirements: `NFR-001` through `NFR-009`.

## 7. P2 and Future Scope
### P2
Browser push notifications, richer analytics, advanced search/filtering, enhanced moderation, richer notification preferences, additional media capabilities, and deeper optimization.

### Future / Explicitly Deferred
Group calls; external calendar integration; monetization/payments; public cross-college networking; unrestricted DMs; message editing; advanced presence; read receipts; deferred typing indicators; large-scale video hosting.

## 8. Implementation Phases
### Phase 0 — Security and Foundation
**Deliver:** trusted auth/roles, stable college IDs, college-domain model, tenant isolation, hardened Firestore rules, removal of client-side admin secrets, baseline security tests.

**Exit:** no known client-side privileged credentials; cross-college access denied by the security boundary; role permissions tested; target roles authenticate and route correctly.

### Phase 1 — Core College Experience
**Deliver:** dashboard integration, college-scoped communities, membership model, college-admin community management, incremental `AppContext` decomposition for touched domains.

**Exit:** students see only their college communities; join/leave works; admins cannot manage other colleges; critical flows tested.

### Phase 2 — Learning and Communication
**Deliver:** community posts, hardened chat, replies/reactions/deletion, object-storage media.

**Exit:** feed/chat are distinct and functional; unauthorized access denied; Base64 media removed; history and real-time behavior reliable.

### Phase 3 — Events and Calendar
**Deliver:** scoped events, registration, internal calendar, dashboard/reminder consistency.

**Exit:** event changes propagate correctly; unauthorized administration denied; calendar/dashboard use authoritative event data.

### Phase 4 — Controlled Social Layer
**Deliver:** friend codes, requests, accepted friendships, real-time DMs.

**Exit:** invalid/duplicate/self requests prevented; DMs impossible without accepted friendship; authorization independently tested.

### Phase 5 — Engagement and Administration
**Deliver:** persistent notifications, MVP triggers, scoped search/discovery, super-admin management, required analytics/moderation.

**Exit:** notifications persistent and authorized; search does not leak tenant data; super-admin operations use trusted authorization.

### Phase 6 — Hardening and Release
**Deliver:** regression/security testing, monitoring/logging, performance and responsive review, deployment validation, removal of approved obsolete paths.

**Exit:** all MVP acceptance criteria pass; critical tests pass; no unresolved P0 security defect; deployment and rollback validated.

## 9. Phase Dependencies
`Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6`

Parallel work is allowed only when architectural dependencies and shared data/security contracts are stable.

## 10. MVP Functional Acceptance Criteria
The MVP is not accepted unless:
1. verified students are associated with the correct college;
2. cross-college access is denied;
3. role boundaries are enforced outside the UI;
4. students can discover, join, use, and leave authorized communities;
5. posts and real-time chat work with correct authorization;
6. media uses the approved storage architecture;
7. college admins manage only their college;
8. events remain consistent across event, dashboard, calendar, and reminder surfaces;
9. controlled friendship and accepted-friends-only DM flows work;
10. persistent in-app notifications work for defined triggers;
11. super-admin college/domain/admin operations are protected;
12. critical product/security flows pass automated tests.

## 11. Security Acceptance Criteria
- No privileged secret is intentionally shipped in client code.
- Tenant isolation is enforced at the data/security boundary.
- College admins are scoped to assigned colleges.
- Super-admin operations require trusted authorization.
- Community posts/chat respect membership and tenancy.
- DMs respect accepted-friendship authorization.
- Destructive administration has safeguards.
- Security rules and critical authorization paths have automated validation.

## 12. Production-Readiness Criteria
- Production build succeeds and critical tests pass.
- Core flows have loading, empty, success, and error states.
- Errors are diagnosable through defined logging/monitoring.
- Initial free-tier data/media patterns are reviewed for obvious inefficiency.
- Responsive behavior is validated on supported viewports.
- Deployment configuration is documented and validated.
- Known limitations are documented before release.

## 13. Definition of Done
A feature or phase is Done only when:
1. scoped requirements are implemented;
2. acceptance criteria pass;
3. applicable authorization is enforced outside UI;
4. critical automated tests are added/updated;
5. relevant documentation is updated;
6. unrelated functionality is not knowingly broken;
7. obsolete migration paths are removed when safe;
8. build/lint/test validation succeeds;
9. the change is reviewable as a bounded unit;
10. limitations/follow-up work are explicitly documented.

The SurgeSkill MVP is Done only when all required P0 and P1 scope satisfies functional, security, production-readiness, and Definition of Done criteria.

## 14. Change Control
Changes that add/remove P0 or P1 capabilities, alter invariants, change role/tenant behavior, or materially affect MVP acceptance require updates to this document and affected PRD/architecture artifacts. Implementation details that do not change scope do not require revision.

## 15. Relationship to Other Context Artifacts
- `CURRENT_STATE.md`: verified existing state.
- `CODEBASE_MAP.md`: repository navigation.
- `GAP_ANALYSIS.md`: current-to-target differences.
- `PRD.md`: authoritative target product.
- `MVP_SCOPE.md`: authoritative current implementation scope.
- `USER_STORIES.md`: future testable behavior.
- Architecture documents: future technical design.
- `IMPLEMENTATION_PLAN.md`: future task-level execution order.

## 16. Scope Acceptance
This document is the scope baseline for the current SurgeSkill MVP implementation program. Developers and coding agents shall not interpret the full PRD as authorization to implement deferred features. Work shall be selected from approved MVP phases and executed according to dependencies, acceptance criteria, and future architecture contracts.
