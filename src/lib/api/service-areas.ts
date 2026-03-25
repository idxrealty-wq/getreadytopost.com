import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { ServiceArea } from '@/types/service-areas';

const SERVICE_AREAS_COLLECTION = 'vendor_service_areas';

export const getServiceAreasByVendor = async (vendorId: string): Promise<ServiceArea[]> => {
  try {
    const q = query(collection(db, SERVICE_AREAS_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((docItem) => docItem.data() as ServiceArea)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error('Error fetching service areas:', error);
    throw error;
  }
};

export const getServiceAreaCountByType = async (vendorId: string): Promise<Record<string, number>> => {
  try {
    const areas = await getServiceAreasByVendor(vendorId);
    const counts: Record<string, number> = {
      city: 0,
      county: 0,
      region: 0,
      zip: 0,
      undefined: 0,
    };

    areas.forEach((area) => {
      counts[area.areaType] = (counts[area.areaType] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error getting service area counts:', error);
    throw error;
  }
};

export const createServiceArea = async (
  areaData: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const areaRef = doc(collection(db, SERVICE_AREAS_COLLECTION));
    const now = new Date();
    const areaWithTimestamps: ServiceArea = {
      ...areaData,
      id: areaRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(areaRef, areaWithTimestamps);
    return areaRef.id;
  } catch (error) {
    console.error('Error creating service area:', error);
    throw error;
  }
};

export const updateServiceArea = async (
  areaId: string,
  updates: Partial<ServiceArea>
): Promise<void> => {
  try {
    const docRef = doc(db, SERVICE_AREAS_COLLECTION, areaId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating service area:', error);
    throw error;
  }
};

export const deleteServiceArea = async (areaId: string): Promise<void> => {
  try {
    const docRef = doc(db, SERVICE_AREAS_COLLECTION, areaId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting service area:', error);
    throw error;
  }
};
