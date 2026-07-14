# SurgeSkill Testing Strategy

## Purpose
Defines how SurgeSkill proves correctness during AI-assisted implementation. Testing is risk-based and prioritizes authorization, tenant isolation, data integrity, Firebase behavior, real-time synchronization, and critical user journeys.

## Core Principle
A successful build does not prove correct application behavior. Tests must derive from canonical requirements and acceptance criteria, not merely mirror implementation.

## Testing Layers
```text
Small Critical-Path E2E Layer
→ Feature Integration Tests
→ Firebase Security Rules Tests
→ Unit / Logic Tests
→ Type Check + Lint + Build
```

## Static Validation
Run repository-supported type checking, linting, and production builds for relevant batches. Agents must inspect `package.json` before selecting commands and never hallucinate scripts or results.

## Unit Tests
Use deterministic unit tests for canonical conversation IDs, friend-code validation, student-email domain parsing, college/campus resolution, attachment validation, pagination merge/deduplication, event ETA calculations, mention validation, and role-routing helpers.

## Firebase Emulator Suite
Test Firebase authorization and Firebase-dependent integration behavior against Authentication, Cloud Firestore, and Storage emulators rather than production. Critical emulator/test infrastructure must be operational no later than Phase 2 of `IMPLEMENTATION_PLAN.md`.

## Firestore Security Rules Testing
Security Rules testing is the highest-priority automated layer. Convert policies from `RBAC.md`, `AUTH.md`, `DATABASE.md`, and `REALTIME.md` into executable assertions.

Critical cases include:
- unauthenticated protected access denied;
- Student allowed to modify approved profile fields;
- Student denied modification of `role` and `collegeId`;
- cross-college access denied;
- same-college community join allowed;
- cross-college join denied;
- non-member member-chat access denied;
- active member chat access allowed;
- suspended member message creation denied;
- College Admin allowed to manage assigned-college communities;
- College Admin denied cross-college administration;
- College Admin and Super Admin denied default private-DM access;
- DM participants allowed conversation access;
- non-participants denied conversation access.

## Authentication Testing
Test new Student onboarding, legacy-user migration onboarding, College Admin role routing, invalid domains, unverified email where required, disabled/suspended accounts, missing/malformed user documents, role escalation, and college reassignment attempts.

## Feature Integration Tests
Priority workflows:
```text
Community: Authenticated Student → Query → Membership → Rules → State Update
Post: Member → Attachment Validation → Storage → Firestore → Rules → Query
DM: Student → Friendship → Block Check → Canonical Conversation → Message → Metadata → Notification
```

## Real-Time Testing
Test authorized updates, unauthorized listeners, cleanup, latest-30 loading, cursor pagination, correct ordering, document-ID deduplication, DM inbox updates, and read state.

Pagination scenario:
```text
Create 70 Messages
→ Load Latest 30
→ Load Previous 30
→ Load Previous 10
→ Verify 70 Unique Correctly Ordered Messages
```

## Storage Testing
Test valid authorized uploads, unauthorized access denial, cross-college denial where applicable, oversized-file denial, invalid MIME denial, attachment-count limits, and absence of Base64 binary payloads in Firestore.

## End-to-End Testing
Maintain a small critical-path suite:
- Student login → discover community → join → create/view post.
- College Admin login → create community/event → Student sees event.
- Student A adds Student B → acceptance → DM → Student B receives message.

Reuse an existing working E2E framework. If none exists, Playwright may be evaluated subject to `AGENTS.md` dependency policy and required approval.

## Mocking vs Emulation
```text
Pure Business Logic → Unit Tests / Mocks Where Necessary
Firebase Authorization → Emulator
Firestore Queries → Prefer Emulator Integration Tests
Storage Rules → Emulator
```
Do not mock Security Rules when the emulator can execute them.

## Deterministic Fixtures
At minimum:
```text
College A: studentA, studentB, adminA, communityA
College B: studentC, adminB, communityB
Platform: superAdmin
```

