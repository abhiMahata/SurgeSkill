import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { DEFAULT_EVENTS, DEFAULT_HACKATHONS, DEFAULT_COURSES } from './seedData';

// Replace with the same config from your src/firebase.ts file
const firebaseConfig = {
  apiKey: "AIzaSyD52WFOogu-fGu1UmIPmJPlBQggMCZWtoc",
  authDomain: "surgeskills-2f8e2.firebaseapp.com",
  projectId: "surgeskills-2f8e2",
  storageBucket: "surgeskills-2f8e2.firebasestorage.app",
  messagingSenderId: "740390957669",
  appId: "1:740390957669:web:55a474b1131d97740a4c8c",
  measurementId: "G-QJDE5ZTKNV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed Events
    console.log(`Uploading ${DEFAULT_EVENTS.length} events...`);
    for (const event of DEFAULT_EVENTS) {
      await setDoc(doc(db, 'events', event.id), event);
    }

    // Seed Hackathons
    console.log(`Uploading ${DEFAULT_HACKATHONS.length} hackathons...`);
    for (const hackathon of DEFAULT_HACKATHONS) {
      await setDoc(doc(db, 'hackathons', hackathon.id), hackathon);
    }

    // Seed Courses
    console.log(`Uploading ${DEFAULT_COURSES.length} courses...`);
    for (const course of DEFAULT_COURSES) {
      await setDoc(doc(db, 'courses', course.id), course);
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
