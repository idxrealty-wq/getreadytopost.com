import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, listingId } = await req.json();

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Replace with actual Firestore deduction
    // For now, return success with newBalance = 0 to confirm endpoint works
    return NextResponse.json({ success: true, newBalance: 0 });
  } catch (error) {
    console.error('Deduct credits error:', error);
    return NextResponse.json({ error: 'Failed to deduct credit', details: String(error) }, { status: 500 });
  }
}
