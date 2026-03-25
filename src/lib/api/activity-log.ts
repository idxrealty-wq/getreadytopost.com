import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { VendorActivityLog } from '@/types/activity-log';

const ACTIVITY_LOG_COLLECTION = 'vendor_activity_log';

export const getActivityLogByVendor = async (vendorId: string, limit: number = 10): Promise<VendorActivityLog[]> => {
  try {
    const q = query(collection(db, ACTIVITY_LOG_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => doc.data() as VendorActivityLog)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    throw error;
  }
};

export const logActivity = async (
  vendorId: string,
  actionType: string,
  actionDetails?: string,
  ipAddress?: string,
  userAgent?: string,
  status: 'success' | 'failed' = 'success'
): Promise<string> => {
  try {
    const logRef = doc(collection(db, ACTIVITY_LOG_COLLECTION));
    const logData = {
      id: logRef.id,
      vendorId,
      actionType,
      actionDetails,
      ipAddress,
      userAgent,
      status,
      createdAt: new Date(),
    };
    await setDoc(logRef, logData);
    return logRef.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

export const getActivityByType = async (vendorId: string, actionType: string): Promise<VendorActivityLog[]> => {
  try {
    const q = query(
      collection(db, ACTIVITY_LOG_COLLECTION),
      where('vendorId', '==', vendorId),
      where('actionType', '==', actionType)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as VendorActivityLog);
  } catch (error) {
    console.error('Error fetching activity by type:', error);
    throw error;
  }
};
