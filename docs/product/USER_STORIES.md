# SurgeSkill User Stories

## 1. Document Purpose

This document translates the SurgeSkill PRD and MVP scope into testable user behavior. It defines how Students, College Admins, and Super Admins interact with the product.

Each user story contains:
- a unique story ID;
- the user intent;
- acceptance criteria;
- related PRD requirements;
- MVP priority.

Architecture and implementation details do not belong in this document.

---

## 2. Acceptance Criteria Convention

Acceptance criteria use the following structure where appropriate:

- **GIVEN** a known initial state;
- **WHEN** the user performs an action;
- **THEN** the expected behavior occurs;
- **AND** additional constraints are satisfied.

---

# Epic 1 — Authentication and College Identity

## US-AUTH-001 — Register with a recognized college email

**As a** student,  
**I want to** register using my recognized college email,  
**so that** SurgeSkill can associate me with the correct college ecosystem.

### Acceptance Criteria

- **GIVEN** the student provides an email belonging to a recognized college domain,
- **WHEN** registration is successfully completed,
- **THEN** the account is associated with the correct college,
- **AND** the required email-verification process is initiated or enforced,
- **AND** the student is not granted access to another college tenant.

**Related Requirements:** `AUTH-001`, `AUTH-002`, `AUTH-003`, `TEN-001`  
**Priority:** P0

## US-AUTH-002 — Handle an unrecognized college email

**As a** prospective student,  
**I want to** receive a clear response when my college is unavailable,  
**so that** I understand why I cannot complete normal onboarding and what I can do next.

### Acceptance Criteria

- **GIVEN** the email domain is not associated with a recognized college,
- **WHEN** the user attempts registration,
- **THEN** the system does not automatically assign a college,
- **AND** the user receives a clear unavailable-college state,
- **AND** a request or contact path is provided.

**Related Requirements:** `AUTH-004`  
**Priority:** P0

## US-AUTH-003 — Verify student email identity

**As a** student,  
**I want to** verify my college email,  
**so that** access to my college ecosystem is based on a verified identity.

### Acceptance Criteria

- **GIVEN** a student account requires verification,
- **WHEN** the student has not completed verification,
- **THEN** protected college-scoped onboarding/access is restricted according to product rules.
- **WHEN** verification succeeds,
- **THEN** the student may continue the authorized onboarding flow.

**Related Requirements:** `AUTH-002`  
**Priority:** P0

## US-AUTH-004 — Login through a shared authentication surface

**As a** SurgeSkill user,  
**I want to** log in through the common authentication interface,  
**so that** I am routed to the correct experience for my authorized role.

### Acceptance Criteria

- **GIVEN** a valid authenticated user,
- **WHEN** login succeeds,
- **THEN** the user is routed according to the trusted `STUDENT`, `COLLEGE_ADMIN`, or `SUPER_ADMIN` role,
- **AND** privileged routing does not depend on a client-side password comparison.

**Related Requirements:** `AUTH-005`, `AUTH-006`  
**Priority:** P0

## US-AUTH-005 — Recover account access

**As a** user,  
**I want to** recover access to my account,  
**so that** a forgotten password does not permanently block me.

### Acceptance Criteria

- A valid account-recovery path is available.
- Recovery failures provide clear feedback.
- Successful recovery does not alter college or role authorization.

**Related Requirements:** `AUTH-007`  
**Priority:** P0

---

# Epic 2 — Tenant Isolation and Student Access

## US-TEN-001 — Access only my college ecosystem

**As a** student,  
**I want to** access only resources belonging to my verified college,  
**so that** SurgeSkill remains a private college-scoped environment.

### Acceptance Criteria

- **GIVEN** a student belongs to College A,
- **WHEN** the student accesses communities, posts, chat, events, users, or search,
- **THEN** College B tenant resources are not returned or accessible,
- **AND** direct attempts to access unauthorized tenant data are denied outside the UI layer.

**Related Requirements:** `TEN-001`, `TEN-003`, `TEN-005`  
**Priority:** P0

## US-TEN-002 — Prevent students from changing their college

**As a** platform operator,  
**I want to** prevent students from editing their verified college through normal settings,  
**so that** tenant identity remains trustworthy.

### Acceptance Criteria

- Students cannot directly modify their verified `collegeId`.
- Profile updates do not permit tenant reassignment.
- Exceptional corrections require an authorized administrative process.

**Related Requirements:** `TEN-006`  
**Priority:** P0

---

# Epic 3 — Student Dashboard

## US-DASH-001 — View my personalized dashboard

**As a** student,  
**I want to** see relevant college and learning activity when I enter SurgeSkill,  
**so that** I can quickly understand what requires my attention.

### Acceptance Criteria

