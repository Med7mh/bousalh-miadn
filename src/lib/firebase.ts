import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as signOutFirebase } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, getDocs, setDoc, query, where } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Ensure user document exists
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDocFromServer(userRef);
      if (!userDoc.exists()) {
        // If it's the very first user, let's make them manager?
        // Let's check how many users exist
        const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'manager')));
        const isFirstUser = usersSnapshot.empty;
        
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || 'Unknown',
          role: isFirstUser ? 'manager' : 'rep',
          createdAt: Date.now()
        });
      }
    } catch (e) {
      console.error('Error creating user doc', e);
      throw e;
    }
};

export const signOut = () => signOutFirebase(auth);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
