// src/lib/listings.ts
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
    legalDescription?: string;
    propertyType?: string;
    zoning?: string;
    stories?: string;
    garage?: string;
    pool?: string;
    construction?: string;
    schoolDistrict?: string;
    hoa?: string;
    hoaAmount?: string;
    hoaName?: string;
    amenities?: string;
    floodZone?: string;
    water?: string;
    sewer?: string;
    roofYear?: string;
    acYear?: string;
    waterHeaterYear?: string;
    assessedValue?: string;
    lastSalePrice?: string;
    lastSaleYear?: string;
    homestead?: string;
    propertyLink?: string;
    ownerName?: string;
    justValue?: string;
    taxableValue?: string;
    landValue?: string;
    buildingValue?: string;
    virtualTourUrl?: string;
  };
  nearby: any;
  aiListing: string;
  checklistState: Record<string, boolean>;
  notes: string;
  photos?: Array<{
    url?: string;
    downloadURL?: string;
    categoryId?: string;
    category?: string;
    uploadedAt: string;
  }>;
  documents?: Array<{
    docId: string;
    label: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadURL: string;
    uploadedAt: string;
    required: boolean;
  }>;
  googlePhoto?: {
    downloadURL: string;
    source: 'streetview' | 'aerial';
    unlockedAt: string;
    unlockedBy: 'credit' | 'payment';
    paymentMethod?: 'square' | 'manual';
  };
  documentAccessCode?: string;
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
  photos?: Array<{ url: string; category: string; uploadedAt: string }>,
  documents?: Array<{
    docId: string;
    label: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadURL: string;
    uploadedAt: string;
    required: boolean;
  }>,
  documentAccessCode?: string,
  googlePhoto?: {
    downloadURL: string;
    source: 'streetview' | 'aerial';
    unlockedAt: string;
    unlockedBy: 'credit' | 'payment';
    paymentMethod?: 'square' | 'manual';
  }
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
    documents: documents || [],
    googlePhoto,
    documentAccessCode: documentAccessCode || '',
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
