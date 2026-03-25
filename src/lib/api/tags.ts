import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { VendorTag } from '@/types/vendor-tags';

const TAGS_COLLECTION = 'vendor_tags';

export const getTagsByVendor = async (vendorId: string): Promise<VendorTag[]> => {
  try {
    const q = query(collection(db, TAGS_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as VendorTag);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

export const addTag = async (vendorId: string, tag: string): Promise<string> => {
  try {
    const tagRef = doc(collection(db, TAGS_COLLECTION));
    const tagData = {
      id: tagRef.id,
      vendorId,
      tag,
      createdAt: new Date(),
    };
    await setDoc(tagRef, tagData);
    return tagRef.id;
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
};

export const deleteTag = async (tagId: string): Promise<void> => {
  try {
    const docRef = doc(db, TAGS_COLLECTION, tagId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

export const getTagCount = async (vendorId: string): Promise<number> => {
  try {
    const tags = await getTagsByVendor(vendorId);
    return tags.length;
  } catch (error) {
    console.error('Error getting tag count:', error);
    throw error;
  }
};
