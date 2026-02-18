import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  company: string;
  designations: string;
  createdAt: string;
  updatedAt: string;
  profileComplete?: boolean;
}

export const createUserProfile = async (
  userId: string,
  email: string,
  fullName: string,
  company: string,
  designations: string
) => {
  const userRef = doc(db, 'users', userId);
  const now = new Date().toISOString();
  const profileData: UserProfile = {
    uid: userId,
    email,
    fullName,
    company,
    designations,
    createdAt: now,
    updatedAt: now,
    profileComplete: !!(fullName && company),
  };
  await setDoc(userRef, profileData);
  return profileData;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (userId: string, data: {
  fullName?: string;
  company?: string;
  designations?: string;
  profileComplete?: boolean;
}) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};
