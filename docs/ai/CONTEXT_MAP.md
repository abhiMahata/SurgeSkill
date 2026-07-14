# SurgeSkill Context Map

## Purpose
Routes AI coding agents to the minimum sufficient authoritative context for each task.

## Core Protocol
Before modifying code:
1. Classify the task.
2. Read required context.
3. Inspect relevant current code.
4. Plan non-trivial work.
5. Implement only the bounded task.
6. Validate and report results.

## Context Layers
### Global Product Context
- `docs/product/PRD.md`
- `docs/product/MVP_SCOPE.md`
- `docs/architecture/ARCHITECTURE.md`

### Domain Architecture Context
- `docs/architecture/DATABASE.md`
- `docs/architecture/AUTH.md`
- `docs/architecture/RBAC.md`
- `docs/architecture/REALTIME.md`

### Discovery Context
- `docs/discovery/CURRENT_STATE.md`
- `docs/discovery/CODEBASE_MAP.md`
- `docs/discovery/GAP_ANALYSIS.md`

### Local Implementation Context
Inspect actual feature code, Firebase services, rules, tests, configuration, and dependencies before editing.

## Canonical Sources
| Document | Question Answered |
|---|---|
| `CURRENT_STATE.md` | What exists now? |
| `CODEBASE_MAP.md` | Where is it? |
| `GAP_ANALYSIS.md` | What differs from target? |
| `PRD.md` | What is the product? |
| `MVP_SCOPE.md` | What are we building now? |
| `USER_STORIES.md` | What behavior is required? |
| `ARCHITECTURE.md` | How is the system structured? |
| `DATABASE.md` | How is data modeled? |
| `AUTH.md` | How do identity and onboarding work? |
| `RBAC.md` | Who can do what? |
| `REALTIME.md` | How does synchronization work? |
| `IMPLEMENTATION_PLAN.md` | In what order do we build? |
| `TESTING_STRATEGY.md` | How is correctness proven? |
| `DEPLOYMENT.md` | How is the system released? |
| `AGENTS.md` | How must agents behave? |
| `CONTEXT_MAP.md` | What context should agents load? |

## Conflict Resolution
Prefer, in order:
1. Explicit current user instruction for the bounded task.
2. Approved `IMPLEMENTATION_PLAN.md`.
3. `MVP_SCOPE.md`.
4. Relevant domain architecture document.
5. `ARCHITECTURE.md`.
6. `PRD.md`.
7. `USER_STORIES.md`.
8. Discovery documents.
9. Current code.

Current code is evidence of implementation state, not necessarily product truth. Report material unresolved conflicts before irreversible or security-sensitive changes.

## Task Routing

### PRODUCT
Read `PRD.md`, `MVP_SCOPE.md`, and `USER_STORIES.md`.

### UI
Read `PRD.md`, `MVP_SCOPE.md`, and relevant user stories. Inspect feature and shared UI code. Add domain architecture when persistence, permissions, identity, or real-time behavior is affected.

### AUTH
Read `AUTH.md`, `RBAC.md`, and `DATABASE.md`. Inspect auth features, Firebase Auth services, user persistence, and `firestore.rules`.

### DATABASE
Read `DATABASE.md`, `ARCHITECTURE.md`, and relevant domain architecture. Inspect queries, models, indexes, services, and rules. Never change schema without considering query and authorization effects.

### SECURITY
Read `AUTH.md`, `RBAC.md`, and `DATABASE.md`; add `REALTIME.md` for live systems. Inspect Firestore/Storage rules, feature mutations, queries, and security tests.

### COMMUNITIES
Read `MVP_SCOPE.md`, `USER_STORIES.md`, `DATABASE.md`, and `RBAC.md`. Inspect community, membership, admin-management, and rule code.

### POSTS
Read `MVP_SCOPE.md`, `USER_STORIES.md`, `DATABASE.md`, and `RBAC.md`. Inspect posts/comments, Storage logic, and rules.

