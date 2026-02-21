// FORCE REBUILD - timestamp: 1771628717
import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebaseClient';

export interface Listing {
  id: string;
  userId: string;
  status: 'draft' | 'completed';
  address: string;
  propertyData: {
    taxId: string;
    yearBuilt: string;
    beds: string;
    baths: string;
    sqft: string;
    lotSize: string;
    price: string;
    features: string;
    dateAdded: string;
  };
  nearby: any;
  aiListing: string;
  checklistState: Record<string, boolean>;
  notes: string;
  photos?: Array<{ url?: string; downloadURL?: string; categoryId?: string; category?: string; uploadedAt: string }>;
  documents?: Array<{ docId: string; label: string; fileName: string; fileSize: number; fileType: string; downloadURL: string; uploadedAt: string; required: boolean }>;
  createdAt: string;
  updatedAt: string;
}

export const saveListing = async (
  userId: string,
  address: string,
  propertyData: any,
  nearby: any,
  aiListing: string,
  checklistState: Record<string, boolean>,
  notes: string,
  photos?: Array<{ url: string; category: string; uploadedAt: string }>
): Promise<string> => {
  const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const listingRef = doc(db, 'listings', listingId);
  const listingData: Listing = {
    id: listingId,
    userId,
    status: 'completed',
    address,
    propertyData,
    nearby,
    aiListing,
    checklistState,
    notes,
    photos: photos || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(listingRef, listingData);
  return listingId;
};

export const getUserListings = async (userId: string): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(
    listingsRef,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Listing);
};
