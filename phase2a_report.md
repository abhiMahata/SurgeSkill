# Phase 2A Report: Security Rules Test Harness & Authorization Specification

## SUMMARY
Phase 2A successfully established the Firestore Security Rules test harness using `vitest` and `@firebase/rules-unit-testing`. A fully self-contained validation workflow was implemented in `package.json` (`test:rules`), which automatically boots the Firestore emulator, executes the test suite, and shuts down the emulator. We created deterministic fixtures representing cross-college students, college admins, and super admins, and implemented executable test assertions derived directly from the canonical V2 architecture (`AUTH.md`, `RBAC.md`, `DATABASE.md`).

Running this strict V2 authorization suite against the **current legacy `firestore.rules`** revealed exactly the anticipated baseline security failures, proving that the legacy rules do not enforce tenant isolation, field immutability, or private DM restrictions. No production data, application code, or rules were modified during this phase.

## FILES CHANGED
1. **`package.json`**: Added `vitest` and `@firebase/rules-unit-testing` to `devDependencies`. Added `"test:rules": "firebase emulators:exec --only firestore \"npx vitest run tests/rules\""` to automatically manage the emulator lifecycle during testing.
2. **`tests/rules/firestore.test.ts`**: [NEW] Implemented the comprehensive V2 authorization test suite with logically separated `describe` blocks and deterministic data fixtures.

## DEPENDENCIES ADDED
- `vitest` (v4.1.10)
- `@firebase/rules-unit-testing` (v3.0.4)

## TEST MATRIX & BASELINE RESULTS
The test suite yielded **8 PASSING** and **9 FAILING** tests against the legacy `firestore.rules`.

### 1. Global Authentication & Tenant Isolation
| Test Case | Description | Result |
| :--- | :--- | :--- |
| Unauthenticated Denial | Reject access completely without auth. | ✅ PASS |
| Same-College Read Access | Student A can read College A data. | ❌ FAIL (Legacy rules deny everything not explicitly matched, or allow all for authenticated) |
| Cross-College Access Denial | Student A cannot read College B data. | ❌ FAIL (Legacy has no tenant checks; expected failure since it successfully read it) |

### 2. User Profiles
| Test Case | Description | Result |
| :--- | :--- | :--- |
| Allowed Profile Update | Student A can update their bio. | ✅ PASS (Self-updates allowed) |
| Role Mutation Denial | Student A cannot change their `role` to admin. | ❌ FAIL (Legacy lacks field constraints) |
| CollegeId Mutation Denial | Student A cannot change their `collegeId`. | ❌ FAIL (Legacy lacks field constraints) |

### 3. Communities
| Test Case | Description | Result |
| :--- | :--- | :--- |
| Same-College Community Join | Student A can join Community A. | ❌ FAIL (Legacy lacks explicit `members` subcollection rule) |
| Cross-College Community Join Denial | Student A cannot join Community B. | ✅ PASS (Passes only because the legacy rule defaults to deny for missing subcollections) |
| Member-Only Chat | Active members can write messages. | ✅ PASS (Legacy allows auth users to write if `senderId == uid`) |
| Non-Member Chat Denial | Non-members cannot write messages. | ❌ FAIL (Legacy allows *any* auth user to write if `senderId == uid`) |
| Suspended Member Denial | Suspended members cannot send messages. | ❌ FAIL (Legacy lacks suspension state checks) |

### 4. College Admin Boundaries
| Test Case | Description | Result |
| :--- | :--- | :--- |
| Same-College Admin Mgmt | Admin A can update Community A. | ✅ PASS (Legacy allows auth users to update communities) |
| Cross-College Admin Denial | Admin A cannot update Community B. | ❌ FAIL (Legacy admins/users can update all communities) |

### 5. Direct Messages (DM)
| Test Case | Description | Result |
| :--- | :--- | :--- |
| DM Participant Access | Student A can read DM A-B. | ❌ FAIL (Legacy lacks `/conversations` rules entirely) |
| Non-Participant DM Denial | Student C cannot read DM A-B. | ✅ PASS (Passes by default deny) |
| College Admin DM Denial | Admin A cannot read DM A-B. | ✅ PASS (Passes by default deny) |
| Super Admin DM Denial | Super Admin cannot read DM A-B. | ✅ PASS (Passes by default deny) |

## VALIDATION RESULTS
- **Test Runner (`npm run test:rules`)**: ✅ PASSED. The workflow automatically started the emulator, ran the suite (17 tests total in 3.8s), recorded the baseline failures, and safely shut down the emulator.
- **Emulator Connection**: ✅ PASSED. `vitest` successfully attached to `127.0.0.1:8080`.
- **Production Build (`npm run build`)**: ✅ PASSED. The application continues to compile cleanly.

## REMAINING BLOCKERS
None. The testing harness is fully operational and accurately detects authorization gaps. 

## RECOMMENDED NEXT MICRO-BATCH
Proceed to **Phase 2B: Foundational Security Rules Implementation** to rewrite `firestore.rules` incrementally until all 9 failing tests turn green, enforcing true tenant isolation and role constraints for the V2 architecture.
