import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 10),
});

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

const isPlaceholder = firebaseConfig.apiKey === 'placeholder-key' || 
                      firebaseConfig.projectId === 'placeholder-project';

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || isPlaceholder) {
  if (isPlaceholder) {
    console.warn('⚠️ Using placeholder Firebase credentials. Chat features will be disabled.');
    console.log('ℹ️ To enable chat, add your Firebase credentials to the .env file');
  } else {
    console.error('❌ Firebase configuration is missing! Please check your .env file.');
    console.error('Required variables: EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  }
} else {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    console.warn('⚠️ Firebase features will be disabled. Chat functionality will not work.');
  }
}

export { app, db, auth, storage };
