# SurgeSkill Deployment Strategy

## Purpose

This document defines how tested SurgeSkill code is prepared, approved, deployed, verified, and, when necessary, rolled back. It applies to the existing brownfield repository, Firebase-based architecture, Spark-plan constraints, separate Framer landing page, and supervised AI-assisted engineering workflow.

## Deployment Architecture

```text
Framer Landing Page
        │
        │ Join SurgeSkill
        ▼
Firebase-Hosted SurgeSkill Application
        │
        ├── Firebase Authentication
        ├── Cloud Firestore
        └── Firebase Storage
```

The Framer landing page remains separately deployed during the deadline-critical MVP phase.

## Environment Strategy

For the MVP:

```text
LOCAL DEVELOPMENT
        ↓
Firebase Emulator Suite

PRODUCTION
        ↓
Actual Firebase Project
```

A dedicated staging environment may be introduced after the MVP. Do not add environment complexity before the deadline without evidence that it is necessary.

## Deployment Authority

AI agents may prepare, inspect, validate, and report deployment readiness.

AI agents must not deploy to production without explicit user approval.

```text
Tool Can Deploy
≠
Agent May Deploy
```

The required workflow is:

```text
Prepare
→ Validate
→ Report Readiness
→ Human Review
→ Explicit Approval
→ Deploy
→ Verify
```

## Configuration and Secrets

Agents must inspect the repository's actual configuration before changing environment-variable names or structure.

Firebase web client configuration is not equivalent to privileged server credentials, but sensitive credentials must never be committed or exposed to the frontend.

Never commit:

- Firebase Admin SDK service-account private keys;
- deployment tokens;
- private API secrets;
- privileged administrative credentials;
- unrelated third-party secrets.

Maintain appropriate example environment files without real secret values where useful.

## Firebase Configuration as Code

Version-control appropriate deployment configuration, including where applicable:

```text
firebase.json
firestore.rules
firestore.indexes.json
storage.rules
```

Application code, Security Rules, indexes, and Hosting configuration must remain deployment-compatible.

## Pre-Deployment Gates

Deployment readiness requires:

```text
Gate A Tests Pass
+
Production Build Passes
+
Security Rules Reviewed
+
Required Indexes Verified
+
Environment Verified
+
No Secrets Detected
+
Git Diff Reviewed
+
Known Limitations Documented
```

Passing these gates means `DEPLOYMENT READY`, not `DEPLOYED`.

## Testing Infrastructure Requirement

Firebase Emulator Suite and critical test infrastructure must be operational no later than Phase 2 of `IMPLEMENTATION_PLAN.md`.

Gate A requirements from `TESTING_STRATEGY.md` must pass before release readiness is claimed.

## Deployment Dependency Analysis

Before deploying, inspect the actual diff and determine dependencies among:

- Firestore indexes;
- Firestore Security Rules;
- Storage Rules;
- application code;
- Hosting configuration;
- data-model compatibility.

Do not blindly deploy every target in an arbitrary order.

Conceptually:

```text
Inspect Deployment Diff
→ Identify Dependencies
→ Verify Required Indexes
→ Deploy Compatible Infrastructure Configuration
→ Deploy Hosting
→ Run Smoke Tests
```

The final order must be derived from actual changes.

## Data Migration Strategy

Prefer backward-compatible application migrations over destructive production migrations for the MVP.

Example:

```text
Read User Document
        ↓
Required Schema Complete?
        │
        ├── Yes → Continue
        │
        └── No → Migration Onboarding
```

Do not assume all existing documents satisfy new schemas.

Before a schema-affecting deployment:

1. identify existing data shapes;
2. identify new required fields;
3. verify backward compatibility;
4. define migration behavior;
5. assess Security Rules compatibility;
6. test legacy data paths;
7. stop for approval if destructive migration is required.

## Initial Data Strategy

Deterministic test fixtures belong in emulator environments, not production.

Do not deploy fake:

- Students;
- chats;
- posts;
- friendships;
- messages;
- events.

Production initialization should contain only intentional system data required for operation, such as approved college/domain configuration where the final architecture requires it.

## Super Admin Bootstrap

The first Super Admin is established through a controlled one-time privileged process.

Recommended MVP process:

```text
Create Normal Firebase Auth Account
→ Identify Firebase Auth UID
→ Run One-Time Local Administrative Script
→ Assign SUPER_ADMIN Role and Required User Fields
→ Verify Authentication and Authorization
→ Secure or Remove Bootstrap Capability
```

