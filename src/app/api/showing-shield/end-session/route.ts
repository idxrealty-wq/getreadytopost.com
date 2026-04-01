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

    await updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, completedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('End session error:', err);
    return NextResponse.json({ error: err.message || 'Failed to end session' }, { status: 500 });
  }
}
