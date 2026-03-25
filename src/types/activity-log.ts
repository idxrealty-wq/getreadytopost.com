export type ActionType = 
  | 'PROFILE_UPDATED'
  | 'DOCUMENT_UPLOADED'
  | 'AD_PURCHASED'
  | 'VERIFICATION_PURCHASED'
  | 'PAYMENT_PROCESSED'
  | 'PROFILE_PUBLISHED';

export interface VendorActivityLog {
  id: string;
  vendorId: string;
  actionType: ActionType;
  actionDetails?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  createdAt: Date;
}
