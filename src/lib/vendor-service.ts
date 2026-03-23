import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Category,
  DEFAULT_CATEGORIES,
  Market,
  Vendor,
  VendorCreateInput,
  VendorUpdateInput,
  VendorStatus,
  VendorTier,
} from '@/types/vendor';

export const VENDORS_COLLECTION = 'vendors';
export const CATEGORIES_COLLECTION = 'categories';
export const MARKETS_COLLECTION = 'markets';

export async function createVendor(input: VendorCreateInput): Promise<Vendor> {
  const now = new Date();

  const vendorRecord = {
    businessName: input.businessName.trim(),
    contactName: input.contactName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    websiteUrl: input.websiteUrl.trim(),
    categoryId: input.categoryId,
    tier: input.tier,
    marketId: input.marketId,
    logoUrl: input.logoUrl.trim(),
    adGraphicUrl: input.adGraphicUrl.trim(),
    ctaText: input.ctaText.trim(),
    destinationUrl: input.destinationUrl.trim(),
    shortDescription: input.shortDescription.trim(),
    status: 'pending' as VendorStatus,
    notes: input.notes?.trim() ?? '',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, VENDORS_COLLECTION), vendorRecord);

  return {
    id: docRef.id,
    ...vendorRecord,
  };
}

export async function getVendorById(vendorId: string): Promise<Vendor | null> {
  const docRef = doc(db, VENDORS_COLLECTION, vendorId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Vendor;
}

export async function updateVendor(
  vendorId: string,
  updates: VendorUpdateInput
): Promise<void> {
  const docRef = doc(db, VENDORS_COLLECTION, vendorId);

  const payload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.businessName !== undefined) payload.businessName = updates.businessName.trim();
  if (updates.contactName !== undefined) payload.contactName = updates.contactName.trim();
  if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
  if (updates.phone !== undefined) payload.phone = updates.phone.trim();
  if (updates.websiteUrl !== undefined) payload.websiteUrl = updates.websiteUrl.trim();
  if (updates.categoryId !== undefined) payload.categoryId = updates.categoryId;
  if (updates.tier !== undefined) payload.tier = updates.tier;
  if (updates.marketId !== undefined) payload.marketId = updates.marketId;
  if (updates.logoUrl !== undefined) payload.logoUrl = updates.logoUrl.trim();
  if (updates.adGraphicUrl !== undefined) payload.adGraphicUrl = updates.adGraphicUrl.trim();
  if (updates.ctaText !== undefined) payload.ctaText = updates.ctaText.trim();
  if (updates.destinationUrl !== undefined) payload.destinationUrl = updates.destinationUrl.trim();
  if (updates.shortDescription !== undefined) payload.shortDescription = updates.shortDescription.trim();
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined) payload.notes = updates.notes.trim();

  await updateDoc(docRef, payload);
}

export async function listVendors(params?: {
  status?: VendorStatus;
  categoryId?: string;
  tier?: VendorTier;
  marketId?: string;
  pageSize?: number;
}): Promise<Vendor[]> {
  const constraints = [];

  if (params?.status) constraints.push(where('status', '==', params.status));
  if (params?.categoryId) constraints.push(where('categoryId', '==', params.categoryId));
  if (params?.tier) constraints.push(where('tier', '==', params.tier));
  if (params?.marketId) constraints.push(where('marketId', '==', params.marketId));

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(params?.pageSize ?? 100));

  const q = query(collection(db, VENDORS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...item.data(),
      }) as Vendor
  );
}

export async function approveVendor(vendorId: string): Promise<void> {
  await updateVendor(vendorId, { status: 'approved' });
}

export async function rejectVendor(vendorId: string, notes?: string): Promise<void> {
  await updateVendor(vendorId, {
    status: 'rejected',
    ...(notes !== undefined ? { notes } : {}),
  });
}

export async function deactivateVendor(vendorId: string): Promise<void> {
  await updateVendor(vendorId, { status: 'inactive' });
}

export async function listCategories(): Promise<Category[]> {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...item.data(),
      }) as Category
  );
}

export async function initializeDefaultCategories(): Promise<void> {
  const existing = await getDocs(collection(db, CATEGORIES_COLLECTION));
  if (!existing.empty) return;

  const batch = writeBatch(db);
  const now = new Date();

  DEFAULT_CATEGORIES.forEach((category) => {
    const ref = doc(collection(db, CATEGORIES_COLLECTION));
    batch.set(ref, {
      ...category,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}

export async function listMarkets(): Promise<Market[]> {
  const q = query(
    collection(db, MARKETS_COLLECTION),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...item.data(),
      }) as Market
  );
}

export async function initializeDefaultMarkets(): Promise<void> {
  const existing = await getDocs(collection(db, MARKETS_COLLECTION));
  if (!existing.empty) return;

  const batch = writeBatch(db);
  const now = new Date();

  const defaultMarkets = [
    { name: 'National', type: 'national', isActive: true },
    { name: 'Florida', type: 'state', state: 'Florida', isActive: true },
  ];

  defaultMarkets.forEach((market) => {
    const ref = doc(collection(db, MARKETS_COLLECTION));
    batch.set(ref, {
      ...market,
      createdAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
}

export async function initializeVendorPhase1Data(): Promise<void> {
  await initializeDefaultCategories();
  await initializeDefaultMarkets();
}