The bootstrap script may use the Firebase Admin SDK locally.

Requirements:

- privileged credentials must never enter frontend code;
- service-account credentials must never be committed;
- the bootstrap process must not be exposed as a public client feature;
- the target UID/email must be explicitly verified;
- the resulting user document must satisfy `AUTH.md`, `RBAC.md`, and `DATABASE.md`;
- bootstrap execution must be reported;
- the process must not remain as an unrestricted privilege-escalation path.

## College Admin Provisioning

College Admin access is manually assigned by a Super Admin.

```text
External / Manual Request
→ Human Verification
→ Super Admin Selects Account
→ Assigned College Verified
→ COLLEGE_ADMIN Role Assigned
→ Authorization Verified
```

Students must never self-promote.

College Admins must never promote themselves or alter peer administrative authority.

## Deployment Procedure

### 1. Verify Repository State

- confirm correct repository;
- confirm correct branch;
- inspect `git status`;
- inspect `git diff`;
- identify the intended release commit;
- verify no unrelated changes;
- verify no destructive or accidental files.

### 2. Verify Environment

- confirm correct Firebase project;
- inspect actual environment configuration;
- verify required client configuration;
- verify privileged credentials are not exposed;
- verify local/emulator and production targets are not confused.

### 3. Run Required Validation

Run applicable repository-supported commands for:

- type checking;
- linting;
- unit tests;
- integration tests;
- Firestore Rules tests;
- Storage Rules tests;
- production build.

Report exact commands and results.

### 4. Verify Firebase Configuration

Inspect:

- `firebase.json`;
- Firestore Rules;
- Storage Rules;
- Firestore indexes;
- Hosting configuration.

Verify no temporary allow-all rules remain.

### 5. Verify Data Compatibility

- inspect schema changes;
- verify legacy-user behavior;
- verify migration onboarding;
- verify no destructive migration is hidden in the release;
- verify production seed requirements.

### 6. Produce Deployment Readiness Report

The report must include:

```text
RELEASE COMMIT
FILES / CONFIGURATION CHANGED
VALIDATION COMMANDS
VALIDATION RESULTS
SECURITY IMPACT
DATABASE / MIGRATION IMPACT
REQUIRED INDEXES
RULES IMPACT
KNOWN LIMITATIONS
ROLLBACK CONSIDERATIONS
DEPLOYMENT ORDER
READINESS STATUS
```

### 7. Obtain Explicit Approval

Do not deploy before approval.

### 8. Deploy

Use the verified Firebase project and dependency-aware deployment order.

Do not improvise destructive fixes during deployment.

### 9. Review Deployment Output

Confirm:

- command success/failure;
- deployed targets;
- warnings;
- index status;
- Hosting result;
- unexpected errors.

### 10. Run Post-Deployment Verification

Execute smoke tests and inspect operational errors.

## Post-Deployment Smoke Tests

At minimum verify:

- Framer `Join SurgeSkill` route reaches the application;
- application loads;
- Student authentication;
- Student dashboard;
- session restoration;
- logout/login;
- College Admin authentication;
- College Admin dashboard;
- same-college community discovery;
- cross-college isolation;
- community join flow;
- one post flow;
- one event flow;
- one community-chat flow;
- one friend flow;
- one private-DM flow;
- critical notification behavior where implemented.

Smoke testing is a production sanity check, not a replacement for automated testing.

## Monitoring

Under the MVP free-tier constraint, maintain basic operational awareness through:

- browser console errors;
- Firebase usage;
- Authentication failures;
- Firestore failures;
- Storage failures;
- user-reported defects.

Do not introduce paid monitoring infrastructure before the deadline without explicit approval.

## Incident Response

If a production issue occurs:

```text
Identify Symptom
→ Determine Affected Users / Data
→ Identify Release and Changed Layer
→ Contain Risk
→ Decide Fix Forward vs Rollback
→ Validate Corrective Action
→ Deploy Only With Approval
→ Verify
→ Add Regression Test Where Practical
→ Document Incident
```

Security or cross-tenant data exposure takes priority over feature availability.

If necessary, disable or restrict the affected feature safely rather than weakening authorization.

## Rollback Strategy

Rollback relies on:

```text
Known Good Git Commit
+
Version-Controlled Firebase Configuration
+
Non-Destructive Data Evolution
```

Before rollback, identify whether the failed release changed:

