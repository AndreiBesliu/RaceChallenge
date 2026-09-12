import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';

const app = getApps()[0] ?? initializeApp({
  apiKey: 'AIzaSyBYFNNH1GBuoWi4YQfXejIsOBpQ-yaBeQI',
  authDomain: 'racechallenge-4d79c.firebaseapp.com',
  projectId: 'racechallenge-4d79c',
  appId: '1:475499399690:web:529fad9865a7d97b8bedf3',
  messagingSenderId: '475499399690',
});
export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
