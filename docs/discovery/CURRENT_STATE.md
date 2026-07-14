# SurgeSkill Current State

## Purpose
Evidence-backed snapshot of the existing SurgeSkill repository before production hardening.

## Executive Summary
SurgeSkill is a compact React 19 + TypeScript + Vite application backed by Firebase Authentication and Cloud Firestore and configured for Vercel deployment. The codebase already contains useful UI and feature scaffolding for authentication, onboarding, dashboards, communities, real-time community chat, events, calendar views, exploration, profile, and management surfaces.

The primary production-readiness gap is architectural rather than visual. Global application concerns are concentrated in `src/context/AppContext.tsx`; authorization and college isolation do not match the target multi-tenant product model; Firestore rules are too permissive; admin credentials are compared client-side through Vite environment variables; media is stored as Base64 message data; and several target systems are absent.

## Verified Technology Stack
- React 19
- TypeScript
- Vite
- React Router 7
- Firebase Authentication
- Cloud Firestore
- UUID
- Vercel configuration
- Custom React Context state management

## Application Structure
The application is centered on `App.tsx`, protected routing, page components, shared components, and `AppContext.tsx`. Firebase configuration lives in `src/firebase.ts`; shared domain types live in `src/types.ts`.

## Authentication
Firebase Authentication is present, including application authentication flows. The current admin path also reads `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD` and compares them client-side. Values exposed through Vite-prefixed environment variables are not suitable for secrets.

## Authorization and Roles
The current role model is `student | mentor | admin`. The target product requires `STUDENT | COLLEGE_ADMIN | SUPER_ADMIN`. College-admin scoping and platform-level super-admin authorization are not implemented as required.

## College and Tenant Model
College identity is represented with free-form strings. Community visibility is filtered in React by comparing community and user college values. This is UI filtering, not security-enforced tenant isolation.

## Communities
The repository includes community discovery/management scaffolding, membership, chat, and community-linked events. Membership is represented using `memberIds` arrays. The subsystem is useful but requires tenant-aware data modeling and authorization.

## Community Chat
Community chat uses Firestore `onSnapshot`, providing genuine real-time updates. Message history exists. Media handling uses `FileReader`/Base64 data rather than object storage. Message authorization rules do not enforce the target same-college and community-membership constraints.

## Events and Calendar
Event CRUD/registration scaffolding and calendar presentation exist. The implementation requires college scoping, admin-only trusted mutations, reminder logic, and stronger synchronization rules.

## Notifications
A production notification subsystem is not implemented. The target requires in-app notifications and later browser notifications for direct messages, mentions, events, and reminders.

## Social Systems
Friend codes, friend requests, accepted-friend authorization, and direct messaging are not implemented.

## Community Posts
A persistent community post/feed subsystem is not implemented.

## State and Data Access
`AppContext.tsx` centralizes authentication, registration, onboarding, password recovery, profiles, events, hackathons, courses, communities, activities, theme, toasts, typing state, Firestore subscriptions, and localStorage fallback. This creates excessive coupling and a large change surface.

## Firebase and Firestore
Firestore is a viable V1 datastore, but the current schema and rules require redesign. Current community rules permit broad authenticated access and do not enforce tenant isolation. The frontend must not be treated as a security boundary.

## Local Storage Fallback
The application maintains parallel Firebase and localStorage paths. This increases complexity and behavioral divergence. Production development should converge on Firebase, using Firebase Emulator Suite where local service emulation is needed.

## Testing and Observability
No automated test command or dedicated unit/integration/E2E test framework is configured. Production logging, error monitoring, and audit logging are also absent.

## Deployment
Vercel configuration is present. Firebase configuration and Firestore rules/indexes are included in the repository.

## Current-State Classification
| Subsystem | Classification |
|---|---|
| React / TypeScript / Vite | KEEP |
| Existing visual design | KEEP / REFACTOR |
| Firebase Authentication | KEEP / REFACTOR |
| Firestore | KEEP, redesign model/rules |
| Routing | REFACTOR |
| AppContext | REPLACE incrementally |
| Client-side admin credentials | REPLACE IMMEDIATELY |
| RBAC | REPLACE |
| College string identity | REPLACE |
| Tenant isolation | BUILD |
| Communities | REFACTOR |
| Real-time chat | KEEP / REFACTOR |
| Base64 media | REPLACE |
| Events | REFACTOR |
| Calendar | REFACTOR |
| Notifications | BUILD |
| Friends / direct messages | BUILD |
| Community posts | BUILD |
| Testing / observability | BUILD |

## Architectural Risks
1. Client-side admin credential comparison.
2. Missing security-enforced tenant isolation.
3. Overly permissive Firestore rules.
4. Excessive responsibility concentrated in AppContext.
5. Free-form college identifiers.
6. Base64 media stored through chat data paths.
7. Parallel Firebase/localStorage behavior.
8. No automated regression tests.

## Preservation Strategy
Do not rewrite the application wholesale. Preserve useful UI, real-time Firestore patterns, and existing feature scaffolding. Replace insecure authorization first, introduce stable college IDs and tenant isolation, modularize feature/data access incrementally, and add missing systems in prioritized phases.
