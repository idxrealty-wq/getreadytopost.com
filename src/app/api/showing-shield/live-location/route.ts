import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { userId, location } = await req.json();
    if (!userId || !location) {
      return NextResponse.json({ error: 'Missing userId or location' }, { status: 400 });
    }
    const db = getAdminDb();
    await db.collection('liveLocations').doc(userId).set({
      userId,
      lat: location.lat,
      lng: location.lng,
      address: location.address,
      mapsLink: location.mapsLink,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const db = getAdminDb();
    const doc = await db.collection('liveLocations').doc(userId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'No location found' }, { status: 404 });
    }
    return NextResponse.json(doc.data());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