## Test Isolation
Tests must not depend on execution order:
```text
Reset / Prepare State → Create Fixtures → Run Test → Clean or Reset
```

## AI-Generated Test Policy
Agents must derive tests from `USER_STORIES.md`, `AUTH.md`, `RBAC.md`, `DATABASE.md`, `REALTIME.md`, and phase acceptance criteria. They must not merely write tests that agree with their implementation.

## Test Timing
Strict TDD is not mandatory. Prefer test-first behavior for role escalation, protected fields, tenant isolation, cross-college denial, non-participant DM denial, and other critical Security Rules. Implementation-then-test is acceptable for ordinary low-risk feature logic.

## Regression Tests
Every confirmed significant bug should receive a regression test where technically practical.

## Risk-Based Coverage
No arbitrary line-coverage target is required. Critical risk coverage takes priority over superficial line coverage.

## Recommended Organization
Adapt to existing architecture:
```text
tests/
├── unit/
├── integration/
├── rules/
│   ├── firestore/
│   └── storage/
├── e2e/
│   └── critical-path/
└── fixtures/
```
Inspect, repair, and extend existing testing architecture first. Replace only with evidence.

## Deadline-Specific Release Gates

### Gate A — Must Pass
- production build;
- critical authentication tests;
- critical Firestore Rules tests;
- tenant-isolation tests;
- role-escalation tests;
- community authorization tests;
- private-DM authorization tests.

### Gate B — Strongly Expected
- core unit tests;
- Storage Rules tests;
- pagination tests;
- listener-lifecycle tests;
- friendship/block tests;
- event-consistency tests.

### Gate C — Best Effort
- critical-path E2E;
- broad UI automation;
- extensive cross-browser testing;
- performance benchmarking.

Gate A must pass before release readiness is claimed.

## Per-Phase Validation
```text
Type Check / Lint
→ Relevant Unit Tests
→ Relevant Integration Tests
→ Relevant Firebase Rules Tests
→ Production Build
→ Diff Review
→ Phase Report
```

## Validation Reporting
Report exact commands and outcomes, for example:
```text
Lint: PASS
Unit Tests: 42 PASS, 0 FAIL
Firestore Rules: 31 PASS, 0 FAIL
Storage Rules: 8 PASS, 0 FAIL
Build: PASS
E2E: NOT RUN — no E2E framework configured
```
Never report “all tests passed” without identifying what ran.

## Failure Handling
```text
Read Failure
→ Determine Whether Current Change Caused It
→ Identify Root Cause
→ Fix Within Scope
→ Rerun Validation
→ Report Exact Remaining Blocker
```
Do not disable tests, weaken rules, suppress checks, or remove functionality merely to obtain passing results.

## Release Hardening
Before release readiness:
1. run the complete critical suite;
2. run Security Rules suites;
3. verify auth failure paths and protected fields;
4. verify tenant isolation and role boundaries;
5. verify membership and private-DM restrictions;
6. verify attachment limits;
7. verify listener cleanup and pagination;
8. verify event consistency and notification scoping;
9. inspect for Base64 Firestore media, secrets, unbounded queries, and unmanaged listeners;
10. run production build;
11. record unresolved non-critical issues.

## Relationship to Other Documents
- `USER_STORIES.md`: required behavior.
- `AUTH.md`: identity.
- `RBAC.md`: authorization.
- `DATABASE.md`: data/query contracts.
- `REALTIME.md`: synchronization.
- `CONTEXT_MAP.md`: context routing.
- `AGENTS.md`: agent validation/reporting.
- `IMPLEMENTATION_PLAN.md`: phase gates.
- `TESTING_STRATEGY.md`: proof of correctness.

## Acceptance Criteria
The strategy is effective when tests derive from canonical requirements; Firebase authorization uses emulators; tenant and role boundaries become executable assertions; tests are deterministic and isolated; real-time systems test pagination, deduplication, and cleanup; significant bugs receive regression tests where practical; agents report exact evidence; Gate A passes before release readiness; test infrastructure is operational no later than Phase 2; and testing prioritizes actual project risk.
