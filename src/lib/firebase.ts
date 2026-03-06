import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCi78i1LzuIn96clPsjznuFPkMy57SzLoA",
  authDomain: "getreadtopost.firebaseapp.com",
  projectId: "getreadtopost",
  storageBucket: "getreadtopost.firebasestorage.app",
  messagingSenderId: "211112970013",
  appId: "1:211112970013:web:87f23a5f0f36104ceac3f4"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
