// netlify/functions/increment-preview-views.js
const admin = require('firebase-admin');

function initAdmin() {
  if (admin.apps.length) return;

  const svc = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (!svc) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT env var (JSON).');
  }

  admin.initializeApp({
    credential: admin.credential.cert(svc),
  });
}

exports.handler = async (event) => {
  try {
    initAdmin();

    const { slug } = event.queryStringParameters || {};
    if (!slug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'Missing slug' }),
      };
    }

    const db = admin.firestore();
    const ref = db.collection('public_previews').doc(slug);

    // Atomic increment
    await ref.set(
      { viewCount: admin.firestore.FieldValue.increment(1), updatedAt: new Date().toISOString() },
      { merge: true }
    );

    const snap = await ref.get();
    const data = snap.exists ? snap.data() : {};

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, viewCount: data.viewCount || 0 }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message || 'Server error' }),
    };
  }
};
