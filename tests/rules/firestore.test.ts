import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, beforeAll, afterAll, beforeEach, it } from 'vitest';
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Initialize testing environment with the current firestore.rules
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-surgeskill-rules',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();

  // Setup deterministic fixtures via bypass context (admin access)
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // 1. Setup Colleges & Domains
    await setDoc(doc(db, 'colleges', 'college-a'), { name: 'College A', status: 'ACTIVE' });
    await setDoc(doc(db, 'colleges', 'college-b'), { name: 'College B', status: 'ACTIVE' });
    await setDoc(doc(db, 'collegeDomains', 'college-a'), { domain: 'collegea.edu' });
    await setDoc(doc(db, 'collegeDomains', 'college-b'), { domain: 'collegeb.edu' });

    // 2. Setup Users
    const users = [
      { id: 'student-a', collegeId: 'college-a', role: 'STUDENT', status: 'ACTIVE', friendCode: 'A1' },
      { id: 'student-b', collegeId: 'college-a', role: 'STUDENT', status: 'ACTIVE', friendCode: 'B1' },
      { id: 'student-c', collegeId: 'college-b', role: 'STUDENT', status: 'ACTIVE', friendCode: 'C1' },
      { id: 'admin-a', collegeId: 'college-a', role: 'COLLEGE_ADMIN', status: 'ACTIVE', friendCode: 'A2' },
      { id: 'admin-b', collegeId: 'college-b', role: 'COLLEGE_ADMIN', status: 'ACTIVE', friendCode: 'B2' },
      { id: 'super-admin', collegeId: 'college-a', role: 'SUPER_ADMIN', status: 'ACTIVE', friendCode: 'SA' },
    ];
    for (const u of users) {
      await setDoc(doc(db, 'users', u.id), u);
    }

    // 3. Setup Communities
    await setDoc(doc(db, 'communities', 'community-a'), { collegeId: 'college-a', name: 'Community A' });
    await setDoc(doc(db, 'communities', 'community-b'), { collegeId: 'college-b', name: 'Community B' });

    // 4. Setup Community Memberships
    // student-a is in community-a
    await setDoc(doc(db, 'communities', 'community-a', 'members', 'student-a'), { userId: 'student-a', status: 'ACTIVE' });
    // student-b is suspended in community-a
    await setDoc(doc(db, 'communities', 'community-a', 'members', 'student-b'), { userId: 'student-b', status: 'SUSPENDED' });

    // 5. Setup DMs
    // DM between student-a and student-b
    await setDoc(doc(db, 'conversations', 'dm-a-b'), { participantIds: ['student-a', 'student-b'] });
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

// Helpers
function getAuthContext(uid: string, emailStr?: string) {
  let tokenEmail = emailStr || `${uid}@collegea.edu`;
  if (!emailStr && (uid.includes('student-c') || uid.includes('admin-b'))) {
    tokenEmail = `${uid}@collegeb.edu`;
  }
  return testEnv.authenticatedContext(uid, { email: tokenEmail }).firestore();
}
function getUnauthContext() {
  return testEnv.unauthenticatedContext().firestore();
}

describe('1. Global Authentication & Tenant Isolation', () => {
  it('denies unauthenticated access completely', async () => {
    const db = getUnauthContext();
    await assertFails(getDoc(doc(db, 'users', 'student-a')));
  });

  it('allows same-college read access', async () => {
    const db = getAuthContext('student-a'); // college-a
    // V2 architecture requires tenant isolation (reading college-a data)
    await assertSucceeds(getDoc(doc(db, 'communities', 'community-a'))); 
  });

  it('denies cross-college access', async () => {
    const db = getAuthContext('student-a'); // college-a
    // V2 architecture: reading college-b data should fail
    await assertFails(getDoc(doc(db, 'communities', 'community-b'))); 
  });
});

