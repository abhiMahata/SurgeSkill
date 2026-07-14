# SurgeSkill Architecture

## Purpose
This document defines the target technical architecture for SurgeSkill. It translates the PRD, MVP scope, user stories, and the verified current state into a buildable system design.

## Architecture Summary
SurgeSkill is a Firebase-backed, feature-oriented React application with a separate public marketing website. The authenticated application uses React 19, TypeScript, and Vite; Firebase Authentication for identity; Cloud Firestore for data; Firebase Storage for media; and Firestore Security Rules as the primary authorization boundary. The architecture uses an incremental migration strategy from the current codebase rather than a full rewrite.

## Goals
1. Preserve useful existing UI and working scaffolding.
2. Enforce college-scoped tenant isolation.
3. Keep operating cost compatible with Firebase Spark constraints where possible.
4. Minimize complexity for the July 15 release.
5. Keep the repository easy for an AI coding agent to navigate.

## Core Decisions
- Firebase remains the primary backend platform for the MVP.
- Spark-only operating target.
- Firestore Security Rules are the immediate authorization boundary.
- Frontend is organized by business domain, not just by file type.
- Migration is incremental.
- Trusted operations are minimized for the MVP.

## System Boundaries
### Public layer
The Framer marketing site explains the product and links into the authenticated application.

### Authenticated application layer
The React application serves students, college admins, and super admins.

### Trust boundary
The browser is untrusted. Security enforcement lives in Firebase Auth, Firestore rules, and Storage rules.

## Frontend Architecture
Recommended structure:
```text
src/
├── app/
├── features/
├── services/
├── shared/
├── config/
└── main.tsx
```

### app/
Contains:
- App composition
- Router
- Providers

### features/
Owns business domains:
- auth
- users
- colleges
- communities
- posts
- chat
- events
- calendar
- friends
- messages
- notifications
- admin

### services/
Owns infrastructure abstractions:
- Firebase initialization
- auth helpers
- Firestore helpers
- Storage helpers

### shared/
Holds truly reusable code:
- primitive components
- generic hooks
- shared utilities
- stable cross-feature types

## Routing Model
Routes are role-aware for UX, but routing is not the security boundary.

### Public routes
- landing page
- login
- registration

### Student routes
- dashboard
- communities
- posts
- chat
- events
- calendar
- friends
- messages
- profile
- notifications

### College admin routes
- admin dashboard
- community management
- event management
- moderation
- student management

### Super admin routes
- college management
- domain management
- admin provisioning
- platform oversight

## Firebase Usage Model
### Authentication
Firebase Auth provides identity. Supported sign-in methods remain email/password and Google sign-in.

### Firestore
Firestore stores application state and authorization-sensitive resource data.

### Storage
Firebase Storage stores attachments and media files. Firestore stores metadata, not Base64 payloads.

### Security rules
Firestore rules must enforce:
- student-to-college tenancy
- community membership access
- college admin scope
- super admin scope
- privacy controls
- friendship and direct-message boundaries

## Authorization and RBAC
Roles:
- STUDENT
- COLLEGE_ADMIN
- SUPER_ADMIN

Principles:
1. The frontend may hide controls, but it never authorizes actions.
2. Security-sensitive writes must be rejected by rules if unauthorized.
3. College admins are scoped to one college.
4. Super admins manage the platform layer.

### Moderation model
- College admins may moderate posts, comments, chat, and suspend users from individual communities.
- Super admins may suspend or disable accounts across the platform.

## Trusted Operations
For the MVP, trusted operations should be minimized. Candidate trusted operations include:
- initial super-admin bootstrap
- platform-level account suspension
- future cross-document admin workflows if Firestore-only client transactions become too risky

## Migration Strategy
1. Preserve useful UI and feature scaffolding.
2. Carve out global context into feature modules.
3. Harden auth and tenant boundaries.
4. Refactor communities, posts, chat, and events.
5. Move media from Base64 to Storage.
6. Add missing systems such as comments, notifications, friends, and direct messaging.
7. Add tests and validation.
8. Remove obsolete paths once replacements are stable.

## AI-Agent Readability Rules
- Keep feature ownership explicit.
- Keep security-sensitive code isolated.
- Keep shared abstractions small.
- Avoid giant catch-all services.
- Avoid mixing UI composition with Firestore schema logic.
- Avoid loading unrelated domains into the same context unless needed.

## Relationship to Other Documents
- CURRENT_STATE.md: what exists.
- GAP_ANALYSIS.md: what must change.
- PRD.md: the target product.
- MVP_SCOPE.md: current implementation program.
- USER_STORIES.md: testable behavior.
- DATABASE.md: data model.

## Acceptance
This architecture is acceptable if it supports the target product with the lowest practical complexity under current constraints, while preserving room for future trusted operations, richer moderation, and additional engagement systems.
