export type SubscriptionStatus = 
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BillingCycle = 'monthly' | 'annual';

export interface Subscription {
  id: string;
  vendorId: string;
  tier: 'BASIC' | 'AI_ASSISTED' | 'GROWTH' | 'PREMIUM';
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  squareSubscriptionId?: string;
  nextBillingDate: Date;
  autoRenew: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
