import Link from 'next/link';

export default function FAQPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">Everything you need to know about GetReadyToPost</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">💰 Pricing & Turnaround</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">How much does a listing rewrite cost?</h3>
              <p className="text-gray-600">Pricing starts at $79 for 0-400 words. 401-800 words is $129, and 801-1200 words is $179. Rush and Immediate options add $50-$100. <Link href="/pricing" className="text-[#c9a227] font-semibold underline hover:text-[#1a2b4a]">View full pricing</Link>.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">What are the turnaround options?</h3>
              <p className="text-gray-600">Standard is 24 hours ($79+), Rush is same day if ordered by 12 PM ET ($129+), and Immediate is within 3 hours any time ($179+). All include the same quality work.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">How fast can I get my listing back?</h3>
              <p className="text-gray-600">Our fastest option is Immediate — within 3 hours, any time of day. Rush is same day (order by 12 PM ET). Standard is within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">📦 What's Included</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">What's included with every rewrite?</h3>
              <p className="text-gray-600">Every order includes: MLS-ready rewrite, Safe Paste version (plain text), Pretty version (formatted), Quality Checklist showing what we improved, and 1 free revision within 24 hours.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">Do I get a revision?</h3>
              <p className="text-gray-600">Yes! Every order includes 1 free revision. Just reply to your delivery email within 24 hours with your feedback and we'll update it.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">What's the Safe Paste version?</h3>
              <p className="text-gray-600">It's a plain text version with no special formatting — ready to paste directly into any MLS system, Zillow, Realtor.com, or CRM without formatting issues.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">What's the Pretty version?</h3>
              <p className="text-gray-600">It's a nicely formatted version with proper spacing and structure — perfect for emails, PDFs, flyers, and marketing materials.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">📤 How to Submit</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">How do I submit a listing?</h3>
              <p className="text-gray-600">Go to <Link href="/upload" className="text-[#c9a227] font-semibold underline hover:text-[#1a2b4a]">our upload page</Link>, fill in your details and property address, paste your current listing description, select your turnaround time, and pay securely. We'll deliver to your email!</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">What information do I need to submit?</h3>
              <p className="text-gray-600">Your name, email, property address, and your current listing description (or rough notes). The more details you include, the better your rewrite will be!</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">I submitted the wrong information. What do I do?</h3>
              <p className="text-gray-600">No problem! Email christopher@getreadytopost.com with your order details and the correction. We'll fix it before we start writing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">🔄 Refunds & Support</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">What's your refund policy?</h3>
              <p className="text-gray-600">We include 1 free revision with every order. If you're not satisfied after your revision, email christopher@getreadytopost.com and we'll make it right. We stand behind our work.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">How do I contact support?</h3>
              <p className="text-gray-600">Email christopher@getreadytopost.com — we typically respond within 24 hours. For broker inquiries, visit our <Link href="/contact-broker" className="text-[#c9a227] font-semibold underline hover:text-[#1a2b4a]">broker contact page</Link>.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a2b4a] text-lg mb-2">Can I get a refund?</h3>
              <p className="text-gray-600">We offer 1 free revision first. If you're still not satisfied after the revision, email christopher@getreadytopost.com and we'll work it out.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#1a2b4a] to-[#2d4a7c] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl text-gray-200 mb-8">We're here to help. Reach out anytime.</p>
          <a href="mailto:christopher@getreadytopost.com" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Contact Support</a>
        </div>
      </section>
    </main>
  );
}
