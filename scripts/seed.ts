import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { canonicalCollegeDomains } from './seed-data/collegeDomains';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Determine environment
const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
console.log(`Starting SurgeSkill Canonical Seed Script...`);
console.log(`Environment: ${isEmulator ? 'LOCAL EMULATOR' : 'PRODUCTION'}`);

if (!isEmulator && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('\nERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is required for production seeding.');
  console.error('Please point it to your Firebase Admin Service Account Key JSON file.\n');
  process.exit(1);
}

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

async function seedImmutableReferenceData() {
  console.log('\n--- Seeding Immutable Reference Data ---');
  let totalBatches = 0;
  
  // 1. Seed College Domains
  console.log(`\nProcessing ${canonicalCollegeDomains.length} canonical college domains...`);
  const domainBatch = db.batch();
  for (const college of canonicalCollegeDomains) {
    const docRef = db.collection('collegeDomains').doc(college.id);
    // Use merge: true to ensure idempotent writes
    domainBatch.set(docRef, college, { merge: true });
    console.log(` queued -> ${college.id} (${college.domain})`);
  }
  
  await domainBatch.commit();
  totalBatches++;
  console.log('✅ Successfully committed college domains.');

  // Extend here if other immutable reference collections are needed in the future
  // DO NOT add dynamic data (users, posts, communities, etc.) here.

  console.log(`\n--- Seeding Complete ---`);
  console.log(`Total batches committed: ${totalBatches}`);
}

seedImmutableReferenceData()
  .then(() => {
    console.log('\nSuccess! Platform reference data is seeded.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nSeeding failed with error:', err);
    process.exit(1);
  });
