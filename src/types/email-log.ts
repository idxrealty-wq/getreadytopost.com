export type EmailType =
  | 'PROFILE_PUBLISHED'
  | 'VERIFICATION_PURCHASED'
  | 'VERIFICATION_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'AD_PURCHASED'
  | 'PAYMENT_FAILED'
  | 'FRANCHISE_INQUIRY';

export interface VendorEmailLog {
  id: string;
  vendorId: string;
  emailType: EmailType;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'bounced';
  sentAt: Date;
  createdAt: Date;
}
