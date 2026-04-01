import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type EmergencyContact = {
  name: string;
  phone: string;
  email: string;
  relationship: string;
};

export type ShowingSession = {
  id?: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  propertyAddress: string;
  clientName: string;
  scheduledDuration: number; // minutes
  status: 'active' | 'completed' | 'alert_triggered' | 'expired';
  startedAt: string;
  completedAt?: string;
  lastCheckinAt?: string;
  panicTriggeredAt?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
    mapsLink: string;
    capturedAt: string;
  };
  emergencyContacts: EmergencyContact[];
  alertsSent?: string[];
  notes?: string;
};

export type AgentSafetyProfile = {
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  emergencyContacts: EmergencyContact[];
  panicPhrase: string;
  updatedAt: string;
};

// ── Safety Profile ──────────────────────────────────────────

export async function getSafetyProfile(agentId: string): Promise<AgentSafetyProfile | null> {
  const ref = doc(db, 'showingShieldProfiles', agentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as AgentSafetyProfile;
}

export async function saveSafetyProfile(profile: AgentSafetyProfile): Promise<void> {
  const ref = doc(db, 'showingShieldProfiles', profile.agentId);
  await updateDoc(ref, { ...profile, updatedAt: new Date().toISOString() }).catch(async () => {
    const { setDoc } = await import('firebase/firestore');
    await setDoc(ref, { ...profile, updatedAt: new Date().toISOString() });
  });
}

// ── Sessions ─────────────────────────────────────────────────

export async function createSession(session: Omit<ShowingSession, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'showingSessions'), {
    ...session,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSession(sessionId: string, data: Partial<ShowingSession>): Promise<void> {
  const ref = doc(db, 'showingSessions', sessionId);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function getActiveSession(agentId: string): Promise<ShowingSession | null> {
  const q = query(
    collection(db, 'showingSessions'),
    where('agentId', '==', agentId),
    where('status', '==', 'active')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as ShowingSession;
}

export async function getSessionHistory(agentId: string): Promise<ShowingSession[]> {
  const q = query(
    collection(db, 'showingSessions'),
    where('agentId', '==', agentId),
    orderBy('startedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShowingSession));
}

export async function getSessionById(sessionId: string): Promise<ShowingSession | null> {
  const ref = doc(db, 'showingSessions', sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ShowingSession;
}