### CHAT
Read `REALTIME.md`, `DATABASE.md`, and `RBAC.md`. Inspect chat code, message hooks/queries, Firebase services, and rules.

### EVENTS
Read `MVP_SCOPE.md`, `USER_STORIES.md`, `DATABASE.md`, `RBAC.md`, and `REALTIME.md`. Inspect events, calendar, reminders, admin event management, queries, and rules.

### FRIENDS
Read `MVP_SCOPE.md`, `USER_STORIES.md`, `DATABASE.md`, `AUTH.md`, and `RBAC.md`. Inspect friend codes, requests, friendships, blocks, and rules.

### DIRECT_MESSAGES
Read `REALTIME.md`, `DATABASE.md`, and `RBAC.md`. Inspect conversations, messages, read state, friendship/block checks, notifications, and rules.

### NOTIFICATIONS
Read `REALTIME.md`, `DATABASE.md`, and `RBAC.md`. Inspect notification queries, creation workflows, source features, and rules.

### ADMIN
Read `MVP_SCOPE.md`, `RBAC.md`, `DATABASE.md`, and `AUTH.md`. Inspect admin dashboards, management, moderation, account/role handling, and rules.

### TESTING
Read `USER_STORIES.md`, relevant domain architecture, and `TESTING_STRATEGY.md` once created. Inspect modified code, test configuration, and Firebase emulator/rules tests.

### DEPLOYMENT
Read `ARCHITECTURE.md`, `MVP_SCOPE.md`, and `DEPLOYMENT.md` once created. Inspect scripts, environment configuration, Firebase configuration, build, and hosting.

### REFACTORING
Read `CURRENT_STATE.md`, `CODEBASE_MAP.md`, `ARCHITECTURE.md`, and relevant domain documents. Inspect callers, dependencies, tests, rules, and persistence effects.

## Cross-Domain Tasks
Combine relevant context packages rather than loading every document.

Example:
```text
Task: Replace Base64 chat attachments with Firebase Storage
Classes: CHAT + DATABASE + SECURITY
Read: REALTIME.md, DATABASE.md, RBAC.md
Inspect: chat feature, Storage service, firestore.rules, storage.rules
```

## Read-Before-Write Protocol
For non-trivial work, report:
- task understanding;
- context read;
- files inspected;
- current behavior;
- target behavior;
- files expected to change;
- data-model impact;
- security impact;
- test plan.

Then implement.

## Bounded Task Rule
Prefer one coherent objective per task.

Good:
- Implement migration onboarding for users missing `collegeId`.
- Replace Base64 post attachments with Firebase Storage.
- Add cursor pagination to community chat.
- Enforce protected user fields in Security Rules.

Avoid:
- Build SurgeSkill.
- Fix authentication, chat, database, UI, and deployment.
- Improve everything.

## Artifact-Based Handoff
Transfer durable state through code, tests, documentation, approved architecture changes, and decision records—not hidden conversation history.

## Documentation Synchronization
When implementation reveals an architecture change:
1. identify the canonical document;
2. check compatibility with approved scope;
3. update the document or report the conflict;
4. keep code and context consistent.

Known `DATABASE.md` amendments:
- `friendCodes/`
- `communityReadStates/`
- conversation `readState`
- `mentionedUserIds` where applicable

## Multi-Agent Use
Future orchestration should route minimum sufficient context:
- Planner: scope, architecture, implementation plan.
- Implementation Agent: relevant domain architecture and code.
- Security Agent: Auth, RBAC, Database, rules, and security-sensitive changes.
- Test Agent: user stories, testing strategy, and modified code.
- Review Agent: requirements, plan, diff, tests, and relevant architecture.

## Acceptance Criteria
The map is effective when agents load appropriate context before editing, minimize irrelevant context, consult domain architecture consistently, do not mistake current code for product truth, trigger cross-domain review for security/database changes, plan non-trivial work, keep tasks bounded, and use durable artifacts for handoffs.
