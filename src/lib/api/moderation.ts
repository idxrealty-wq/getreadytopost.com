import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { ModerationQueueItem } from '@/types/moderation';

const MODERATION_COLLECTION = 'admin_moderation_queue';

export const getModerationQueue = async (): Promise<ModerationQueueItem[]> => {
  try {
    const q = query(collection(db, MODERATION_COLLECTION), where('status', '==', 'PENDING'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ModerationQueueItem);
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    throw error;
  }
};

export const getModerationQueueByVendor = async (vendorId: string): Promise<ModerationQueueItem[]> => {
  try {
    const q = query(collection(db, MODERATION_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ModerationQueueItem);
  } catch (error) {
    console.error('Error fetching moderation queue by vendor:', error);
    throw error;
  }
};

export const flagContent = async (
  vendorId: string,
  itemType: string,
  itemId: string,
  reason: string,
  flaggedContent?: string
): Promise<string> => {
  try {
    const flagRef = doc(collection(db, MODERATION_COLLECTION));
    const flagData = {
      id: flagRef.id,
      vendorId,
      itemType,
      itemId,
      reason,
      flaggedContent,
      status: 'PENDING',
      flaggedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(flagRef, flagData);
    return flagRef.id;
  } catch (error) {
    console.error('Error flagging content:', error);
    throw error;
  }
};

export const approveModerationItem = async (
  itemId: string,
  adminNotes?: string
): Promise<void> => {
  try {
    const docRef = doc(db, MODERATION_COLLECTION, itemId);
    await updateDoc(docRef, {
      status: 'APPROVED',
      adminNotes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error approving moderation item:', error);
    throw error;
  }
};

export const rejectModerationItem = async (
  itemId: string,
  adminNotes: string
): Promise<void> => {
  try {
    const docRef = doc(db, MODERATION_COLLECTION, itemId);
    await updateDoc(docRef, {
      status: 'REJECTED',
      adminNotes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error rejecting moderation item:', error);
    throw error;
  }
};
