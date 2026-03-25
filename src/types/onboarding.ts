export type OnboardingSessionStatus = 
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED';

export interface OnboardingSession {
  id: string;
  vendorId: string;
  currentStep: number;
  stepsCompleted: number[];
  logoUploaded: boolean;
  descriptionWritten: boolean;
  tagsAdded: boolean;
  bannerUploaded: boolean;
  socialLinksAdded: boolean;
  ctaConfigured: boolean;
  documentsUploaded: boolean;
  paymentProcessed: boolean;
  profilePublished: boolean;
  sessionStatus: OnboardingSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