- Hosting code;
- Firestore Rules;
- Storage Rules;
- indexes;
- schema expectations;
- production data.

Do not assume reverting frontend code alone restores compatibility.

Avoid destructive migrations because they substantially increase rollback complexity.

## CI/CD Roadmap

Before the July 15 MVP deadline, prefer:

```text
Local / Emulator Validation
→ Human Review
→ Controlled Manual Deployment
```

unless a coherent working CI/CD pipeline already exists.

After the MVP, target:

```text
Pull Request
→ Automated Static Validation
→ Unit / Integration Tests
→ Security Rules Tests
→ Production Build
→ Human Review
→ Controlled Deployment
```

Do not spend deadline-critical engineering time replacing a working manual release process merely to add CI/CD.

## Deployment Checklist

### Source

- [ ] Correct repository.
- [ ] Correct branch.
- [ ] `git status` reviewed.
- [ ] `git diff` reviewed.
- [ ] Intended release commit identified.
- [ ] No unrelated or accidental changes.

### Validation

- [ ] Gate A passes.
- [ ] Production build passes.
- [ ] Critical authentication tests pass.
- [ ] Critical Firestore Rules tests pass.
- [ ] Tenant-isolation tests pass.
- [ ] Role-escalation tests pass.
- [ ] Community authorization tests pass.
- [ ] Private-DM authorization tests pass.

### Firebase

- [ ] Correct Firebase project verified.
- [ ] `firebase.json` verified.
- [ ] Firestore Rules verified.
- [ ] Storage Rules verified.
- [ ] Required Firestore indexes verified.
- [ ] Hosting configuration verified.

### Security

- [ ] No committed secrets.
- [ ] No privileged credentials exposed to client code.
- [ ] No temporary allow-all rules.
- [ ] No public privilege-escalation path.
- [ ] Super Admin bootstrap secured.
- [ ] College Admin provisioning boundaries verified.

### Data

- [ ] Schema compatibility verified.
- [ ] Legacy-user migration behavior verified.
- [ ] No unapproved destructive migration.
- [ ] Production initialization strategy verified.
- [ ] Fake emulator fixtures excluded from production.

### Deployment

- [ ] Deployment dependency order determined from actual diff.
- [ ] Deployment readiness report produced.
- [ ] Known limitations documented.
- [ ] Rollback considerations documented.
- [ ] Explicit deployment approval received.
- [ ] Deployment output reviewed.

### Post-Deployment

- [ ] Application loads.
- [ ] Landing-page application link works.
- [ ] Student auth works.
- [ ] College Admin auth works.
- [ ] Core community workflow works.
- [ ] Post workflow works.
- [ ] Event workflow works.
- [ ] Chat workflow works.
- [ ] Friend/DM workflow works where released.
- [ ] Session restoration works.
- [ ] Browser/Firebase errors checked.
- [ ] Critical regression found after deployment is documented and tested where practical.

## Definition of Deployment Readiness

SurgeSkill is deployment-ready when:

- the intended release scope is known;
- the repository diff is reviewed;
- Gate A from `TESTING_STRATEGY.md` passes;
- the production build succeeds;
- critical Security Rules are validated;
- tenant isolation and role boundaries are tested;
- required indexes and Firebase configuration are ready;
- environment configuration is verified;
- no known secret exposure exists;
- schema compatibility and legacy-user behavior are understood;
- Super Admin bootstrap is controlled;
- College Admin provisioning is controlled;
- known limitations are documented;
- rollback considerations are understood;
- a deployment readiness report exists;
- explicit approval is the only remaining prerequisite to production deployment.

## Relationship to Other Documents

- `MVP_SCOPE.md` defines what is being released.
- `ARCHITECTURE.md` defines system structure.
- `DATABASE.md` defines persistence and query contracts.
- `AUTH.md` defines identity and onboarding.
- `RBAC.md` defines authorization.
- `REALTIME.md` defines synchronization behavior.
- `CONTEXT_MAP.md` routes agent context.
- `AGENTS.md` defines agent operational boundaries.
- `IMPLEMENTATION_PLAN.md` defines implementation phases.
- `TESTING_STRATEGY.md` defines proof of correctness.
- `DEPLOYMENT.md` defines controlled release and operational verification.

## Final Principle

```text
BUILD
→ TEST
→ REVIEW
→ PREPARE
→ REPORT
→ APPROVE
→ DEPLOY
→ VERIFY
→ MONITOR
```

Deployment is a controlled engineering process, not an automatic consequence of finished code.
