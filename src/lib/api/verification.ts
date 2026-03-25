import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { VerificationPurchase } from '@/types/verification';

const VERIFICATION_COLLECTION = 'verification_purchases';

export const getVerificationByVendor = async (vendorId: string): Promise<VerificationPurchase | null> => {
  try {
    const q = query(collection(db, VERIFICATION_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as VerificationPurchase) : null;
  } catch (error) {
    console.error('Error fetching verification:', error);
    throw error;
  }
};

export const createVerificationPurchase = async (
  verificationData: Omit<VerificationPurchase, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const verificationRef = doc(collection(db, VERIFICATION_COLLECTION));
    const now = new Date();
    const verificationWithTimestamps = {
      ...verificationData,
      id: verificationRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(verificationRef, verificationWithTimestamps);
    return verificationRef.id;
  } catch (error) {
    console.error('Error creating verification purchase:', error);
    throw error;
  }
};

export const updateVerification = async (
  verificationId: string,
  updates: Partial<VerificationPurchase>
): Promise<void> => {
  try {
    const docRef = doc(db, VERIFICATION_COLLECTION, verificationId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating verification:', error);
    throw error;
  }
};

export const getPendingVerifications = async (): Promise<VerificationPurchase[]> => {
  try {
    const q = query(collection(db, VERIFICATION_COLLECTION), where('status', '==', 'PENDING_REVIEW'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as VerificationPurchase);
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    throw error;
  }
};