- The dashboard displays relevant communities, upcoming events, reminders, and notifications.
- Loading, empty, success, and error states are clear.
- Dashboard data is consistent with authoritative data shown elsewhere.

**Related Requirements:** `USR-001`, `USR-002`, `USR-003`  
**Priority:** P1

## US-DASH-002 — Navigate the student application

**As a** student,  
**I want to** move efficiently between major product sections,  
**so that** SurgeSkill feels coherent and production-grade.

### Acceptance Criteria

- Major sections are reachable through consistent navigation.
- Navigation works on supported desktop and mobile viewports.
- Normal navigation does not require unnecessary full-page reloads.

**Related Requirements:** `USR-004`, `NFR-001`  
**Priority:** P1

---

# Epic 4 — Communities and Membership

## US-COM-001 — Discover my college communities

**As a** student,  
**I want to** browse communities belonging to my college,  
**so that** I can find relevant learning groups.

### Acceptance Criteria

- Only communities belonging to the student's verified college are discoverable.
- Unauthorized tenant communities are inaccessible even through direct requests.
- Appropriate empty and loading states are provided.

**Related Requirements:** `COM-001`, `TEN-003`  
**Priority:** P1

## US-COM-002 — Join multiple communities

**As a** student,  
**I want to** join multiple learning communities,  
**so that** I can participate in different subjects and skills.

### Acceptance Criteria

- A student may join multiple authorized communities.
- Duplicate membership is prevented.
- Membership state remains consistent across community and dashboard surfaces.

**Related Requirements:** `COM-002`, `COM-003`  
**Priority:** P1

## US-COM-003 — Leave a community

**As a** student,  
**I want to** leave a community voluntarily,  
**so that** I control my active learning memberships.

### Acceptance Criteria

- An existing member may leave an eligible community.
- Membership-dependent access changes accordingly.
- Leaving one community does not affect unrelated memberships.

**Related Requirements:** `COM-004`  
**Priority:** P1

## US-COM-004 — Use a community workspace

**As a** community member,  
**I want to** access the community feed, chat, events, and member context,  
**so that** learning activity is organized in one place.

### Acceptance Criteria

- Authorized members can reach supported community sections.
- Unsupported or unauthorized sections are not exposed.
- Community identity and data remain consistent across sections.

**Related Requirements:** `COM-005`  
**Priority:** P1

---

# Epic 5 — Community Posts

## US-POST-001 — Browse persistent learning posts

**As a** community member,  
**I want to** browse persistent community posts,  
**so that** useful knowledge does not disappear in real-time chat.

### Acceptance Criteria

- Posts are displayed separately from chat.
- Posts belong to the correct community and college.
- Authorized members can retrieve persistent post history.

**Related Requirements:** `POST-001`, `POST-002`, `POST-004`  
**Priority:** P1

## US-POST-002 — Create a community post

**As a** community member,  
**I want to** publish educational content or resources,  
**so that** I can contribute knowledge to my peers.

### Acceptance Criteria

- Authorized members can create valid posts.
- Unauthorized users cannot create posts in the community.
- New posts appear in the correct persistent feed.

**Related Requirements:** `POST-003`, `POST-004`  
**Priority:** P1

---

# Epic 6 — Real-Time Community Chat and Media

## US-CHAT-001 — Exchange real-time community messages

**As a** community member,  
**I want to** exchange messages in real time,  
**so that** I can collaborate directly with other members.

### Acceptance Criteria

- Authorized members can send and receive messages in real time.
- Message history is retained and retrievable.
- Non-members and cross-college users cannot access the conversation.

**Related Requirements:** `CHAT-001`, `CHAT-002`, `CHAT-007`, `CHAT-008`  
**Priority:** P1

## US-CHAT-002 — Reply and react to messages

**As a** community member,  
**I want to** reply and react to messages,  
**so that** conversations remain contextual and expressive.

### Acceptance Criteria

- Users can reply to eligible messages.
- Users can add supported reactions.
- Reply/reaction behavior remains associated with the correct message and community.

**Related Requirements:** `CHAT-003`, `CHAT-004`  
**Priority:** P1

## US-CHAT-003 — Delete my own message

**As a** community member,  
**I want to** delete my own eligible messages,  
**so that** I retain appropriate control over my contributions.

### Acceptance Criteria

- Users can delete only messages they are authorized to delete.
- Users cannot delete another member's messages through normal student permissions.
- The resulting state remains consistent for connected clients.

**Related Requirements:** `CHAT-005`  
**Priority:** P1

## US-MED-001 — Share approved media

**As a** community member,  
**I want to** share approved images and documents,  
**so that** learning resources can be exchanged effectively.

### Acceptance Criteria

- Supported file types and sizes are validated.
- Media uses the approved storage architecture rather than large Base64 application records.
- Media access follows the owning community/message authorization.
- Invalid uploads fail with clear feedback.

