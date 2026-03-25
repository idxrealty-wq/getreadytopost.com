import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { VendorDocument } from '@/types/documents';

const DOCUMENTS_COLLECTION = 'vendor_documents';

export const getDocumentsByVendor = async (vendorId: string): Promise<VendorDocument[]> => {
  try {
    const q = query(collection(db, DOCUMENTS_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as VendorDocument);
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

export const getPublicDocuments = async (vendorId: string): Promise<VendorDocument[]> => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('vendorId', '==', vendorId),
      where('isPublic', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as VendorDocument);
  } catch (error) {
    console.error('Error fetching public documents:', error);
    throw error;
  }
};

export const createDocument = async (
  documentData: Omit<VendorDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = doc(collection(db, DOCUMENTS_COLLECTION));
    const now = new Date();
    const documentWithTimestamps = {
      ...documentData,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(docRef, documentWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

export const updateDocument = async (
  documentId: string,
  updates: Partial<VendorDocument>
): Promise<void> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};
