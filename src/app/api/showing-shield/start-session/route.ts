import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSafetyProfile } from '@/lib/showingShield';

export async function POST(req: NextRequest) {
  try {
    const { agentId, agentName, agentEmail, agentPhone, propertyAddress, clientName, scheduledDuration } =
      await req.json();

    if (!agentId || !propertyAddress || !clientName || !scheduledDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const profile = await getSafetyProfile(agentId);
    const emergencyContacts = profile?.emergencyContacts || [];

    if (emergencyContacts.length === 0) {
      return NextResponse.json(
        { error: 'No emergency contacts configured. Please set up your safety profile first.' },
        { status: 400 }
      );
    }

    const sessionId = await createSession({
      agentId,
      agentName,
      agentEmail,
      agentPhone,
      propertyAddress,
      clientName,
      scheduledDuration,
      status: 'active',
      startedAt: new Date().toISOString(),
      emergencyContacts,
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (err: any) {
    console.error('Start session error:', err);
    return NextResponse.json({ error: err.message || 'Failed to start session' }, { status: 500 });
  }
}
