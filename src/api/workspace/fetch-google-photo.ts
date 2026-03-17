// src/api/workspace/fetch-google-photo.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const GOOGLE_STREET_VIEW_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { listingId, unlockMethod } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listingId' },
        { status: 400 }
      );
    }

    // Get listing from Firestore
    const listingRef = doc(db, 'listings', listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listingData = listingSnap.data() as any;

    // Check if photo already unlocked
    if (listingData.googlePhoto?.downloadURL) {
      return NextResponse.json(
        { googlePhoto: listingData.googlePhoto },
        { status: 200 }
      );
    }

    // Extract address for Street View
    const address = listingData.address || '';
    if (!address) {
      return NextResponse.json(
        { error: 'No address found in listing' },
        { status: 400 }
      );
    }

    // Fetch Street View Static Image
    const encodedAddress = encodeURIComponent(address);
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodedAddress}&key=${GOOGLE_STREET_VIEW_API_KEY}`;

    const svResponse = await fetch(streetViewUrl);
    if (!svResponse.ok) {
      throw new Error('Failed to fetch Street View image');
    }

    // Convert image to base64 or upload to Firebase Storage
    const imageBuffer = await svResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    // For now, we'll store the data URL. In production, upload to Firebase Storage.
    const googlePhoto = {
      downloadURL: dataUrl,
      source: 'streetview' as const,
      unlockedAt: new Date().toISOString(),
      unlockedBy: unlockMethod || 'credit',
      paymentMethod: unlockMethod === 'payment' ? 'square' : undefined,
    };

    // Save to Firestore
    await updateDoc(listingRef, { googlePhoto });

    return NextResponse.json(
      { googlePhoto },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[fetch-google-photo] error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
