import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// Desktop-friendly popup
export const signInWithGooglePopup = async () => {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
};

// Mobile Safari-friendly redirect
export const signInWithGoogleRedirect = async () => {
  await signInWithRedirect(auth, googleProvider);
};

// Call after redirect returns to site
export const getGoogleRedirectResult = async () => {
  const res = await getRedirectResult(auth);
  return res?.user || null;
};

// Legacy (for backward compat)
export const signInWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

export const logOut = () => signOut(auth);

export { auth, onAuthStateChanged };
export type { User };