**Related Requirements:** `CHAT-006`, `MED-001`, `MED-002`, `MED-003`, `MED-004`  
**Priority:** P1

---

# Epic 7 — Events and Calendar

## US-EVT-001 — Discover college events

**As a** student,  
**I want to** discover relevant events in my college,  
**so that** I can participate in learning activities.

### Acceptance Criteria

- Students see only authorized college events.
- Community-linked events retain correct community association.
- Event details are consistent across product surfaces.

**Related Requirements:** `EVT-002`, `EVT-003`  
**Priority:** P1

## US-EVT-002 — Register for an event

**As a** student,  
**I want to** register or unregister for eligible events,  
**so that** I can manage my participation.

### Acceptance Criteria

- Registration/unregistration works where enabled.
- Duplicate registration is prevented.
- Participation state remains consistent across event, dashboard, and calendar surfaces.

**Related Requirements:** `EVT-004`  
**Priority:** P1

## US-CAL-001 — View my internal calendar

**As a** student,  
**I want to** view relevant events in the SurgeSkill calendar,  
**so that** I can track upcoming activities.

### Acceptance Criteria

- The calendar displays authorized relevant events.
- Event changes propagate consistently.
- The calendar does not maintain a conflicting independent event record.

**Related Requirements:** `EVT-005`, `CAL-001`, `CAL-002`, `CAL-003`  
**Priority:** P1

---

# Epic 8 — Notifications

## US-NOT-001 — Receive persistent in-app notifications

**As a** student,  
**I want to** receive notifications for important activity,  
**so that** I do not miss relevant interactions and events.

### Acceptance Criteria

- Defined MVP triggers create persistent notifications.
- Triggers include relevant DMs, mentions, event changes, and reminders.
- Notifications never expose unauthorized tenant resources.
- Notifications can lead to the relevant authorized context where practical.

**Related Requirements:** `NOT-001` through `NOT-004`  
**Priority:** P1

---

# Epic 9 — Privacy, Friends, and Direct Messaging

## US-PRIV-001 — Keep private contact information hidden

**As a** student,  
**I want to** keep sensitive contact information private,  
**so that** using SurgeSkill does not expose my personal details.

### Acceptance Criteria

- Email and phone number are not publicly displayed to students.
- College-visible profiles expose only approved fields.
- User discovery respects college and privacy boundaries.

**Related Requirements:** `PRIV-001` through `PRIV-005`  
**Priority:** P1

## US-FRD-001 — Share my friend code

**As a** student,  
**I want to** have a unique friend code,  
**so that** peers can intentionally connect with me.

### Acceptance Criteria

- Every eligible student has a valid unique identifier.
- The code does not expose private contact information.
- Invalid codes cannot create relationships.

**Related Requirements:** `FRD-001`  
**Priority:** P1

## US-FRD-002 — Send and respond to friend requests

**As a** student,  
**I want to** send, accept, or reject friend requests,  
**so that** I control who can directly communicate with me.

### Acceptance Criteria

- Valid requests can be initiated through the defined code flow.
- Recipients explicitly accept or reject.
- Duplicate, invalid, and self-directed requests are prevented.
- Friendship exists only after acceptance.

**Related Requirements:** `FRD-002` through `FRD-006`  
**Priority:** P1

## US-DM-001 — Message an accepted friend

**As a** student,  
**I want to** direct-message an accepted friend,  
**so that** we can communicate privately.

### Acceptance Criteria

- Accepted friends can exchange real-time messages.
- Message history is retained.
- Non-friends cannot initiate unrestricted DMs.
- Authorization is enforced independently of UI visibility.
- Approved media follows applicable authorization.

**Related Requirements:** `DM-001` through `DM-005`  
**Priority:** P1

---

# Epic 10 — College Administration

## US-CADM-001 — Access my college admin dashboard

**As a** college admin,  
**I want to** access a dedicated administration dashboard,  
**so that** I can oversee SurgeSkill activity for my college.

### Acceptance Criteria

- Only authorized college admins can access the dashboard.
- Relevant analytics and management functions are available.
- Data is restricted to the assigned college.

**Related Requirements:** `CADM-001`, `CADM-002`, `CADM-006`  
**Priority:** P1

## US-CADM-002 — Manage college communities

**As a** college admin,  
**I want to** create, modify, and remove communities for my college,  
**so that** I can organize its learning ecosystem.

### Acceptance Criteria

- Authorized admins can perform supported community management.
- Admins cannot manage another college's communities.
- Destructive actions use appropriate safeguards.

**Related Requirements:** `COM-006`, `COM-007`, `CADM-003`, `CADM-006`  
**Priority:** P1

## US-CADM-003 — Manage college events

**As a** college admin,  
**I want to** create, update, and cancel events,  
**so that** students receive accurate learning opportunities.

