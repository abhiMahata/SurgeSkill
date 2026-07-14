# SurgeSkill Implementation Plan

## Purpose

This document converts SurgeSkill's approved product requirements and architecture into a dependency-aware, AI-executable implementation sequence.

It is designed for the existing brownfield SurgeSkill repository, a July 15, 2026 deadline, Firebase Spark-plan constraints, aggressive preservation of the current UI, and supervised autonomous execution through Antigravity.

The objective is not to maximize the number of features touched. The objective is to produce a coherent, secure, demonstrable, production-oriented MVP while minimizing rework and error propagation.

---

## 1. Deadline and Delivery Strategy

**Target deadline:** July 15, 2026.

The deadline is extremely constrained. Implementation must therefore prioritize:

1. a stable application baseline;
2. correct authentication and identity;
3. tenant isolation and authorization;
4. coherent core student workflows;
5. usable College Admin workflows;
6. reliable data persistence and synchronization;
7. security validation;
8. production build and deployment readiness.

All approved MVP features remain in scope, but execution follows a critical path so secondary features do not destabilize foundational systems.

---

## 2. Non-Negotiable Constraints

### Existing Repository

Work from the existing SurgeSkill repository.

Do not restart the application from scratch.

### UI Preservation

Preserve the existing SurgeSkill:

- visual identity;
- page layouts;
- navigation structure;
- styling;
- interaction patterns;
- existing usable components.

Core-logic work does not authorize redesign.

UI changes are permitted only when directly necessary for:

- approved functionality;
- accessibility;
- responsiveness;
- fixing broken behavior;
- representing required states.

Generic AI-generated replacement dashboards or unnecessary visual rewrites are prohibited.

### Firebase Constraint

The MVP must remain compatible with the Firebase Spark plan wherever technically possible.

Approved Firebase usage:

- Firebase Authentication;
- Cloud Firestore;
- Firebase Storage where available within the project's configured plan and constraints;
- Firebase Hosting.

Do not introduce paid infrastructure without explicit approval.

### Repair-First Policy

Existing implementations must be inspected before replacement.

```text
Inspect Existing Implementation
→ Can It Satisfy Approved Architecture?
    → Yes: Repair
    → No: Document Evidence
          → Evaluate Migration Impact
          → Replace Only the Necessary Subsystem
```

Replacement requires evidence, not preference.

### Security

Never weaken Firestore or Storage Security Rules to make client code work.

### Testing

Use risk-based automated testing.

Highest priority:

- authentication;
- protected identity fields;
- tenant isolation;
- role enforcement;
- community membership;
- College Admin authorization;
- private DM access;
- critical Security Rules.

### Landing Page

The existing Framer landing page remains outside this deadline-critical application implementation plan.

The landing page continues to route users to the SurgeSkill application.

Landing-page code migration is deferred until the core application is stable.

---

## 3. Execution Model

Use supervised autonomous batches.

```text
Select One Phase
→ Antigravity Reads AGENTS.md
→ Antigravity Reads CONTEXT_MAP.md
→ Load Required Context
→ Inspect Existing Code
→ Produce Phase Plan
→ Implement Autonomously Within Phase
→ Test and Debug
→ Validate Acceptance Gate
→ Review Diff
→ Return Implementation Report
→ Human Review
→ Git Checkpoint
→ Begin Next Phase
```

Do not instruct the agent to execute the entire plan in one uninterrupted run.

Antigravity has high autonomy inside a bounded phase and must stop between phases.

---

## 4. Mandatory Source Documents

Before implementation, agents must follow:

- `/AGENTS.md`
- `/docs/ai/CONTEXT_MAP.md`

Canonical project documents include:

### Discovery

- `/docs/discovery/CURRENT_STATE.md`
- `/docs/discovery/CODEBASE_MAP.md`
- `/docs/discovery/GAP_ANALYSIS.md`

### Product

- `/docs/product/PRD.md`
- `/docs/product/MVP_SCOPE.md`
- `/docs/product/USER_STORIES.md`

### Architecture

