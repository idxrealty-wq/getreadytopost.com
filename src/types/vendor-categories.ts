export interface VendorCategory {
  id: string;
  categoryName: string;
  categorySlug: string;
  description?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}
