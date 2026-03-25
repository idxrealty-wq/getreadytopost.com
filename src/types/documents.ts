export type DocumentType = 
  | 'BUSINESS_LICENSE'
  | 'CERTIFICATION'
  | 'INSURANCE'
  | 'MARKETING_MATERIAL'
  | 'OTHER';

export type DocumentStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface VendorDocument {
  id: string;
  vendorId: string;
  documentType: DocumentType;
  documentName: string;
  documentUrl: string;
  isPublic: boolean;
  adCopyProvided: boolean;
  adCopy?: string;
  adCopyStatus?: 'draft' | 'approved' | 'rejected';
  adCopyApprovedAt?: Date;
  tags?: string[];
  status: DocumentStatus;
  adminNotes?: string;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
