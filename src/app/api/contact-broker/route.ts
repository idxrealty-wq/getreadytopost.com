import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brokerageName, contactName, email, phone, agentCount, message } = body;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'idxrealty@gmail.com',
      subject: `New Broker Inquiry from ${contactName} (${brokerageName})`,
      html: `
        <h2>New Broker Inquiry</h2>
        <p><strong>Brokerage:</strong> ${brokerageName}</p>
        <p><strong>Contact Name:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Agent Count:</strong> ${agentCount || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing broker inquiry:', error);
    return NextResponse.json({ error: 'Failed to send inquiry' }, { status: 500 });
  }
}
