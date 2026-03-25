import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { VendorGrading } from '@/types/grading';

const GRADING_COLLECTION = 'vendor_grading';

export const getGradingByVendor = async (vendorId: string): Promise<VendorGrading | null> => {
  try {
    const q = query(collection(db, GRADING_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as VendorGrading) : null;
  } catch (error) {
    console.error('Error fetching grading:', error);
    throw error;
  }
};

export const createGrading = async (
  vendorId: string,
  scores: {
    logoScore: number;
    descriptionScore: number;
    tagsScore: number;
    bannerScore: number;
    socialLinksScore: number;
  }
): Promise<string> => {
  try {
    const gradingRef = doc(collection(db, GRADING_COLLECTION));
    const overallScore = Math.round(
      (scores.logoScore + scores.descriptionScore + scores.tagsScore + scores.bannerScore + scores.socialLinksScore) / 5
    );
    const now = new Date();
    const gradingData = {
      id: gradingRef.id,
      vendorId,
      ...scores,
      overallScore,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(gradingRef, gradingData);
    return gradingRef.id;
  } catch (error) {
    console.error('Error creating grading:', error);
    throw error;
  }
};

export const updateGrading = async (
  gradingId: string,
  scores: {
    logoScore: number;
    descriptionScore: number;
    tagsScore: number;
    bannerScore: number;
    socialLinksScore: number;
  }
): Promise<void> => {
  try {
    const overallScore = Math.round(
      (scores.logoScore + scores.descriptionScore + scores.tagsScore + scores.bannerScore + scores.socialLinksScore) / 5
    );
    const docRef = doc(db, GRADING_COLLECTION, gradingId);
    await updateDoc(docRef, {
      ...scores,
      overallScore,
      gradedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating grading:', error);
    throw error;
  }
};
