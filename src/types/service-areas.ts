export type AreaType = 
  | 'city'
  | 'county'
  | 'region'
  | 'zip'
  | 'undefined';

export interface ServiceArea {
  id: string;
  vendorId: string;
  areaName: string;
  areaType: AreaType;
  isPrimary: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}