- `/docs/architecture/ARCHITECTURE.md`
- `/docs/architecture/DATABASE.md`
- `/docs/architecture/AUTH.md`
- `/docs/architecture/RBAC.md`
- `/docs/architecture/REALTIME.md`

This implementation plan does not replace those documents.

---

## 5. Authority and Conflict Resolution

Use the authority hierarchy defined by `CONTEXT_MAP.md`.

Current code is evidence of implementation state, not necessarily product truth.

If code conflicts with approved architecture:

1. verify the conflict;
2. identify the authoritative document;
3. determine whether repair is feasible;
4. assess migration, security, and UI impact;
5. implement the smallest compatible change;
6. synchronize affected documentation.

Stop for approval when the conflict requires a major architecture change, scope change, destructive migration, paid service, or weakened security.

---

## 6. Dependency Graph

```text
REPOSITORY BASELINE
        │
        ▼
FIREBASE FOUNDATION
        │
        ▼
AUTH + USER MODEL
        │
        ▼
RBAC + SECURITY FOUNDATION
        │
        ├──────────────────┐
        ▼                  ▼
COMMUNITIES            ADMIN CORE
        │                  │
   ┌────┼────┐             │
   ▼    ▼    ▼             ▼
POSTS EVENTS MEMBERSHIP  MANAGEMENT
   │    │      │
   │    │      ▼
   │    │     CHAT
   │    ▼
   │  CALENDAR
   ▼
COMMENTS

AUTH + USER MODEL
        │
        ▼
FRIEND CODES
        │
        ▼
FRIENDSHIPS / BLOCKING
        │
        ▼
DIRECT MESSAGES
        │
        ▼
NOTIFICATIONS
```

Do not implement dependent systems before their required foundations are stable.

---

## 7. Critical Path

The deadline-critical path is:

```text
BASELINE
→ FIREBASE FOUNDATION
→ AUTH
→ SECURITY
→ COMMUNITIES
→ ADMIN CORE
→ POSTS
→ EVENTS
→ COMMUNITY CHAT
→ HARDENING
→ BUILD / DEPLOYMENT READINESS
```

After the critical path is stable, continue immediately with:

```text
FRIENDS
→ DIRECT MESSAGES
→ NOTIFICATIONS
→ SEARCH / DISCOVERY
```

These remain approved MVP features. The critical path only determines execution priority.

---

# 8. Phase 0 — Repository Baseline and Verification

## Objective

Establish a verified baseline before modifying application behavior.

## Required Context

Follow `CONTEXT_MAP.md` for discovery and refactoring tasks.

At minimum inspect:

- `CURRENT_STATE.md`;
- `CODEBASE_MAP.md`;
- `GAP_ANALYSIS.md`;
- `ARCHITECTURE.md`;
- package configuration;
- source structure;
- Firebase configuration;
- Firestore Rules;
- Storage Rules;
- existing tests;
- build scripts;
- environment-variable usage.

## Tasks

1. Verify repository structure against `CODEBASE_MAP.md`.
2. Verify installed dependencies.
3. Verify Firebase SDK configuration.
4. Identify existing authentication implementation.
5. Identify current Firestore collections and query patterns.
6. Identify Base64 media persistence.
7. Identify current community, post, event, chat, friend, DM, notification, and admin implementations.
8. Run existing validation commands.
9. Record pre-existing failures separately from failures introduced later.
10. Verify that no secrets are committed.
11. Identify missing emulator/test infrastructure.
12. Produce a concise baseline report.

## Acceptance Gate

- repository structure verified;
- application dependency installation succeeds or exact blocker reported;
- current build result known;
- current type-check/lint/test result known where scripts exist;
- Firebase configuration locations known;
- current rules located;
- existing feature implementations mapped;
- pre-existing failures documented;
- no implementation phase has started.

## Stop Conditions

Stop if:

- repository is materially different from discovery documents;
- required source files are missing;
- credentials/secrets are exposed;
- application cannot be installed or inspected;
- a major undocumented architecture change already exists.

---

# 9. Phase 1 — Firebase Foundation and Data Model Alignment

## Objective

Align Firebase access, data types, collections, Storage usage, and query foundations with approved architecture without yet rebuilding every feature.

