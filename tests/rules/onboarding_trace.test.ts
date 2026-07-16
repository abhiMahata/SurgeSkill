import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, beforeAll, afterAll, beforeEach, it } from 'vitest';
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
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
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Onboarding Flow Trace', () => {
  it('Traces the complete setup flow', async () => {
    const db = testEnv.authenticatedContext('new-user-123', { email: 'new@gmail.com' }).firestore();

    // 1. Claim friend code
    await assertSucceeds(setDoc(doc(db, 'friendCodes', 'X1Y2Z3'), { userId: 'new-user-123' }));

    // 2. Complete Onboarding Profile
    const profile = {
      id: 'new-user-123',
      name: 'Test User',
      email: 'new@gmail.com',
      role: 'STUDENT',
      status: 'ACTIVE',
      collegeId: 'iit-bombay',
      friendCode: 'X1Y2Z3',
      age: '18-20',
      designation: 'Student',
      organization: '',
      registeredEvents: [],
      enrolledCourses: [],
      registeredHackathons: [],
      joinedCommunities: [],
      onboardingComplete: true,
    };

    // Should succeed based on my analysis
    await assertSucceeds(setDoc(doc(db, 'users', 'new-user-123'), profile));
  });
});
