import { NextRequest, NextResponse } from 'next/server';
import { gradeAndRewriteListing } from '@/lib/openai';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received');
  
  try {
    const body = await req.json();
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2));
    
    if (body.type === 'payment.updated' && body.data?.object?.payment?.status === 'COMPLETED') {
      const payment = body.data.object.payment;
      console.log('💳 Payment completed:', payment.id);
      
      const buyerEmail = payment.buyer_email_address;
      console.log('📧 Buyer email:', buyerEmail);
      
      if (!buyerEmail) {
        console.error('❌ No buyer email in payment');
        return NextResponse.json({ error: 'No buyer email' }, { status: 400 });
      }
      
      // Find the most recent pending submission for this email
      const submissionsRef = collection(db, 'submissions');
      const q = query(
        submissionsRef,
        where('email', '==', buyerEmail),
        where('status', '==', 'pending_payment')
      );
      
      console.log('🔍 Searching for submission with email:', buyerEmail);
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error('❌ No pending submission found for:', buyerEmail);
        return NextResponse.json({ error: 'No pending submission found' }, { status: 404 });
      }
      
      // Get the most recent submission (in case there are multiple)
      const submissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      submissions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const submission = submissions[0];
      
      console.log('✅ Submission found:', submission.id);
      
      const { email, listingText } = submission;

      console.log('🤖 Calling OpenAI...');
      const analysis = await gradeAndRewriteListing(listingText);
      console.log('✅ OpenAI analysis complete:', analysis.overall);

      console.log('💾 Updating Firebase...');
      await updateDoc(doc(db, 'submissions', submission.id), {
        analysis,
        paymentId: payment.id,
        amount: payment.amount_money.amount / 100,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      console.log('📧 Sending report email to:', email);
      await resend.emails.send({
        from: 'GetReadyToPost <onboarding@resend.dev>',
        to: email,
        subject: 'Your Listing Analysis is Ready! 🎉',
        html: generateReportEmail(analysis, email),
      });

      console.log('📧 Sending notification to Christopher');
      await resend.emails.send({
        from: 'GetReadyToPost <onboarding@resend.dev>',
        to: 'idxrealty@gmail.com',
        subject: 'New Rate My Listing Submission - PAID',
        html: `
          <h2>New Paid Submission</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Amount:</strong> $${payment.amount_money.amount / 100}</p>
          <p><strong>Payment ID:</strong> ${payment.id}</p>
          <p><strong>Grade:</strong> ${analysis.overall}</p>
          <p><strong>Firestore ID:</strong> ${submission.id}</p>
          <hr>
          <h3>Listing Submitted:</h3>
          <p>${listingText.substring(0, 200)}...</p>
        `,
      });

      console.log('✅ Webhook processing complete');
      return NextResponse.json({ success: true });
    }

    console.log('ℹ️ Event type not processed:', body.type);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

function generateReportEmail(analysis: any, email: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a2b4a 0%, #2d4a7c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .grade { font-size: 48px; font-weight: bold; color: #c9a227; margin: 10px 0; }
        .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .category { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #c9a227; border-radius: 4px; }
        .category-title { font-weight: bold; color: #1a2b4a; margin-bottom: 5px; }
        .rewrite { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4caf50; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .cta { background: #c9a227; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Your Listing Analysis</h1>
        <div class="grade">${analysis.overall}</div>
        <p>Overall Grade</p>
      </div>

      <div class="section">
        <h2>📊 Category Breakdown</h2>
        ${Object.entries(analysis.categories).map(([key, val]: [string, any]) => `
          <div class="category">
            <div class="category-title">${key.charAt(0).toUpperCase() + key.slice(1)}: ${val.grade}</div>
            <p style="margin: 5px 0 0 0; color: #555;">${val.feedback}</p>
          </div>
        `).join('')}
      </div>

      <div class="rewrite">
        <h2 style="color: #2e7d32; margin-top: 0;">✨ Professional Rewrite (MLS-Ready)</h2>
        <p style="line-height: 1.8;">${analysis.rewrite}</p>
      </div>

      <div class="section">
        <h2>💡 Key Recommendations</h2>
        <ul style="line-height: 1.8;">
          ${analysis.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://getreadytopost.netlify.app/rate-my-listing" class="cta">Analyze Another Listing</a>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} GetReadyToPost. All rights reserved.</p>
        <p><a href="https://getreadytopost.netlify.app" style="color: #c9a227;">getreadytopost.netlify.app</a></p>
        <p style="margin-top: 10px; font-size: 11px; color: #999;">This report was sent to ${email}</p>
      </div>
    </body>
    </html>
  `;
}