### Acceptance Criteria

- Authorized admins manage only events in their assigned college.
- Changes propagate to dependent surfaces.
- Unauthorized administration is denied outside the UI.

**Related Requirements:** `EVT-001`, `EVT-005`, `CADM-004`, `CADM-006`  
**Priority:** P1

## US-CADM-004 — Perform authorized moderation

**As a** college admin,  
**I want to** perform approved member-management and moderation actions,  
**so that** my college ecosystem can be managed responsibly.

### Acceptance Criteria

- Only defined moderation actions are available.
- Actions are restricted to the assigned college.
- Destructive or sensitive actions have safeguards.

**Related Requirements:** `CADM-005`, `CADM-006`, `NFR-010`  
**Priority:** P1

---

# Epic 11 — Super Administration

## US-SADM-001 — Manage colleges and recognized domains

**As a** super admin,  
**I want to** manage college records and email-domain associations,  
**so that** student identity can be assigned to valid tenants.

### Acceptance Criteria

- Authorized super admins can create/update supported college records and domain associations.
- Normal students and college admins cannot perform these operations.
- Operations use trusted authorization.

**Related Requirements:** `SADM-001`, `SADM-002`, `SADM-005`  
**Priority:** P1

## US-SADM-002 — Provision college administrators

**As a** super admin,  
**I want to** manage college-admin access,  
**so that** each college can have authorized local administration.

### Acceptance Criteria

- College-admin provisioning follows a trusted process.
- The admin is associated with the intended college.
- Unauthorized users cannot assign privileged roles.

**Related Requirements:** `SADM-003`, `SADM-005`  
**Priority:** P1

---

# Epic 12 — Search and Discovery

## US-SRCH-001 — Search authorized college resources

**As a** student,  
**I want to** find communities, events, and permitted users in my college,  
**so that** I can discover relevant learning opportunities and peers.

### Acceptance Criteria

- Search results respect college boundaries.
- User discovery respects privacy constraints.
- Unauthorized tenant resources are not returned.

**Related Requirements:** `SRCH-001` through `SRCH-004`  
**Priority:** P1

---

# Epic 13 — Quality and Production Readiness

## US-NFR-001 — Receive clear application feedback

**As a** user,  
**I want to** see clear loading, empty, success, and error states,  
**so that** I understand what the application is doing.

### Acceptance Criteria

- Core MVP flows provide appropriate states.
- Errors do not silently fail.
- Recoverable failures provide a useful next action.

**Related Requirements:** `NFR-002`  
**Priority:** P1

## US-NFR-002 — Use SurgeSkill across supported viewports

**As a** user,  
**I want to** use SurgeSkill on supported desktop and mobile viewport sizes,  
**so that** the product remains accessible across common devices.

### Acceptance Criteria

- Core flows are usable on defined supported viewports.
- Navigation and primary interactions remain functional.
- Responsive behavior is validated before MVP release.

**Related Requirements:** `NFR-001`  
**Priority:** P1

---

## 14. User Story Traceability Rules

1. Every implementation task should reference at least one user story or explicit technical-foundation task.
2. User stories must reference authoritative PRD requirements.
3. Architecture documents must support the behavior defined here.
4. Critical acceptance criteria should map to automated tests where practical.
5. A coding agent should receive only the stories relevant to its bounded task.
6. Changes to role, tenant, privacy, or product behavior require review of the PRD, MVP scope, and affected stories.
7. Implementation details must not be added to user stories unless they represent an approved product constraint.

## 15. Story Completion Standard

A user story is complete only when:
- all acceptance criteria pass;
- applicable authorization is enforced outside the UI;
- relevant automated tests are added or updated;
- loading/error/empty states are handled where applicable;
- related documentation is updated when behavior changes;
- no unrelated functionality is knowingly broken;
- build, lint, and test validation succeeds according to project standards.

## 16. Relationship to Other Context Artifacts

- `CURRENT_STATE.md` — what exists now.
- `CODEBASE_MAP.md` — where existing systems live.
- `GAP_ANALYSIS.md` — what must change.
- `PRD.md` — what the target product must become.
- `MVP_SCOPE.md` — what is included in the current implementation program.
- `USER_STORIES.md` — how users must experience the scoped product.
- Future architecture documents — how the system will technically satisfy these behaviors.
- Future `IMPLEMENTATION_PLAN.md` — the task sequence used to execute the work.

## 17. Product Context Layer Completion

With `PRD.md`, `MVP_SCOPE.md`, and `USER_STORIES.md`, the SurgeSkill Product Context Layer is complete enough to begin target architecture design.

The next context layer shall define:
- system architecture;
- database and data ownership;
- authentication;
- role-based access control and tenant isolation;
- real-time communication architecture.
