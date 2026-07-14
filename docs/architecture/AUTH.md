# SurgeSkill Authentication Architecture (AUTH.md)

## Purpose
Defines identity, onboarding, college verification, account lifecycle, session handling, and authentication constraints for SurgeSkill.

## Core Principles
- Authentication and authorization are separate concerns.
- Firebase Authentication establishes identity; Firestore data and Security Rules determine product access.
- An authenticated account is not automatically onboarded or authorized.
- College assignment is permanent in the MVP.
- The browser is untrusted.

## Authentication Providers
The MVP supports:
- Email/password authentication.
- Google Sign-In.

For both methods, the Firebase-authenticated email must use an approved college email domain. Personal email accounts are not eligible for student onboarding.

## Identity Lifecycle
```text
Firebase Authentication
→ Email verified
→ Approved college domain lookup
→ Select an approved campus for that domain
→ Permanent college assignment
→ Complete profile
→ Generate unique friend code
→ Account becomes ACTIVE
→ Enter role-specific application
```

## Email Verification
Email/password users must verify their email before completing onboarding. Google-authenticated email identity is handled through Firebase Authentication, but the email must still satisfy SurgeSkill's approved-domain policy.

## Approved Domains and Campus Selection
`collegeDomains` maps approved email domains to eligible colleges/campuses.

A domain may correspond to multiple campuses. Therefore:
1. Extract the authenticated email domain.
2. Find active approved mappings.
3. Reject onboarding if none exist.
4. If mappings exist, show only eligible campuses.
5. The user selects one campus.
6. Persist its stable `collegeId`.

## Permanent Identity Fields
The following fields are protected after onboarding:
- `email`
- `collegeId`
- `role`
- `status`
- `friendCode`
- `createdAt`

Students cannot change their college or authentication email through the MVP product.

## Account States
- `PENDING_ONBOARDING`
- `ACTIVE`
- `SUSPENDED`
- `DISABLED`

Role and account state are independent.

## User Roles
- `STUDENT`
- `COLLEGE_ADMIN`
- `SUPER_ADMIN`

Roles determine application entry and capabilities but do not replace tenant, membership, ownership, or account-state checks.

## Student Onboarding
Student onboarding requires:
1. Successful Firebase authentication.
2. Verified/eligible authenticated email.
3. Approved college-domain match.
4. Campus selection where required.
5. Permanent `collegeId` assignment.
6. Profile completion.
7. Unique friend-code creation.
8. `ACTIVE` status.

## Existing-User Migration Onboarding
Existing authenticated users missing required identity fields are not deleted.

```text
Existing user login
→ Validate required identity fields
→ If incomplete, redirect to migration onboarding
→ Verify eligible college
→ Select campus
→ Complete required profile
→ Generate missing friend code
→ Activate normal application flow
```

Migration must not silently trust legacy free-form college strings.

## Friend Codes
Use a dedicated lookup collection:

`friendCodes/{code}`

Suggested fields:
- `userId`
- `collegeId`
- `createdAt`

The user document also stores `friendCode`. This intentional denormalization enables direct lookup.

Friend codes should be sufficiently random and generated during onboarding. Collision handling must retry safely.

## Role-Based Entry
After session restoration, the application loads the authenticated user's Firestore identity record and evaluates:
1. authentication state;
2. account status;
3. onboarding completeness;
4. role.

Routing:
- `STUDENT` → student application.
- `COLLEGE_ADMIN` → college administration application.
- `SUPER_ADMIN` → platform administration application.

Client routing is UX logic, not the authorization boundary.

## Session Restoration
On application startup:
1. wait for Firebase Auth initialization;
2. resolve the authenticated Firebase user;
3. load the corresponding `users/{uid}` record;
4. validate account state and onboarding completeness;
5. route to the appropriate experience.

Avoid rendering protected application state before authentication resolution completes.

## College Admin Accounts
College Admins are distinct operational users, not Students with additional privileges.
- They cannot join communities.
- They do not participate as ordinary students.
- They oversee all communities within their assigned college.
- Only Super Admins can assign, remove, suspend, or disable College Admin authority.

## Super Admin Bootstrap
The first Super Admin is bootstrapped through a controlled manual process. Ordinary client flows must never permit users to self-assign privileged roles.

## Suspended and Disabled Accounts
`SUSPENDED` and `DISABLED` users must be denied ordinary protected application access by Security Rules, not merely redirected by React.

## Security Requirements
- Never trust role, college, or status values supplied by the client.
- Prevent students from modifying protected identity fields.
- Reject cross-college access.
- Keep Firebase configuration and rules version-controlled.
- Test authentication and onboarding failure paths.
- Do not treat hidden UI controls as security.

## MVP Limitations
- Authentication email changes are unsupported.
- College changes are unsupported.
- No automated external student-status verification beyond approved email-domain policy.
- No account self-deletion; deletion is administrative.
- Trusted backend automation is deferred unless required for security.

## Acceptance Criteria
Authentication architecture is acceptable when:
- only eligible college identities can complete student onboarding;
- campus assignment is stable;
- legacy users have a migration path;
- roles and statuses are distinct;
- protected fields cannot be self-modified;
- role-specific entry is deterministic;
- authorization remains enforced independently by Firestore Security Rules.
