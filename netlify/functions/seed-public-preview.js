// netlify/functions/seed-public-preview.js
const admin = require("firebase-admin");

function initFirebaseAdmin() {
  if (admin.apps.length) return;

  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (svcJson) {
    const serviceAccount = JSON.parse(svcJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return;
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    return;
  }

  throw new Error(
    "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON (recommended) or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
  );
}

exports.handler = async (event) => {
  try {
    const auth = event.headers["x-seed-key"] || event.headers["X-Seed-Key"];
    if (!process.env.SEED_KEY || auth !== process.env.SEED_KEY) {
      return { statusCode: 401, body: "Unauthorized" };
    }

    initFirebaseAdmin();
    const db = admin.firestore();

    const preview = JSON.parse(event.body || "{}");
    if (!preview.slug) preview.slug = "easy-street";

    const docId = preview.slug;
    await db.collection("public_previews").doc(docId).set(
      {
        ...preview,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, path: `public_previews/${docId}` }),
    };
  } catch (e) {
    return { statusCode: 500, body: e.message || "Seed failed" };
  }
};
