// src/lib/services/vendor-service.ts
// Vendor CRUD and management service

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Vendor,
  VendorCreateInput,
  VendorUpdateInput,
  VendorStatus,
  VerificationStatus,
  Category,
  Market,
} from "@/types/vendor";

const VENDORS_COLLECTION = "vendors";
const CATEGORIES_COLLECTION = "categories";
const MARKETS_COLLECTION = "markets";

// ============================================================================
// VENDOR CRUD OPERATIONS
// ============================================================================

export async function createVendor(input: VendorCreateInput): Promise<Vendor> {
  const now = new Date();

  const vendorData = {
    businessName: input.businessName,
    contactName: input.contactName || "",
    email: input.email || "",
    phone: input.phone || "",
    websiteUrl: input.websiteUrl || "",
    categoryId: input.categoryId || "",
    tier: input.tier || "local",
    marketId: input.marketId || "",
    logoUrl: input.logoUrl || "",
    adGraphicUrl: input.adGraphicUrl || "",
    ctaText: input.ctaText || "",
    destinationUrl: input.destinationUrl || "",
    shortDescription: input.shortDescription || "",
    status: "pending" as VendorStatus,
    notes: input.notes || "",
    address: input.address || "",
    city: input.city || "",
    state: input.state || "",
    zip: input.zip || "",
    areasServed: input.areasServed || [],
    tags: input.tags || [],
    nowServing: input.nowServing || [],
    videoUrl: input.videoUrl || "",
    videoTier: input.videoTier || "none",
    videoLanguages: input.videoLanguages || [],
    locations: input.locations || [],
    isParent: input.isParent || false,
    vaultUrl: input.vaultUrl || "",
    isVerified: input.isVerified || false,
    verificationStatus: input.verificationStatus || ("not_verified" as VerificationStatus),
    verifiedDate: input.verifiedDate || null,
    verificationNotes: input.verificationNotes || "",
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const docRef = await addDoc(collection(db, VENDORS_COLLECTION), vendorData);

  return {
    id: docRef.id,
    ...vendorData,
    createdAt: now,
    updatedAt: now,
  } as Vendor;
}

export async function getVendor(id: string): Promise<Vendor | null> {
  const docRef = doc(db, VENDORS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Vendor;
}

export async function listVendors(): Promise<Vendor[]> {
  const q = query(
    collection(db, VENDORS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const vendors: Vendor[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    vendors.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Vendor);
  });

  return vendors;
}

export async function updateVendor(
  id: string,
  input: VendorUpdateInput
): Promise<Vendor> {
  const docRef = doc(db, VENDORS_COLLECTION, id);
  const now = new Date();

  const updateData: Record<string, any> = {
    ...input,
    updatedAt: Timestamp.fromDate(now),
  };

  await updateDoc(docRef, updateData);

  const updated = await getVendor(id);
  if (!updated) {
    throw new Error("Failed to retrieve updated vendor");
  }

  return updated;
}

export async function deleteVendor(id: string): Promise<void> {
  const docRef = doc(db, VENDORS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ============================================================================
// VENDOR STATUS & APPROVAL OPERATIONS
// ============================================================================

export async function approveVendor(id: string): Promise<Vendor> {
  return updateVendor(id, { status: "approved" });
}

export async function rejectVendor(id: string): Promise<Vendor> {
  return updateVendor(id, { status: "rejected" });
}

export async function activateVendor(id: string): Promise<Vendor> {
  return updateVendor(id, { status: "approved" });
}

export async function deactivateVendor(id: string): Promise<Vendor> {
  return updateVendor(id, { status: "inactive" });
}

export async function setVendorVerified(
  id: string,
  isVerified: boolean,
  verificationStatus: VerificationStatus,
  verifiedDate?: string,
  verificationNotes?: string
): Promise<Vendor> {
  return updateVendor(id, {
    isVerified,
    verificationStatus,
    verifiedDate,
    verificationNotes,
  });
}

export async function getVendorsByStatus(status: VendorStatus): Promise<Vendor[]> {
  const q = query(
    collection(db, VENDORS_COLLECTION),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const vendors: Vendor[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    vendors.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Vendor);
  });

  return vendors;
}

export async function getVerifiedVendors(): Promise<Vendor[]> {
  const q = query(
    collection(db, VENDORS_COLLECTION),
    where("isVerified", "==", true),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const vendors: Vendor[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    vendors.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Vendor);
  });

  return vendors;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getDashboardStats(): Promise<{
  totalVendors: number;
  pendingVendors: number;
  approvedVendors: number;
  verifiedVendors: number;
  totalCategories: number;
  totalMarkets: number;
}> {
  const allVendors = await listVendors();
  const allCategories = await listCategories();
  const allMarkets = await listMarkets();

  const pendingVendors = allVendors.filter((v) => v.status === "pending").length;
  const approvedVendors = allVendors.filter((v) => v.status === "approved").length;
  const verifiedVendors = allVendors.filter((v) => v.isVerified).length;

  return {
    totalVendors: allVendors.length,
    pendingVendors,
    approvedVendors,
    verifiedVendors,
    totalCategories: allCategories.length,
    totalMarkets: allMarkets.length,
  };
}

export async function getRecentVendors(count: number = 5): Promise<Vendor[]> {
  const q = query(
    collection(db, VENDORS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(count)
  );

  const querySnapshot = await getDocs(q);
  const vendors: Vendor[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    vendors.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Vendor);
  });

  return vendors;
}

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

export async function createCategory(name: string, group: string): Promise<Category> {
  const now = new Date();

  const categoryData = {
    name,
    group,
    isActive: true,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), categoryData);

  return {
    id: docRef.id,
    ...categoryData,
    createdAt: now,
    updatedAt: now,
  } as Category;
}

export async function listCategories(): Promise<Category[]> {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where("isActive", "==", true),
    orderBy("name", "asc")
  );

  const querySnapshot = await getDocs(q);
  const categories: Category[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    categories.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Category);
  });

  return categories;
}

