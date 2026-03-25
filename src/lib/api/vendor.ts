import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, limit, Query, QueryConstraint } from 'firebase/firestore';
import { Vendor } from '@/types/vendor';

const VENDORS_COLLECTION = 'vendors';

export const getVendor = async (vendorId: string): Promise<Vendor | null> => {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, vendorId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Vendor) : null;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }
};

export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, VENDORS_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as Vendor);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

export const createVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const vendorRef = doc(collection(db, VENDORS_COLLECTION));
    const now = new Date();
    const vendorWithTimestamps = {
      ...vendorData,
      id: vendorRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(vendorRef, vendorWithTimestamps);
    return vendorRef.id;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

export const updateVendor = async (vendorId: string, updates: Partial<Vendor>): Promise<void> => {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, vendorId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};

export const deleteVendor = async (vendorId: string): Promise<void> => {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, vendorId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

export const getVendorsByStatus = async (status: string): Promise<Vendor[]> => {
  try {
    const q = query(collection(db, VENDORS_COLLECTION), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Vendor);
  } catch (error) {
    console.error('Error fetching vendors by status:', error);
    throw error;
  }
};

export const getVendorsByTier = async (tier: string): Promise<Vendor[]> => {
  try {
    const q = query(collection(db, VENDORS_COLLECTION), where('tier', '==', tier));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Vendor);
  } catch (error) {
    console.error('Error fetching vendors by tier:', error);
    throw error;
  }
};
