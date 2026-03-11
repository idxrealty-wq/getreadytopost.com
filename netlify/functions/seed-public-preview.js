// netlify/functions/seed-public-preview.js
const admin = require('firebase-admin');

function initAdmin() {
  if (admin.apps.length) return;

  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : null;

  if (!svc) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON env var (JSON).');

  admin.initializeApp({
    credential: admin.credential.cert(svc),
  });
}

exports.handler = async (event) => {
  try {
    initAdmin();

    const qsKey = event.queryStringParameters?.key;
    const headerKey = event.headers?.['x-seed-key'] || event.headers?.['X-Seed-Key'];
    const key = qsKey || headerKey;

    if (!process.env.SEED_KEY) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'SEED_KEY not set in env' }) };
    }
    if (key !== process.env.SEED_KEY) {
      return { statusCode: 403, body: JSON.stringify({ ok: false, error: 'Invalid seed key' }) };
    }

    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing body' }) };
    }

    const payload = JSON.parse(event.body);

    const db = admin.firestore();
    const ref = db.collection('public_previews').doc('easy-street');

    await ref.set(
      {
        ...payload,
        slug: 'easy-street',
        updatedAt: new Date().toISOString(),
        createdAt: payload.createdAt || new Date().toISOString(),
        viewCount: payload.viewCount || 0,
      },
      { merge: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, slug: 'easy-street' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message || 'Server error' }) };
  }
};
