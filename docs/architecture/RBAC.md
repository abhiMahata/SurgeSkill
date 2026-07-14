# SurgeSkill Authorization and RBAC Architecture (RBAC.md)

## Purpose
Defines SurgeSkill's authorization model, tenant isolation, roles, permissions, protected fields, Firestore enforcement principles, and security-testing requirements.

## Authorization Model
SurgeSkill uses hybrid Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).

Authorization depends on:
- authentication;
- account status;
- role;
- `collegeId`;
- resource ownership;
- community membership;
- community suspension state;
- friendship/conversation participation.

## Authorization Evaluation Order
```text
Authenticated?
→ Account ACTIVE?
→ Role permitted?
→ Same tenant where required?
→ Ownership/membership/relationship condition satisfied?
→ Requested fields and data shape valid?
→ ALLOW or DENY
```

## Tenant Isolation
Each college is a tenant. Normal users must never access another college's tenant-scoped resources, even through direct Firebase requests, guessed IDs, modified URLs, or manipulated client state.

Tenant-scoped resources should carry stable `collegeId` values where required for efficient rule evaluation.

## Roles
### STUDENT
Uses the student product experience.

### COLLEGE_ADMIN
A distinct administrative role. College Admins do not inherit ordinary Student participation capabilities. They oversee every community in their assigned college.

### SUPER_ADMIN
Manages platform-level resources and authority. Super Admin does not mean unrestricted access to all private data.

## Permission Matrix

| Action | Student | College Admin | Super Admin |
|---|---|---|---|
| Read own profile | Yes | Yes | Yes |
| Update student profile | Own permitted fields | No | No |
| Browse communities | Same college | Own-college management | Platform oversight |
| Join/leave community | Yes | No | No |
| Create community | No | Own college | Platform oversight |
| Modify/archive community | No | Own college | Override |
| Read community posts | Same college | Own-college moderation | No default need |
| Create post | Joined community | No | No |
| Comment/like | Student conditions apply | No | No |
| Delete own post/comment | Yes | N/A | No default need |
| Moderate posts/comments | No | Own college | Override if explicitly required |
| Read community chat | Active member | Own-college moderation | No default need |
| Send community message | Active member, not suspended | No | No |
| Create/manage events | No | Own college | Platform oversight |
| Register for events | Yes | No | No |
| Find/add friends | Same-college Students | No | No |
| Send direct messages | Active friendship | No | No |
| Read private DMs | Participant only | No | No |
| Suspend from community | No | Own college | Override |
| Manage colleges/domains | No | No | Yes |
| Assign/remove College Admin | No | No | Yes |
| Suspend/disable College Admin | No | No | Yes |
| Disable accounts | No | No | Yes |

## Student Authorization
Typical Student mutation requirements include:
- authenticated;
- account `ACTIVE`;
- role `STUDENT`;
- same college as resource;
- active membership where required;
- no applicable community suspension;
- ownership where required.

Example: creating a community post requires an active same-college Student who is an active member of the target community and is not suspended there.

## College Admin Authorization
Typical College Admin requirements:
- authenticated;
- account `ACTIVE`;
- role `COLLEGE_ADMIN`;
- admin `collegeId` equals resource `collegeId`.

All College Admins in a college can manage all communities in that college. Authority is not based on who created a community.

College Admins cannot assign, remove, suspend, or disable peer College Admin authority.

## Super Admin Authorization
Super Admin capabilities are explicit:
- manage colleges;
- manage approved domains;
- assign/remove College Admin roles;
- suspend/disable accounts;
- manage platform-level configuration and oversight.

Super Admins do not receive a blanket `allow everything` rule.

By default they cannot:
- read private DMs;
- impersonate users;
- modify private conversations;
- casually browse student-to-student messages.

## Ownership Rules
Ownership is used for resources such as profiles, posts, and comments.

Ownership never implies unrestricted mutation. A Student may own `users/{uid}` but cannot modify protected fields.