export async function getCategory(id: string): Promise<Category | null> {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Category;
}

// ============================================================================
// MARKET OPERATIONS
// ============================================================================

export async function createMarket(
  name: string,
  type: string,
  state?: string
): Promise<Market> {
  const now = new Date();

  const marketData = {
    name,
    type,
    state,
    isActive: true,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const docRef = await addDoc(collection(db, MARKETS_COLLECTION), marketData);

  return {
    id: docRef.id,
    ...marketData,
    createdAt: now,
    updatedAt: now,
  } as Market;
}

export async function listMarkets(): Promise<Market[]> {
  const q = query(
    collection(db, MARKETS_COLLECTION),
    where("isActive", "==", true),
    orderBy("name", "asc")
  );

  const querySnapshot = await getDocs(q);
  const markets: Market[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    markets.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Market);
  });

  return markets;
}

export async function getMarket(id: string): Promise<Market | null> {
  const docRef = doc(db, MARKETS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Market;
}
// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initializeDefaultCategories(): Promise<void> {
  const existing = await listCategories();
  if (existing.length > 0) {
    return; // Already initialized
  }

  const DEFAULT_CATEGORIES = [
    { name: "Mortgage / Lending", group: "real-estate-core" },
    { name: "Title & Closing", group: "real-estate-core" },
    { name: "Home Inspection", group: "real-estate-core" },
    { name: "Appraisal", group: "real-estate-core" },
    { name: "Real Estate Attorney", group: "real-estate-core" },
    { name: "Roofing", group: "home-services" },
    { name: "AC / HVAC", group: "home-services" },
    { name: "Plumbing", group: "home-services" },
    { name: "Electrical", group: "home-services" },
    { name: "Handyman", group: "home-services" },
    { name: "Painters", group: "home-services" },
    { name: "Windows & Doors", group: "home-services" },
    { name: "Alarm / Security Systems", group: "home-services" },
    { name: "Cleaning Services", group: "home-services" },
    { name: "Kitchens & Baths", group: "home-improvement" },
    { name: "Deck Builders", group: "home-improvement" },
    { name: "Dock Builders", group: "home-improvement" },
    { name: "Remodeling", group: "home-improvement" },
    { name: "Landscaping", group: "home-improvement" },
    { name: "Lawn Care", group: "home-improvement" },
    { name: "Pool Care / Pool Service", group: "home-improvement" },
    { name: "Appliances", group: "appliances-equipment" },
    { name: "Tools & Equipment", group: "appliances-equipment" },
    { name: "Home Insurance", group: "insurance" },
    { name: "Auto Insurance", group: "insurance" },
    { name: "Cars / Auto Dealers", group: "lifestyle-recreation" },
    { name: "Golf Carts", group: "lifestyle-recreation" },
    { name: "Boats", group: "lifestyle-recreation" },
    { name: "Jet Skis", group: "lifestyle-recreation" },
  ];

  for (const cat of DEFAULT_CATEGORIES) {
    await createCategory(cat.name, cat.group);
  }
}

export async function initializeDefaultMarkets(): Promise<void> {
  const existing = await listMarkets();
  if (existing.length > 0) {
    return; // Already initialized
  }

  const DEFAULT_MARKETS = [
    { name: "Orange County", type: "county", state: "FL" },
    { name: "Lake County", type: "county", state: "FL" },
    { name: "Seminole County", type: "county", state: "FL" },
    { name: "Osceola County", type: "county", state: "FL" },
    { name: "Volusia County", type: "county", state: "FL" },
    { name: "Central Florida Metro", type: "metro", state: "FL" },
    { name: "Florida Statewide", type: "state", state: "FL" },
    { name: "National", type: "national" },
  ];

  for (const market of DEFAULT_MARKETS) {
    await createMarket(market.name, market.type, market.state);
  }
}

export async function initializeVendorSystem(): Promise<void> {
  await initializeDefaultCategories();
  await initializeDefaultMarkets();
}
