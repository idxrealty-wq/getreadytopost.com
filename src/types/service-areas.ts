export type AreaType = 'city' | 'county' | 'region' | 'zip';

export interface ServiceArea {
  id: string;
  vendorId: string;
  areaType: AreaType;
  city?: string;
  county?: string;
  state?: string;
  region?: string;
  zipCode?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
