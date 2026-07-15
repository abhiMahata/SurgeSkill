import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine environment
const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

console.log(`Starting SurgeSkill Administrator Bootstrap...`);
console.log(`Environment: ${isEmulator ? 'LOCAL EMULATOR' : 'PRODUCTION'}`);

// Remove hardcoded credential check per earlier audit findings to allow ambient gcloud auth
// Initialize Firebase Admin
if (getApps().length === 0) {
  if (isEmulator) {
    initializeApp({ projectId: 'demo-surgeskill' });
  } else {
    initializeApp({
      credential: applicationDefault()
    });
  }
}

const db = getFirestore();
const auth = getAuth();

async function bootstrapAdmin() {
  const args = process.argv.slice(2);
  const targetEmail = args[0];

  if (!targetEmail) {
    console.error('\nERROR: You must provide an email address as an argument.');
    console.error('Usage: npm run bootstrap-admin <user@example.com>\n');
    process.exit(1);
  }

  const normalizedEmail = targetEmail.trim().toLowerCase();
  console.log(`\nAttempting to elevate user: ${normalizedEmail}`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(normalizedEmail);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\nERROR: User with email ${normalizedEmail} does not exist in Firebase Authentication.`);
      console.error(`Please sign up via the frontend application first.\n`);
    } else {
      console.error(`\nERROR: Failed to retrieve user from Auth:`, error.message, `\n`);
    }
    process.exit(1);
  }

  const uid = userRecord.uid;
  console.log(`Found Auth User (UID: ${uid})`);

  const userDocRef = db.collection('users').doc(uid);
  const userDocSnap = await userDocRef.get();

  if (!userDocSnap.exists) {
    console.error(`\nERROR: A Firestore profile document does not exist for UID: ${uid}.`);
    console.error(`The user may not have completed the registration or onboarding flow.\n`);
    process.exit(1);
  }

  const userData = userDocSnap.data();

  if (userData?.role === 'SUPER_ADMIN') {
    console.log(`\nSUCCESS: No changes required. The user is already a SUPER_ADMIN.\n`);
    process.exit(0);
  }

  console.log(`Current role is '${userData?.role}'. Elevating to 'SUPER_ADMIN'...`);

  try {
    // Only overwrite the role field to preserve the rest of the document
    await userDocRef.update({
      role: 'SUPER_ADMIN',
      updatedAt: Date.now()
    });
    console.log(`\n✅ SUCCESS: User ${normalizedEmail} is now a SUPER_ADMIN.\n`);
    process.exit(0);
  } catch (error: any) {
    console.error(`\nERROR: Failed to update Firestore document:`, error.message, `\n`);
    process.exit(1);
  }
}

bootstrapAdmin();
