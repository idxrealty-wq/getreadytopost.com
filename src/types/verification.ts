export type VerificationStatus = 
  | 'NOT_PURCHASED'
  | 'PURCHASED_PENDING'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'FAILED'
  | 'UNVERIFIED';

export interface VerificationPurchase {
  id: string;
  vendorId: string;
  status: VerificationStatus;
  purchaseDate: Date;
  expiryDate: Date;
  verifiedDate?: Date;
  unverifiedDate?: Date;
  adminNotes?: string;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  createdAt: Date;
  updatedAt: Date;
}