describe('2. User Profiles', () => {
  it('allows Student profile updates (bio)', async () => {
    const db = getAuthContext('student-a');
    await assertSucceeds(updateDoc(doc(db, 'users', 'student-a'), { bio: 'New bio' }));
  });

  it('denies Student role mutation', async () => {
    const db = getAuthContext('student-a');
    await assertFails(updateDoc(doc(db, 'users', 'student-a'), { role: 'SUPER_ADMIN' }));
  });

  it('denies Student collegeId mutation', async () => {
    const db = getAuthContext('student-a');
    await assertFails(updateDoc(doc(db, 'users', 'student-a'), { collegeId: 'college-b' }));
  });
});

describe('3. Communities', () => {
  it('allows same-college community join', async () => {
    const db = getAuthContext('student-c'); // college-b
    await assertSucceeds(setDoc(doc(db, 'communities', 'community-b', 'members', 'student-c'), { userId: 'student-c', collegeId: 'college-b', status: 'ACTIVE' }));
  });

  it('denies cross-college community join', async () => {
    const db = getAuthContext('student-a'); // college-a
    await assertFails(setDoc(doc(db, 'communities', 'community-b', 'members', 'student-a'), { userId: 'student-a', collegeId: 'college-a', status: 'ACTIVE' }));
  });

  it('allows active member-only community chat access', async () => {
    const db = getAuthContext('student-a'); // Active member in community-a
    await assertSucceeds(setDoc(doc(db, 'communities', 'community-a', 'messages', 'msg-1'), { 
      senderId: 'student-a', 
      collegeId: 'college-a',
      communityId: 'community-a',
      content: 'Hello',
      status: 'ACTIVE'
    }));
  });

  it('denies non-member community chat access', async () => {
    const db = getAuthContext('student-b'); // college-a, but not active member of community-b
    await assertFails(setDoc(doc(db, 'communities', 'community-b', 'messages', 'msg-1'), { 
      senderId: 'student-b',
      collegeId: 'college-b',
      communityId: 'community-b',
      content: 'Hello',
      status: 'ACTIVE'
    }));
  });

  it('denies suspended-member message creation', async () => {
    const db = getAuthContext('student-b'); // Suspended member in community-a
    await assertFails(setDoc(doc(db, 'communities', 'community-a', 'messages', 'msg-2'), { 
      senderId: 'student-b',
      collegeId: 'college-a',
      communityId: 'community-a',
      content: 'Hello',
      status: 'ACTIVE'
    }));
  });

  it('denies spoofed community-message senderId', async () => {
    const db = getAuthContext('student-a'); 
    await assertFails(setDoc(doc(db, 'communities', 'community-a', 'messages', 'msg-3'), { 
      senderId: 'student-b', // Spoofing student-b
      collegeId: 'college-a',
      communityId: 'community-a',
      content: 'Hello',
      status: 'ACTIVE'
    }));
  });

  it('denies mismatched community-message communityId', async () => {
    const db = getAuthContext('student-a'); 
    await assertFails(setDoc(doc(db, 'communities', 'community-a', 'messages', 'msg-4'), { 
      senderId: 'student-a',
      collegeId: 'college-a',
      communityId: 'community-b', // Mismatch
      content: 'Hello',
      status: 'ACTIVE'
    }));
  });

  it('denies mismatched community-message collegeId', async () => {
    const db = getAuthContext('student-a'); 
    await assertFails(setDoc(doc(db, 'communities', 'community-a', 'messages', 'msg-5'), { 
      senderId: 'student-a',
      collegeId: 'college-b', // Mismatch
      communityId: 'community-a',
      content: 'Hello',
      status: 'ACTIVE'
    }));
  });
});

describe('4. College Admin Boundaries', () => {
  it('allows same-college College Admin management', async () => {
    const db = getAuthContext('admin-a'); // admin of college-a
    await assertSucceeds(updateDoc(doc(db, 'communities', 'community-a'), { name: 'Updated Name' }));
  });

  it('denies cross-college College Admin management', async () => {
    const db = getAuthContext('admin-a'); // admin of college-a
    await assertFails(updateDoc(doc(db, 'communities', 'community-b'), { name: 'Hacked' }));
  });
});