## Required Context

- `ARCHITECTURE.md`
- `DATABASE.md`
- `AUTH.md`
- `RBAC.md`
- relevant discovery documents

## Tasks

1. Audit Firebase initialization and service boundaries.
2. Remove duplicate or conflicting Firebase initialization patterns.
3. Centralize Firebase access only where compatible with current architecture.
4. Align TypeScript models with approved data contracts.
5. Identify legacy fields requiring temporary compatibility.
6. Add or align required collection/service abstractions.
7. Synchronize known database amendments:
   - `friendCodes/`;
   - `communityReadStates/`;
   - conversation `readState`;
   - `mentionedUserIds` where applicable.
8. Identify required Firestore indexes.
9. Establish Firebase Storage metadata patterns.
10. Do not migrate every feature in this phase.
11. Preserve backward compatibility where feasible.

## Acceptance Gate

- Firebase initialization is deterministic;
- core data types align with approved architecture;
- required collection contracts are represented;
- legacy compatibility risks are documented;
- no Base64-to-Storage migration is falsely claimed complete;
- build/type validation passes or exact pre-existing blocker is documented;
- `DATABASE.md` is synchronized with approved amendments.

## Stop Conditions

Stop if:

- destructive production-data migration is required;
- existing data cannot be made backward-compatible without product decisions;
- Firebase provider or primary database replacement appears necessary;
- paid infrastructure becomes necessary.

---

# 10. Phase 2 — Authentication, Onboarding, Roles, and Security Foundation

## Objective

Create a reliable identity and authorization foundation.

## Required Context

- `AUTH.md`
- `RBAC.md`
- `DATABASE.md`
- relevant user stories

## Tasks

1. Audit and repair existing Firebase Authentication flows.
2. Preserve existing login/register UI.
3. Implement approved email verification behavior.
4. Implement approved college-domain validation.
5. Implement campus selection when a domain maps to multiple campuses.
6. Persist permanent `collegeId`.
7. Implement onboarding completion.
8. Implement migration onboarding for incomplete legacy users.
9. Generate and persist unique friend codes.
10. Implement deterministic session restoration.
11. Route users by role and account state.
12. Enforce protected user fields.
13. Prevent self-assignment of roles/status/college.
14. Establish Student, College Admin, and Super Admin boundaries.
15. Add highest-priority Security Rules tests.

## Acceptance Gate

- existing eligible users can authenticate;
- new eligible users can complete onboarding;
- legacy incomplete users have a migration path;
- college assignment is stable;
- friend codes are generated safely;
- role-specific routing works;
- suspended/disabled states are enforced;
- Students cannot modify protected fields;
- users cannot self-escalate roles;
- cross-college access foundations are enforced;
- relevant auth/security tests pass;
- production build passes.

## Git Checkpoint Recommendation

```text
feat(auth): complete onboarding role routing and security foundation
```

---

# 11. Phase 3 — Communities and Membership

## Objective

Deliver reliable same-college community discovery and membership.

## Required Context

- `MVP_SCOPE.md`
- `USER_STORIES.md`
- `DATABASE.md`
- `RBAC.md`

## Tasks

1. Audit existing community UI and logic.
2. Preserve existing community screens.
3. Restrict discovery to the user's college.
4. Allow public same-college community metadata, posts, and events according to approved policy.
5. Implement instant join.
6. Implement leave behavior.
7. Implement deterministic membership records.
8. Prevent cross-college joins.
9. Ensure member-only systems can reliably check membership.
10. Add authorization tests.

## Acceptance Gate

- Students see only permitted same-college communities;
- community metadata loads correctly;
- Students can join and leave;
- membership state remains consistent;
- cross-college membership is denied;
- unauthorized direct Firestore operations fail;
- existing UI is preserved;
- build and relevant tests pass.

## Git Checkpoint Recommendation

```text
feat(communities): complete tenant-scoped membership workflows
```

---

# 12. Phase 4 — College Admin Core

## Objective

Deliver a functional College Admin control plane.

## Required Context

- `MVP_SCOPE.md`
- `AUTH.md`
- `RBAC.md`
- `DATABASE.md`

