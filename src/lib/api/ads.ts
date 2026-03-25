import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { AdZone } from '@/types/ad-zones';

const AD_ZONES_COLLECTION = 'ad_zones';

export const getAdZonesByCategory = async (categoryId: string): Promise<AdZone[]> => {
  try {
    const q = query(collection(db, AD_ZONES_COLLECTION), where('categoryId', '==', categoryId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AdZone);
  } catch (error) {
    console.error('Error fetching ad zones by category:', error);
    throw error;
  }
};

export const getAvailableAdZones = async (): Promise<AdZone[]> => {
  try {
    const q = query(collection(db, AD_ZONES_COLLECTION), where('status', '==', 'AVAILABLE'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AdZone);
  } catch (error) {
    console.error('Error fetching available ad zones:', error);
    throw error;
  }
};

export const getAdZonesByVendor = async (vendorId: string): Promise<AdZone[]> => {
  try {
    const q = query(collection(db, AD_ZONES_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AdZone);
  } catch (error) {
    console.error('Error fetching ad zones by vendor:', error);
    throw error;
  }
};

export const updateAdZone = async (adZoneId: string, updates: Partial<AdZone>): Promise<void> => {
  try {
    const docRef = doc(db, AD_ZONES_COLLECTION, adZoneId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating ad zone:', error);
    throw error;
  }
};

export const purchaseAdZone = async (
  adZoneId: string,
  vendorId: string,
  adGraphicUrl: string,
  adCtaText: string,
  adCtaUrl: string,
  startDate: Date,
  endDate: Date
): Promise<void> => {
  try {
    const docRef = doc(db, AD_ZONES_COLLECTION, adZoneId);
    await updateDoc(docRef, {
      vendorId,
      status: 'OCCUPIED',
      adGraphicUrl,
      adCtaText,
      adCtaUrl,
      startDate,
      endDate,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error purchasing ad zone:', error);
    throw error;
  }
};
