import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getAdminDb } from '@/lib/firebaseAdmin';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, location, evidenceUrls } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection('showingSessions').doc(sessionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = snap.data()!;
    const now = new Date().toISOString();
    const mapsLink = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Location unavailable';

    const alertBody = [
      'SHOWING SHIELD - EMERGENCY ALERT',
      '',
      `Agent: ${session.agentName}`,
      `Phone: ${session.agentPhone}`,
      `Property: ${session.propertyAddress}`,
      `Client: ${session.clientName}`,
      `Time: ${new Date(now).toLocaleString('en-US', { timeZone: 'America/New_York' })}`,
      '',
      location ? `Location: ${location.address}` : 'Location: Not available',
      `Map: ${mapsLink}`,
    ].join('\n');

    const hasPhotos = Array.isArray(evidenceUrls) && evidenceUrls.length > 0;

    const smsSent: string[] = [];

    for (const contact of session.emergencyContacts || []) {
      if (contact.phone) {
        try {
          await client.messages.create({
            body: alertBody,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID!,
            to: contact.phone,
          });
          smsSent.push(contact.phone);

          if (hasPhotos) {
            for (let i = 0; i < evidenceUrls.length; i++) {
              try {
                await client.messages.create({
                  body: `Evidence photo ${i + 1}:`,
                  mediaUrl: [evidenceUrls[i]],
                  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID!,
                  to: contact.phone,
                });
              } catch {}
            }
          }
        } catch (smsErr) {
          console.error(`SMS failed to ${contact.phone}:`, smsErr);
        }
      }
    }

    await ref.update({
      status: 'alert_triggered',
      panicTriggeredAt: now,
      alertsSent: smsSent,
      evidenceUrls: evidenceUrls || [],
      ...(location && {
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
          mapsLink,
          capturedAt: now,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      alertsSent: smsSent.length,
      message: `Emergency alert sent to ${smsSent.length} contact(s).`,
    });
  } catch (err: any) {
    console.error('Panic route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send alert' }, { status: 500 });
  }
}
