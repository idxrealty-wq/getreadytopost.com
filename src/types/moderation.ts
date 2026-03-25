export type FlagReason = 
  | 'COMPLIANCE'
  | 'QUALITY'
  | 'SPAM'
  | 'OTHER';

export interface ModerationQueueItem {
  id: string;
  vendorId: string;
  itemType: string;
  itemId: string;
  reason: FlagReason;
  flaggedContent?: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  flaggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
