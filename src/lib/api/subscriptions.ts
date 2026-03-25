import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { Subscription } from '@/types/subscriptions';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

export const getSubscriptionByVendor = async (vendorId: string): Promise<Subscription | null> => {
  try {
    const q = query(collection(db, SUBSCRIPTIONS_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as Subscription) : null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

export const createSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const subRef = doc(collection(db, SUBSCRIPTIONS_COLLECTION));
    const now = new Date();
    const subscriptionWithTimestamps = {
      ...subscriptionData,
      id: subRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(subRef, subscriptionWithTimestamps);
    return subRef.id;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (subscriptionId: string, updates: Partial<Subscription>): Promise<void> => {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const q = query(collection(db, SUBSCRIPTIONS_COLLECTION), where('status', '==', 'ACTIVE'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Subscription);
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    throw error;
  }
};
