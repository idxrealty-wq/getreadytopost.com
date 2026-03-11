const admin = require('firebase-admin');

function initAdmin() {
  if (admin.apps.length) return;
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : null;
  if (!svc) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON env var.');
  admin.initializeApp({
    credential: admin.credential.cert(svc),
  });
}

exports.handler = async (event) => {
  try {
    initAdmin();
    const key = event.queryStringParameters?.key || event.headers?.['x-seed-key'];
    if (!process.env.SEED_KEY || key !== process.env.SEED_KEY) {
      return { statusCode: 403, body: JSON.stringify({ ok: false, error: 'Invalid key' }) };
    }

    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing body' }) };
    }

    const { listingId, slug } = JSON.parse(event.body);
    if (!listingId || !slug) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing listingId or slug' }) };
    }

    const db = admin.firestore();
    const listingRef = db.collection('listings').doc(listingId);
    const listingSnap = await listingRef.get();

    if (!listingSnap.exists()) {
      return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'Listing not found' }) };
    }

    const listing = listingSnap.data();
    const previewRef = db.collection('public_previews').doc(slug);

    // Copy key fields from listing to preview
    const previewData = {
      address1: listing.address || '',
      city: listing.propertyData?.city || '',
      state: listing.propertyData?.state || '',
      zip: listing.propertyData?.zip || '',
      latitude: String(listing.propertyData?.latitude || listing.latitude || ''),
      longitude: String(listing.propertyData?.longitude || listing.longitude || ''),
      schools: listing.propertyData?.schools || [],
      sale_history: listing.propertyData?.sale_history || [],
      photos: listing.photos || [],
      documents: listing.documents || [],
      publishedFromListingId: listingId,
      publishedAt: new Date().toISOString(),
      slug,
    };

    await previewRef.set(previewData, { merge: true });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        slug,
        previewUrl: `https://getreadytopost.com/preview/${slug}`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message || 'Server error' }),
    };
  }
};
