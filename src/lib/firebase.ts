import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB9OYtrLJ4d3crF7C4alv8ZbPPcUgVkSms",
  authDomain: "grtp2-5ba00.firebaseapp.com",
  projectId: "grtp2-5ba00",
  storageBucket: "grtp2-5ba00.firebasestorage.app",
  messagingSenderId: "181277965274",
  appId: "1:181277965274:web:6068552f7b42b46742dee3",
  measurementId: "G-3GH7JZN3RQ"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
