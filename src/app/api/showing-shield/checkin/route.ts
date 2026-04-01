import { NextRequest, NextResponse } from 'next/server';
import { updateSession, getSessionById } from '@/lib/showingShield';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Session is not active' }, { status: 400 });
    }

    await updateSession(sessionId, {
      lastCheckinAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, checkedInAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('Check-in error:', err);
    return NextResponse.json({ error: err.message || 'Failed to check in' }, { status: 500 });
  }
}
