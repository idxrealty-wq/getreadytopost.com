import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // TODO: Replace with actual Firestore read
    // For now, return 0 to confirm endpoint works
    return NextResponse.json({ balance: 0 });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json({ error: 'Failed to fetch balance', details: String(error) }, { status: 500 });
  }
}
