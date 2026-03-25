export interface EmailTemplate {
  id: string;
  templateKey: string;
  templateName: string;
  subject: string;
  body: string;
  variables?: string[];
  isActive: boolean;
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}
