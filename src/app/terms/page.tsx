import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="pt-20">
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-300">Last updated: February 2026</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 prose prose-lg">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Service Description</h2>
          <p className="text-gray-700 mb-4">GetReadyToPost provides professional listing rewrite services for real estate professionals and property owners.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Turnaround Times</h2>
          <p className="text-gray-700 mb-4">Standard rewrites are delivered within 24 hours. Rush service (same-day) is available for an additional fee.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Revisions</h2>
          <p className="text-gray-700 mb-4">One free revision is included with each order. Additional revisions may incur additional charges.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Payment Terms</h2>
          <p className="text-gray-700 mb-4">Payment is due upon order submission. We accept major credit cards and digital payment methods.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Liability</h2>
          <p className="text-gray-700 mb-4">While we strive for accuracy and MLS compliance, the client is responsible for final review and verification of all content before publication.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Contact</h2>
          <p className="text-gray-700 mb-4">Questions about these terms? Contact us at support@getreadytopost.com</p>
        </div>
      </section>

      <section className="py-8 bg-[#faf8f5] text-center">
        <Link href="/" className="text-[#1a2b4a] hover:text-[#c9a227] font-semibold">← Back to Home</Link>
      </section>
    </main>
  );
}
