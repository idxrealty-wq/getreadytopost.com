import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { VendorCategory } from '@/types/vendor-categories';

const VENDOR_CATEGORIES_COLLECTION = 'vendor_categories';

export const getVendorCategories = async (): Promise<VendorCategory[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, VENDOR_CATEGORIES_COLLECTION));
    return querySnapshot.docs
      .map(doc => doc.data() as VendorCategory)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error('Error fetching vendor categories:', error);
    throw error;
  }
};

export const getVendorCategoriesByParent = async (parentCategoryId: string): Promise<VendorCategory[]> => {
  try {
    const q = query(collection(db, VENDOR_CATEGORIES_COLLECTION), where('parentCategoryId', '==', parentCategoryId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => doc.data() as VendorCategory)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    console.error('Error fetching vendor categories by parent:', error);
    throw error;
  }
};

export const createVendorCategory = async (
  categoryData: Omit<VendorCategory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const categoryRef = doc(collection(db, VENDOR_CATEGORIES_COLLECTION));
    const now = new Date();
    const categoryWithMeta = {
      ...categoryData,
      id: categoryRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(categoryRef, categoryWithMeta);
    return categoryRef.id;
  } catch (error) {
    console.error('Error creating vendor category:', error);
    throw error;
  }
};

export const updateVendorCategory = async (
  categoryId: string,
  updates: Partial<VendorCategory>
): Promise<void> => {
  try {
    const docRef = doc(db, VENDOR_CATEGORIES_COLLECTION, categoryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating vendor category:', error);
    throw error;
  }
};

export const reorderVendorCategories = async (categories: VendorCategory[]): Promise<void> => {
  try {
    const updatePromises = categories.map(cat =>
      updateDoc(doc(db, VENDOR_CATEGORIES_COLLECTION, cat.id), {
        displayOrder: cat.displayOrder,
        updatedAt: new Date(),
      })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error reordering vendor categories:', error);
    throw error;
  }
};
