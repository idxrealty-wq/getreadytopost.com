import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import type { AdminSetting, SettingType } from '@/types/admin-settings';

const ADMIN_SETTINGS_COLLECTION = 'admin_settings';

export const getAdminSetting = async (settingKey: string): Promise<AdminSetting | null> => {
  try {
    const q = query(collection(db, ADMIN_SETTINGS_COLLECTION), where('settingKey', '==', settingKey));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as AdminSetting) : null;
  } catch (error) {
    console.error('Error fetching admin setting:', error);
    throw error;
  }
};

export const getAllAdminSettings = async (): Promise<AdminSetting[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, ADMIN_SETTINGS_COLLECTION));
    return querySnapshot.docs.map((docItem) => docItem.data() as AdminSetting);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
};

export const createAdminSetting = async (
  settingKey: string,
  settingValue: string,
  settingType: SettingType,
  description?: string
): Promise<string> => {
  try {
    const settingRef = doc(collection(db, ADMIN_SETTINGS_COLLECTION));
    const settingData: AdminSetting = {
      id: settingRef.id,
      settingKey,
      settingValue,
      settingType,
      description,
      updatedAt: new Date(),
    };
    await setDoc(settingRef, settingData);
    return settingRef.id;
  } catch (error) {
    console.error('Error creating admin setting:', error);
    throw error;
  }
};

export const updateAdminSetting = async (
  settingKey: string,
  settingValue: string,
  updatedBy?: string
): Promise<void> => {
  try {
    const q = query(collection(db, ADMIN_SETTINGS_COLLECTION), where('settingKey', '==', settingKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length === 0) {
      throw new Error(`Setting ${settingKey} not found`);
    }

    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      settingValue,
      updatedBy,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating admin setting:', error);
    throw error;
  }
};
