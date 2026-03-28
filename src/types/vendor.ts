export type VendorStatus =
  | 'pending'
  | 'approved'
  | 'active'
  | 'inactive'
  | 'rejected'
  | 'suspended'
  | 'expired';

export type VendorTier =
  | 'local'
  | 'state'
  | 'national';

export type VerificationStatus =
  | 'not_verified'
  | 'pending_verification'
  | 'verified'
  | 'rejected';

export type VideoTier =
  | 'none'
  | 'free'
  | 'premium';

export const DEFAULT_CATEGORIES = [
  'Home Services',
  'Real Estate',
  'Mortgage',
  'Insurance',
  'Title',
  'Inspection',
  'Photography',
  'Staging',
  'Legal',
  'Moving',
  'Cleaning',
  'Landscaping',
];

export interface Vendor {
  id: string;
  businessName: string;
  description?: string;
  email: string;
  phone: string;
  tollFreePhone?: string;
  contactName: string;
  websiteUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  videoUrl?: string;
  categoryId: string;
  marketId?: string;
  adGraphicUrl?: string;
  destinationUrl?: string;
  shortDescription?: string;
  notes?: string;
  address?: string;
  zip?: string;
  areasServed?: string[];
  tags?: string[];
  nowServing?: string[];
  locations?: any[];
  vaultUrl?: string;
  tier: VendorTier;
  status: VendorStatus;
  isVerified: boolean;
  verificationStatus?: VerificationStatus;
  verifiedDate?: Date | string | null;
  unverifiedDate?: Date | string | null;
  verificationNotes?: string;
  ctaText?: string;
  ctaUrl?: string;
  isParent?: boolean;
  primaryLanguage?: string;
  secondaryLanguages?: string[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  videoTier?: VideoTier;
  videoLanguages?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export type VendorCreateInput = Omit<
  Vendor,
  'id' | 'createdAt' | 'updatedAt'
>;

export type VendorUpdateInput = Partial<
  Omit<Vendor, 'id' | 'createdAt' | 'createdBy'>
>;

export interface Category {
  id: string;
  name: string;
  slug?: string;
  displayOrder?: number;
  group?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Market {
  id: string;
  name: string;
  type: 'national' | 'state' | 'region' | 'city' | 'county' | 'metro';
  state?: string;
  region?: string;
  city?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