## Tasks

1. Audit existing admin dashboard.
2. Preserve existing usable UI.
3. Implement College Admin role entry.
4. Show only assigned-college management data.
5. Implement community create/read/update/archive-or-approved-delete behavior.
6. Implement community oversight.
7. Implement event-management foundation.
8. Implement user/community counts where cost-efficient.
9. Implement community suspension/moderation controls.
10. Prevent College Admins from modifying peer admin authority.
11. Prevent cross-college administration.
12. Add authorization tests.

## Acceptance Gate

- College Admins enter the correct dashboard;
- admins manage every community in their own college;
- admins cannot manage another college;
- admins cannot join communities as Students;
- admins cannot alter peer admin authority;
- moderation boundaries are enforced;
- UI remains consistent with existing design;
- tests and build pass.

## Git Checkpoint Recommendation

```text
feat(admin): implement college-scoped administration core
```

---

# 13. Phase 5 — Posts, Comments, Reactions, and Storage

## Objective

Deliver community content workflows with proper media persistence.

## Required Context

- `MVP_SCOPE.md`
- `USER_STORIES.md`
- `DATABASE.md`
- `RBAC.md`

## Tasks

1. Audit existing post/comment/reaction implementation.
2. Preserve current content UI.
3. Implement same-college post visibility.
4. Enforce membership for post creation.
5. Support up to five post attachments.
6. Replace Base64 persistence with Firebase Storage where present.
7. Validate attachment count, MIME type, and size.
8. Implement flat comments.
9. Implement like-only reactions.
10. Prevent duplicate like state.
11. Implement approved ownership/moderation behavior.
12. Add bounded queries and pagination where necessary.
13. Add Security Rules and critical behavior tests.

## Acceptance Gate

- posts display according to college/community policy;
- joined Students can create posts;
- attachments use Storage rather than Base64 Firestore payloads;
- attachment limits are enforced;
- comments are flat;
- likes behave consistently;
- unauthorized mutations fail;
- moderation follows RBAC;
- UI remains preserved;
- tests and build pass.

## Git Checkpoint Recommendation

```text
feat(posts): complete community content and storage workflows
```

---

# 14. Phase 6 — Events, Calendar, and Dashboard Reminders

## Objective

Create one consistent event system across admin, community, calendar, and dashboard surfaces.

## Required Context

- `MVP_SCOPE.md`
- `USER_STORIES.md`
- `DATABASE.md`
- `RBAC.md`
- `REALTIME.md`

## Tasks

1. Audit existing event implementations.
2. Establish canonical event records.
3. Implement College Admin event creation/management.
4. Display permitted same-college events.
5. Implement event registration if approved by current data model.
6. Drive calendar from canonical event records.
7. Drive dashboard reminders from the same records.
8. Use bounded screen-scoped listeners.
9. Prevent duplicate event sources of truth.
10. Add authorization and synchronization tests.

## Acceptance Gate

- College Admins can manage own-college events;
- Students can view permitted events;
- calendar and dashboard use canonical event data;
- event updates remain consistent across surfaces;
- cross-college event management fails;
- listeners clean up correctly;
- tests and build pass.

## Git Checkpoint Recommendation

```text
feat(events): unify events calendar and dashboard reminders
```

---

# 15. Phase 7 — Community Chat

## Objective

Deliver secure, paginated, real-time community chat.

## Required Context

- `REALTIME.md`
- `DATABASE.md`
- `RBAC.md`

## Tasks

1. Audit existing chat implementation.
2. Preserve existing chat UI.
3. Enforce active membership access.
4. Enforce community suspension restrictions.
5. Load latest 30 messages.
6. Add cursor-based history pagination.
7. Add bounded listener for new messages.
8. Deduplicate history and listener results by document ID.
9. Implement explicit listener cleanup.
10. Support up to three attachments per message.
11. Enforce approved attachment size limits.
12. Store attachments in Firebase Storage.
13. Implement structured mentions with maximum five users.
14. Keep Student messages immutable.
15. Allow same-college College Admin moderation access without ordinary participation.
16. Add listener, pagination, authorization, and rules tests.

