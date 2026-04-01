import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { agentId, agentName, agentEmail, agentPhone, propertyAddress, clientName, scheduledDuration } =
      await req.json();

    if (!agentId || !propertyAddress || !clientName || !scheduledDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getAdminDb();

    // Get emergency contacts from profile
    const profileRef = db.collection('showingShieldProfiles').doc(agentId);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
      return NextResponse.json(
        { error: 'No emergency contacts configured. Please set up your safety profile first.' },
        { status: 400 }
      );
    }

    const profile = profileSnap.data();
    const emergencyContacts = profile?.emergencyContacts || [];

    if (emergencyContacts.length === 0) {
      return NextResponse.json(
        { error: 'No emergency contacts configured. Please set up your safety profile first.' },
        { status: 400 }
      );
    }

    const sessionRef = await db.collection('showingSessions').add({
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
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, sessionId: sessionRef.id });
  } catch (err: any) {
    console.error('Start session error:', err);
    return NextResponse.json({ error: err.message || 'Failed to start session' }, { status: 500 });
  }
}
