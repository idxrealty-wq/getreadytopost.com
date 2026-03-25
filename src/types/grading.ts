export interface VendorGrading {
  id: string;
  vendorId: string;
  logoScore: number;
  descriptionScore: number;
  tagsScore: number;
  bannerScore: number;
  socialLinksScore: number;
  overallScore: number;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