## Protected User Fields
Student-mutable fields:
- `displayName`
- `avatarUrl`
- `bio`
- `learningInterests`
- `teachingInterests`
- `course`
- `year`

Protected fields:
- `email`
- `collegeId`
- `role`
- `status`
- `friendCode`
- `createdAt`

## Immutable Resource Fields
Fields such as the following should remain immutable after creation where applicable:
- `collegeId`
- `authorId`
- `senderId`
- `createdAt`
- relationship participant identifiers.

Create and update authorization must therefore be evaluated separately.

## Membership Authorization
Community membership uses deterministic records:

`communityMembers/{communityId}_{userId}`

Student community-chat access requires active membership. Post and chat creation additionally require that no active community suspension applies.

## Community Suspension Authorization
Community suspension is community-specific. A College Admin may suspend a Student from communities in the admin's college.

Suspension must not grant a College Admin authority over users or resources belonging to another college.

## Community Chat Rules
Read:
- active Student member of the community; or
- active same-college College Admin.

Write:
- active Student member;
- same college;
- not community-suspended.

College Admin moderation access does not make the admin an ordinary chat participant.

## Friendship and DM Authorization
Friendships are same-college Student relationships.

Direct-message access requires:
- role `STUDENT`;
- account `ACTIVE`;
- requester is a conversation participant;
- required active friendship/relationship state;
- no applicable block state.

Only conversation participants may read private messages. College Admin and Super Admin roles do not receive default private-DM access.

## Firestore Security Rule Principles
Rules should use reusable helper functions conceptually equivalent to:
- `isAuthenticated()`
- `getCurrentUser()`
- `isActiveUser()`
- `isStudent()`
- `isCollegeAdmin()`
- `isSuperAdmin()`
- `isSameCollege(collegeId)`
- `isCommunityMember(communityId)`
- `isCommunitySuspended(communityId)`

Use deterministic relationship IDs to make `exists()` checks practical.

## Rules Are Not Filters
Queries must be scoped so they cannot return unauthorized resources. The application must not query broad collections and expect Security Rules to remove forbidden documents.

Query design in application code must align with `DATABASE.md` and this authorization model.

## Client-Side Authorization
React route guards and hidden controls exist for UX only.

The client must assume users can:
- inspect code;
- modify state;
- replay requests;
- invoke Firebase directly.

Firestore and Storage rules remain the enforcement boundary.

## Rate-Limiting Limitation
Firestore Security Rules are not a complete robust rate-limiting platform.

The Spark-only MVP should prioritize:
- authentication;
- tenant isolation;
- membership enforcement;
- suspension enforcement;
- field-size limits;
- attachment-count limits;
- allowed data shapes.

Strong per-user request throttling is a future trusted-infrastructure concern and must be documented as an MVP limitation rather than treated as solved.

## Security Testing Requirements
At minimum, automated Security Rules tests should verify:
- unauthenticated access is denied;
- inactive accounts are denied protected operations;
- Student A can access permitted College A resources;
- Student A cannot access College B resources;
- Students cannot modify role, collegeId, status, friendCode, email, or createdAt;
- non-members cannot access member-only chat;
- suspended members cannot send community messages;
- same-college College Admins can perform authorized moderation;
- College Admins cannot administer another college;
- College Admins cannot alter peer admin authority;
- non-participants cannot read DMs;
- College Admins cannot read private DMs;
- Super Admins cannot read private DMs by default.

## Canonical Documentation Flow
`RBAC.md` defines the permission contract.

`DATABASE.md` defines the attributes and relationships needed to evaluate that contract.

`firestore.rules` and `storage.rules` enforce it.

React represents permitted UX but does not replace enforcement.

## Acceptance Criteria
The authorization architecture is acceptable when:
- tenant isolation is enforced;
- roles remain operationally distinct;
- Students cannot self-escalate privileges;
- College Admin authority is limited to the assigned college;
- Super Admin authority follows least privilege;
- private DMs remain participant-only;
- protected and immutable fields are enforced;
- rule tests validate hostile as well as normal requests.
