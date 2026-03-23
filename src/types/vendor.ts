// src/types/vendor.ts
// Phase 1: Clean TypeScript types for GetReadyToPost ad system

export type VendorStatus = 'pending' | 'approved' | 'inactive' | 'rejected';
export type VendorTier = 'local' | 'state' | 'national';
export type MarketType = 'county' | 'metro' | 'state' | 'national';

export interface Vendor {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  categoryId: string;
  tier: VendorTier;
  marketId: string;
  logoUrl: string;
  adGraphicUrl: string;
  ctaText: string;
  destinationUrl: string;
  shortDescription: string;
  status: VendorStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  group: 'real-estate-core' | 'home-services' | 'home-improvement' | 'appliances-equipment' | 'insurance' | 'lifestyle-recreation';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Market {
  id: string;
  name: string;
  type: MarketType;
  state?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorCreateInput {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  categoryId: string;
  tier: VendorTier;
  marketId: string;
  logoUrl: string;
  adGraphicUrl: string;
  ctaText: string;
  destinationUrl: string;
  shortDescription: string;
  notes?: string;
}

export interface VendorUpdateInput {
  businessName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  categoryId?: string;
  tier?: VendorTier;
  marketId?: string;
  logoUrl?: string;
  adGraphicUrl?: string;
  ctaText?: string;
  destinationUrl?: string;
  shortDescription?: string;
  status?: VendorStatus;
  notes?: string;
}

export const VENDOR_TIERS: VendorTier[] = ['local', 'state', 'national'];
export const VENDOR_STATUSES: VendorStatus[] = ['pending', 'approved', 'inactive', 'rejected'];
export const MARKET_TYPES: MarketType[] = ['county', 'metro', 'state', 'national'];

export const DEFAULT_CATEGORIES = [
  { name: 'Mortgage / Lending', group: 'real-estate-core' },
  { name: 'Title & Closing', group: 'real-estate-core' },
  { name: 'Home Inspection', group: 'real-estate-core' },
  { name: 'Appraisal', group: 'real-estate-core' },
  { name: 'Real Estate Attorney', group: 'real-estate-core' },
  { name: 'Roofing', group: 'home-services' },
  { name: 'AC / HVAC', group: 'home-services' },
  { name: 'Plumbing', group: 'home-services' },
  { name: 'Electrical', group: 'home-services' },
  { name: 'Handyman', group: 'home-services' },
  { name: 'Painters', group: 'home-services' },
  { name: 'Windows & Doors', group: 'home-services' },
  { name: 'Alarm / Security Systems', group: 'home-services' },
  { name: 'Cleaning Services', group: 'home-services' },
  { name: 'Kitchens & Baths', group: 'home-improvement' },
  { name: 'Deck Builders', group: 'home-improvement' },
  { name: 'Dock Builders', group: 'home-improvement' },
  { name: 'Remodeling', group: 'home-improvement' },
  { name: 'Landscaping', group: 'home-improvement' },
  { name: 'Lawn Care', group: 'home-improvement' },
  { name: 'Pool Care / Pool Service', group: 'home-improvement' },
  { name: 'Appliances', group: 'appliances-equipment' },
  { name: 'Tools & Equipment', group: 'appliances-equipment' },
  { name: 'Home Insurance', group: 'insurance' },
  { name: 'Auto Insurance', group: 'insurance' },
  { name: 'Cars / Auto Dealers', group: 'lifestyle-recreation' },
  { name: 'Golf Carts', group: 'lifestyle-recreation' },
  { name: 'Boats', group: 'lifestyle-recreation' },
  { name: 'Jet Skis', group: 'lifestyle-recreation' },
];
