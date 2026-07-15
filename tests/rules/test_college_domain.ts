import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

async function main() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-no-project',
    firestore: { rules: fs.readFileSync('./firestore.rules', 'utf8') }
  });
  
  const authContext = testEnv.authenticatedContext('test-user', { email: 'test@collegea.edu' });
  const db = authContext.firestore() as any;

  try {
    const q = query(collection(db, 'collegeDomains'), where('domain', '==', 'collegea.edu'));
    await getDocs(q);
    console.log('SUCCESS');
  } catch (err: any) {
    console.error('ERROR:', err.code, err.message);
  }

  await testEnv.cleanup();
}
main();
