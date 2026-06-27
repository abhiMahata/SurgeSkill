/**
 * One-time cleanup: deletes all documents from events, hackathons, and courses
 * collections in Firestore (old seeded placeholder data).
 *
 * Run with:  node scripts/clearOldData.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyD52WFOogu-fGu1UmIPmJPlBQggMCZWtoc',
  authDomain:        'surgeskills-2f8e2.firebaseapp.com',
  projectId:         'surgeskills-2f8e2',
  storageBucket:     'surgeskills-2f8e2.firebasestorage.app',
  messagingSenderId: '740390957669',
  appId:             '1:740390957669:web:55a474b1131d97740a4c8c',
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name));
  if (snap.empty) {
    console.log(`  [${name}] already empty — nothing to delete.`);
    return;
  }
  const deletes = snap.docs.map(d => deleteDoc(doc(db, name, d.id)));
  await Promise.all(deletes);
  console.log(`  [${name}] deleted ${snap.docs.length} document(s).`);
}

console.log('\n🧹  Clearing old seeded placeholder data from Firestore…\n');
await clearCollection('events');
await clearCollection('hackathons');
await clearCollection('courses');
console.log('\n✅  Done. Platform data is now clean.\n');
process.exit(0);
