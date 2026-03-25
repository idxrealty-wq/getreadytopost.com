import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { OnboardingSession } from '@/types/onboarding';

const ONBOARDING_COLLECTION = 'vendor_onboarding_sessions';

export const getOnboardingSession = async (vendorId: string): Promise<OnboardingSession | null> => {
  try {
    const q = query(collection(db, ONBOARDING_COLLECTION), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? (querySnapshot.docs[0].data() as OnboardingSession) : null;
  } catch (error) {
    console.error('Error fetching onboarding session:', error);
    throw error;
  }
};

export const createOnboardingSession = async (vendorId: string): Promise<string> => {
  try {
    const sessionRef = doc(collection(db, ONBOARDING_COLLECTION));
    const now = new Date();
    const sessionData = {
      id: sessionRef.id,
      vendorId,
      currentStep: 1,
      stepsCompleted: [],
      logoUploaded: false,
      descriptionWritten: false,
      tagsAdded: false,
      bannerUploaded: false,
      socialLinksAdded: false,
      ctaConfigured: false,
      documentsUploaded: false,
      paymentProcessed: false,
      profilePublished: false,
      sessionStatus: 'IN_PROGRESS',
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(sessionRef, sessionData);
    return sessionRef.id;
  } catch (error) {
    console.error('Error creating onboarding session:', error);
    throw error;
  }
};

export const updateOnboardingStep = async (
  sessionId: string,
  stepNumber: number,
  stepData: Partial<OnboardingSession>
): Promise<void> => {
  try {
    const docRef = doc(db, ONBOARDING_COLLECTION, sessionId);
    const stepsCompleted = stepData.stepsCompleted || [];
    if (!stepsCompleted.includes(stepNumber)) {
      stepsCompleted.push(stepNumber);
    }
    await updateDoc(docRef, {
      ...stepData,
      currentStep: stepNumber + 1,
      stepsCompleted,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    throw error;
  }
};

export const completeOnboarding = async (sessionId: string): Promise<void> => {
  try {
    const docRef = doc(db, ONBOARDING_COLLECTION, sessionId);
    await updateDoc(docRef, {
      sessionStatus: 'COMPLETED',
      profilePublished: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};
