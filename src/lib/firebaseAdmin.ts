import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON missing');
  const sa = JSON.parse(json);
  initializeApp({ credential: cert(sa) });
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}
