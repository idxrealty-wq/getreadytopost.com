import { NextRequest, NextResponse } from 'next/server';
import { gradeAndRewriteListing } from '@/lib/openai';
import { createPayment } from '@/lib/square';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, listingText, paymentSourceId } = await req.json();

    // 1. Process payment
    const payment = await createPayment(19.99, paymentSourceId, email);
    if (payment?.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment failed' }, { status: 400 });
    }

    // 2. Grade and rewrite listing with AI
    const analysis = await gradeAndRewriteListing(listingText);

    // 3. Store in Firebase
    const submissionRef = await addDoc(collection(db, 'submissions'), {
      email,
      listingText,
      analysis,
      paymentId: payment.id,
      createdAt: new Date().toISOString(),
    });

    // 4. Send report email to user
    await resend.emails.send({
      from: 'GetReadyToPost <onboarding@resend.dev>',
      to: email,
      subject: 'Your Listing Analysis is Ready!',
      html: generateReportEmail(analysis),
    });

    // 5. Send notification to Christopher
    await resend.emails.send({
      from: 'GetReadyToPost <onboarding@resend.dev>',
      to: 'idxrealty@gmail.com',
      subject: 'New Rate My Listing Submission',
      html: `<p>New submission from ${email}</p><p>Payment ID: ${payment.id}</p><p>Firestore ID: ${submissionRef.id}</p>`,
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateReportEmail(analysis: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a2b4a 0%, #2d4a7c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .grade { font-size: 48px; font-weight: bold; color: #c9a227; margin: 10px 0; }
        .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .category { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #c9a227; }
        .rewrite { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Listing Analysis</h1>
          <div class="grade">${analysis.overall}</div>
          <p>Overall Grade</p>
        </div>

        <div class="section">
          <h2>Category Breakdown</h2>
          ${Object.entries(analysis.categories).map(([key, val]: [string, any]) => `
            <div class="category">
              <strong>${key.charAt(0).toUpperCase() + key.slice(1)}: ${val.grade}</strong>
              <p>${val.feedback}</p>
            </div>
          `).join('')}
        </div>

        <div class="rewrite">
          <h2>✨ Professional Rewrite (MLS-Ready)</h2>
          <p>${analysis.rewrite}</p>
        </div>

        <div class="section">
          <h2>💡 Recommendations</h2>
          <ul>
            ${analysis.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} GetReadyToPost. All rights reserved.</p>
          <p><a href="https://getreadytopost.netlify.app">getreadytopost.netlify.app</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
