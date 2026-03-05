import * as admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps.length) return;

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || 'grtp2-5ba00';

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminDb() {
  initAdmin();
  return admin.firestore();
}