describe('5. Direct Messages (DM)', () => {
  it('allows DM participant access', async () => {
    const db = getAuthContext('student-a');
    await assertSucceeds(getDoc(doc(db, 'conversations', 'dm-a-b')));
  });

  it('denies DM non-participant access', async () => {
    const db = getAuthContext('student-c'); // Not in dm-a-b
    await assertFails(getDoc(doc(db, 'conversations', 'dm-a-b')));
  });

  it('denies College Admin private-DM access', async () => {
    const db = getAuthContext('admin-a');
    await assertFails(getDoc(doc(db, 'conversations', 'dm-a-b')));
  });

  it('denies Super Admin private-DM access', async () => {
    const db = getAuthContext('super-admin');
    await assertFails(getDoc(doc(db, 'conversations', 'dm-a-b')));
  });

  it('denies unauthorized conversation participant mutation', async () => {
    const db = getAuthContext('student-a');
    // student-a is in dm-a-b, but shouldn't be able to just add student-c to the participantIds array directly without friendship validation
    // For simplicity, we just enforce that they can't mutate participantIds via update, or we deny update entirely.
    await assertFails(updateDoc(doc(db, 'conversations', 'dm-a-b'), { participantIds: ['student-a', 'student-b', 'student-c'] }));
  });
});

describe('6. Additional User Profile Protection', () => {
  it('denies Student status mutation', async () => {
    const db = getAuthContext('student-a');
    await assertFails(updateDoc(doc(db, 'users', 'student-a'), { status: 'SUSPENDED' }));
  });

  it('denies Student friendCode mutation', async () => {
    const db = getAuthContext('student-a');
    await assertFails(updateDoc(doc(db, 'users', 'student-a'), { friendCode: 'NEWCODE' }));
  });
});

describe('7. Identity Bootstrap & Legacy Migration', () => {
  it('allows valid STUDENT registration with correct email domain', async () => {
    // New user student-new with email student-new@collegea.edu
    const db = getAuthContext('student-new', 'student-new@collegea.edu');
    await assertSucceeds(setDoc(doc(db, 'users', 'student-new'), { 
      role: 'STUDENT', 
      collegeId: 'college-a', 
      status: 'PENDING_ONBOARDING',
      friendCode: 'FRND12'
    }));
  });

  it('denies registration with incorrect email domain', async () => {
    // New user with gmail tries to claim college-a
    const db = getAuthContext('student-bad', 'student-bad@gmail.com');
    await assertFails(setDoc(doc(db, 'users', 'student-bad'), { 
      role: 'STUDENT', 
      collegeId: 'college-a', 
      status: 'PENDING_ONBOARDING',
      friendCode: 'FRND99'
    }));
  });

  it('denies registration self-provisioning admin roles', async () => {
    const db = getAuthContext('student-hacker', 'student-hacker@collegea.edu');
    await assertFails(setDoc(doc(db, 'users', 'student-hacker'), { 
      role: 'SUPER_ADMIN', 
      collegeId: 'college-a', 
      status: 'ACTIVE'
    }));
  });

  it('allows legacy migration (write-once initialization)', async () => {
    // Setup legacy user missing collegeId and friendCode
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', 'legacy-user'), { 
        role: 'STUDENT', 
        status: 'ACTIVE' 
      });
    });

    const db = getAuthContext('legacy-user', 'legacy@collegea.edu');
    // They should be able to update their missing collegeId and friendCode
    await assertSucceeds(updateDoc(doc(db, 'users', 'legacy-user'), { 
      collegeId: 'college-a',
      friendCode: 'NEWFRD'
    }));
  });

  it('protects friendCodes collection from overwrite', async () => {
    const db = getAuthContext('student-a');
    // Create friend code
    await assertSucceeds(setDoc(doc(db, 'friendCodes', 'CODE123'), { userId: 'student-a' }));
    
    // Another user tries to steal/overwrite it
    const dbB = getAuthContext('student-b');
    await assertFails(setDoc(doc(db, 'friendCodes', 'CODE123'), { userId: 'student-b' }));
  });
});

