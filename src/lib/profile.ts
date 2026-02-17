import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';

export const createUserProfile = async (
  uid: string,
  email: string,
  fullName: string,
  company: string,
  designations: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const profile: UserProfile = {
      uid,
      email,
      fullName,
      company,
      designations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', uid), profile);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