## Acceptance Gate

- authorized members can access chat;
- non-members cannot access member-only chat;
- suspended Students cannot send messages;
- latest messages load correctly;
- older history paginates;
- new messages arrive live;
- duplicate messages do not appear;
- listeners clean up;
- attachments obey limits;
- messages are immutable for Students;
- cross-college access fails;
- tests and build pass.

## Git Checkpoint Recommendation

```text
feat(chat): implement secure paginated realtime community chat
```

---

# 16. Phase 8 — Friend Codes, Requests, Friendships, and Blocking

## Objective

Deliver same-college private relationship workflows required by DMs.

## Required Context

- `MVP_SCOPE.md`
- `USER_STORIES.md`
- `DATABASE.md`
- `AUTH.md`
- `RBAC.md`

## Tasks

1. Audit existing friend implementation.
2. Implement direct friend-code lookup.
3. Prevent cross-college relationships.
4. Implement friend requests.
5. Implement accept/reject behavior.
6. Implement active friendship state.
7. Implement unfriend-as-block behavior according to approved product decision.
8. Prevent blocked relationships from using DMs.
9. Preserve private profile policy.
10. Add relationship and authorization tests.

## Acceptance Gate

- valid same-college friend codes resolve;
- invalid/cross-college relationships fail;
- requests can be accepted/rejected;
- friendship state is consistent;
- unfriend/block behavior is enforced;
- blocked users cannot DM;
- private profile constraints remain intact;
- tests and build pass.

## Git Checkpoint Recommendation

```text
feat(friends): implement friend codes relationships and blocking
```

---

# 17. Phase 9 — Direct Messages and Read State

## Objective

Deliver secure one-thread-per-pair direct messaging.

## Required Context

- `REALTIME.md`
- `DATABASE.md`
- `RBAC.md`

## Tasks

1. Audit existing DM implementation.
2. Preserve current messaging UI.
3. Implement canonical pair IDs.
4. Ensure one conversation per Student pair.
5. Enforce active friendship and block state.
6. Implement real-time conversation inbox.
7. Implement latest-30 thread loading.
8. Implement cursor history pagination.
9. Implement bounded new-message listener.
10. Implement document-ID deduplication.
11. Implement conversation `readState`.
12. Support approved attachments through Storage.
13. Use batched writes where appropriate and rules-compatible.
14. Prevent College Admin and Super Admin private-DM access by default.
15. Add privacy, pagination, read-state, and Security Rules tests.

## Acceptance Gate

- one canonical conversation exists per pair;
- only authorized friends can DM;
- blocked users cannot DM;
- only participants can read messages;
- inbox updates correctly;
- history paginates;
- new messages arrive live;
- read state updates correctly;
- privileged roles do not gain default private access;
- tests and build pass.

## Git Checkpoint Recommendation

```text
feat(messages): implement private realtime messaging and read state
```

---

# 18. Phase 10 — In-App Notifications

## Objective

Deliver persistent, scoped, paginated in-app notifications.

## Required Context

- `REALTIME.md`
- `DATABASE.md`
- `RBAC.md`

## Tasks

1. Audit existing notification implementation.
2. Implement approved notification types.
3. Implement recipient-scoped notification queries.
4. Add one bounded authenticated-session listener.
5. Implement pagination.
6. Connect friend, event, DM, and mention workflows where feasible.
7. Prevent notification access by other users.
8. Do not implement browser push notifications.
9. Do not implement scheduled cleanup.
10. Add notification authorization tests.

## Acceptance Gate

- notifications are recipient-scoped;
- relevant workflows create notifications;
- live notification updates work;
- history paginates;
- unauthorized reads fail;
- no push infrastructure is introduced;
- tests and build pass.

## Git Checkpoint Recommendation

```text
feat(notifications): implement persistent in-app notification workflows
```

---

# 19. Phase 11 — Search and Profile Discovery

## Objective

Complete approved discovery behavior without violating tenant or privacy constraints.

## Required Context

- `MVP_SCOPE.md`
- `USER_STORIES.md`
- `DATABASE.md`
- `AUTH.md`
- `RBAC.md`

