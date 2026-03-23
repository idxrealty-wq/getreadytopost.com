import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { DEFAULT_CATEGORIES } from '@/types/vendor';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();

    // Check if categories already exist
    const categoriesSnapshot = await adminDb.collection('categories').limit(1).get();
    if (!categoriesSnapshot.empty) {
      return NextResponse.json(
        { message: 'Categories already initialized' },
        { status: 200 }
      );
    }

    const now = new Date();
    const batch = adminDb.batch();

    // Seed categories
    DEFAULT_CATEGORIES.forEach((category) => {
      const docRef = adminDb.collection('categories').doc();
      batch.set(docRef, {
        ...category,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Seed markets
    const defaultMarkets = [
      { name: 'National', type: 'national', isActive: true },
      { name: 'Florida', type: 'state', state: 'Florida', isActive: true },
    ];

    defaultMarkets.forEach((market) => {
      const docRef = adminDb.collection('markets').doc();
      batch.set(docRef, {
        ...market,
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();

    return NextResponse.json(
      {
        success: true,
        message: '✓ Vendor data seeded successfully',
        categoriesCount: DEFAULT_CATEGORIES.length,
        marketsCount: defaultMarkets.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
