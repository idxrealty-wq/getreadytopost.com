export type AdZoneStatus = 
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'EXPIRED';

export type AdZoneTier = 'LOCAL' | 'STATE' | 'NATIONAL';

export interface AdZone {
  id: string;
  categoryId: string;
  tier: AdZoneTier;
  slotNumber: number;
  vendorId?: string;
  status: AdZoneStatus;
  adGraphicUrl?: string;
  adCtaText?: string;
  adCtaUrl?: string;
  startDate?: Date;
  endDate?: Date;
  postedBy?: string;
  postedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
