import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { EmailTemplate } from '@/types/email-templates';

const EMAIL_TEMPLATES_COLLECTION = 'email_templates';

export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, EMAIL_TEMPLATES_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as EmailTemplate);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    throw error;
  }
};

export const getEmailTemplateByType = async (type: string): Promise<EmailTemplate | null> => {
  try {
    const q = query(collection(db, EMAIL_TEMPLATES_COLLECTION), where('type', '==', type));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as EmailTemplate) : null;
  } catch (error) {
    console.error('Error fetching email template by type:', error);
    throw error;
  }
};

export const createEmailTemplate = async (
  templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const templateRef = doc(collection(db, EMAIL_TEMPLATES_COLLECTION));
    const now = new Date();
    const templateWithMeta = {
      ...templateData,
      id: templateRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(templateRef, templateWithMeta);
    return templateRef.id;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw error;
  }
};

export const updateEmailTemplate = async (
  templateId: string,
  updates: Partial<EmailTemplate>
): Promise<void> => {
  try {
    const docRef = doc(db, EMAIL_TEMPLATES_COLLECTION, templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    throw error;
  }
};