## Tasks

1. Audit existing search.
2. Implement approved searchable resources.
3. Keep posts excluded from search according to current decision.
4. Restrict Student/profile discovery to same-college scope.
5. Preserve private profile rules.
6. Avoid exposing email, phone number, or prohibited personal fields.
7. Use bounded queries.
8. Document Firestore search limitations.
9. Avoid adding paid external search infrastructure.

## Acceptance Gate

- approved resources are searchable;
- posts remain excluded;
- tenant boundaries are preserved;
- private fields are not exposed;
- queries are bounded;
- no paid search service is introduced;
- build and relevant tests pass.

## Git Checkpoint Recommendation

```text
feat(search): complete tenant-scoped discovery workflows
```

---

# 20. Phase 12 — Security Testing and Integration Hardening

## Objective

Validate the application as a coherent system and resolve deadline-critical defects.

## Required Context

All relevant architecture documents and user stories.

## Tasks

1. Run complete available type checking.
2. Run linting.
3. Run automated tests.
4. Run Firestore Security Rules tests.
5. Run Storage Rules tests where available.
6. Verify authentication failure paths.
7. Verify protected user fields.
8. Verify tenant isolation.
9. Verify Student/College Admin/Super Admin boundaries.
10. Verify community membership restrictions.
11. Verify community suspension.
12. Verify private DM participant-only access.
13. Verify attachment limits.
14. Verify listener cleanup.
15. Verify pagination.
16. Verify event consistency.
17. Verify notification scoping.
18. Inspect for Base64 Firestore media remnants.
19. Inspect for secrets.
20. Inspect for unbounded queries and unmanaged listeners.
21. Fix deadline-critical integration defects.
22. Record non-critical deferred issues.

## Acceptance Gate

- no known critical security defect remains;
- no known cross-college data leak remains;
- no known privilege-escalation path remains;
- production build passes;
- critical tests pass;
- known limitations are documented;
- diff contains no unrelated destructive changes.

## Git Checkpoint Recommendation

```text
test(hardening): complete security and integration validation
```

---

# 21. Phase 13 — Production Build and Firebase Deployment Readiness

## Objective

Prepare the application for controlled deployment.

## Required Context

- `ARCHITECTURE.md`
- `MVP_SCOPE.md`
- future `DEPLOYMENT.md`
- `AGENTS.md`

## Tasks

1. Verify production environment configuration.
2. Verify Firebase project configuration.
3. Verify Hosting configuration.
4. Verify Firestore indexes.
5. Verify Security Rules deployment files.
6. Verify Storage Rules deployment files.
7. Run clean production build.
8. Check bundle/build warnings.
9. Verify no secrets are included.
10. Verify critical application routes.
11. Produce deployment checklist.
12. Do not deploy to production without explicit approval.

## Acceptance Gate

- clean production build succeeds;
- deployment configuration is known and documented;
- required rules/index files are ready;
- no known secret exposure exists;
- critical routes are verified;
- deployment checklist is complete;
- production deployment awaits explicit approval.

## Git Checkpoint Recommendation

```text
chore(release): prepare SurgeSkill MVP deployment
```

---

# 22. Testing Strategy

Testing is risk-based, not coverage-percentage-driven.

## Highest Priority

- Firestore Security Rules;
- Storage authorization;
- authentication;
- account states;
- protected identity fields;
- tenant isolation;
- role boundaries;
- membership;
- College Admin scope;
- private DM access.

## Medium Priority

- pagination;
- listener cleanup;
- read cursors;
- friendship/block state;
- event synchronization;
- notification scoping;
- attachment validation.

## Lower Deadline Priority

- static presentation;
- purely visual components;
- simple display utilities.

Do not skip critical security tests to increase superficial feature coverage.

---

# 23. UI Preservation Rules

Agents must:

- inspect existing UI before editing;
- reuse existing components where feasible;
- preserve layout and visual hierarchy;
- preserve navigation patterns;
- avoid generic replacement dashboards;
- avoid broad CSS rewrites;
- avoid unrelated styling changes;
- report any unavoidable visible changes.

A functional change must not become an unsolicited redesign.

