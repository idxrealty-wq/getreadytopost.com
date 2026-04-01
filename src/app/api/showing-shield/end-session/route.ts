import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection('showingSessions').doc(sessionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await ref.update({
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, completedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('End session error:', err);
    return NextResponse.json({ error: err.message || 'Failed to end session' }, { status: 500 });
  }
}

