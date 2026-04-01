// src/lib/maps/mapTypes.ts

export type PropertyStatus = "active" | "sold" | "pending";

export interface PropertyPin {
  id: string;
  mlsNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  status: PropertyStatus;
  listPrice: number;
  soldPrice?: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  listedDate: string;
  soldDate?: string;
  photoUrl?: string;
  videoUrl?: string;
  description?: string;
}

export interface AgentMapProfile {
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  agentPhotoUrl?: string;
  brokerageName: string;
  licenseNumber: string;
  serviceArea: string;
  properties: PropertyPin[];
}

export interface MapFiltersState {
  status: PropertyStatus | "all";
  minPrice: number;
  maxPrice: number;
  minBeds: number;
  minBaths: number;
  showVideosOnly: boolean;
}

export const DEFAULT_FILTERS: MapFiltersState = {
  status: "all",
  minPrice: 0,
  maxPrice: 5000000,
  minBeds: 0,
  minBaths: 0,
  showVideosOnly: false,
};