---

# 24. Repair-vs-Replace Protocol

Before replacement, report:

```text
Subsystem
Current Implementation
Verified Defect or Architectural Conflict
Why Repair Is Insufficient
Migration Impact
Security Impact
UI Impact
Replacement Scope
Validation Plan
```

If repair is feasible, repair.

---

# 25. Stop Conditions

Stop the current execution batch and request guidance when:

- canonical documents materially conflict;
- approved MVP scope must change;
- production data destruction or irreversible migration is required;
- Security Rules would need weakening;
- tenant isolation would change;
- authentication strategy would change;
- role semantics would change;
- a major runtime dependency is required;
- paid infrastructure is required;
- Firebase/provider replacement appears necessary;
- user changes would need to be discarded;
- destructive Git operations appear necessary;
- required credentials are missing;
- production deployment is the next step;
- a failure outside current scope prevents safe continuation.

Do not improvise around these conditions.

---

# 26. Git Checkpoint Strategy

After each accepted phase:

1. review `git status`;
2. review `git diff`;
3. verify no unrelated changes;
4. confirm validation results;
5. commit the accepted batch;
6. begin the next phase from a known checkpoint.

Never use destructive Git commands to clean up agent mistakes.

The user should create or approve commits after reviewing each phase.

---

# 27. Required Phase Report

At the end of every phase, Antigravity must report:

```text
PHASE
SUMMARY
CONTEXT READ
FILES INSPECTED
FILES CHANGED
BEHAVIOR IMPLEMENTED
REPAIRED VS REPLACED
VALIDATION COMMANDS
VALIDATION RESULTS
SECURITY IMPACT
DATABASE IMPACT
UI IMPACT
DOCUMENTATION UPDATED
KNOWN LIMITATIONS
PRE-EXISTING ISSUES
FOLLOW-UP OBSERVATIONS
ACCEPTANCE GATE STATUS
```

Do not begin the next phase automatically.

---

# 28. Recommended Antigravity Prompt Pattern

Use:

```text
Read AGENTS.md and docs/ai/CONTEXT_MAP.md.

Execute Phase [N] of docs/engineering/IMPLEMENTATION_PLAN.md.

Follow all required context-routing, planning, repair-first, UI-preservation,
security, validation, stop-condition, and reporting requirements.

Operate autonomously within this phase.

Do not begin any later phase.

Return the required phase report and acceptance-gate status when complete.
```

This gives Antigravity autonomy within a controlled execution boundary.

---

# 29. Deferred Work

The following are explicitly deferred unless scope is changed:

- group calls;
- browser push notifications;
- typing indicators;
- online presence;
- message editing;
- message deletion;
- exact community unread counts;
- automated notification cleanup;
- advanced server-side rate limiting;
- paid infrastructure;
- Framer landing-page code migration;
- complex automated moderation;
- video hosting;
- monetization.

Do not implement deferred systems opportunistically.

---

# 30. Definition of MVP Completion

The SurgeSkill MVP is complete when:

- eligible Students can authenticate and onboard;
- college assignment and tenant isolation are enforced;
- role routing works;
- College Admins can manage their assigned college;
- Students can discover and join same-college communities;
- posts, comments, likes, and approved attachments work;
- events remain consistent across community, calendar, and dashboard surfaces;
- community chat provides secure paginated real-time messaging;
- friend-code and relationship workflows work;
- authorized friends can use private DMs;
- DMs remain participant-only;
- in-app notifications work;
- approved discovery/search works;
- critical Security Rules tests pass;
- no known critical tenant-isolation or privilege-escalation defect remains;
- production build succeeds;
- existing UI has been preserved as much as possible;
- known limitations and deferred work are documented;
- Firebase deployment configuration is ready for controlled release.

---

## Final Execution Principle

```text
UNDERSTAND
→ VERIFY
→ PLAN
→ IMPLEMENT ONE BOUNDED PHASE
→ TEST
→ REVIEW
→ REPORT
→ CHECKPOINT
→ CONTINUE
```

The objective is controlled, evidence-based AI-assisted engineering—not uncontrolled feature generation.
