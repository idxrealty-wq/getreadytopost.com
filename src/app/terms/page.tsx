import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-black/45 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-200 mb-8">Last updated: February 2026</p>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Service Description</h2>
              <p className="text-gray-100">GetReadyToPost provides professional listing rewrite services for real estate professionals and property owners.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Turnaround Times</h2>
              <p className="text-gray-100">Standard rewrites are delivered within 24 hours. Rush service (same-day) is available for an additional fee.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Revisions</h2>
              <p className="text-gray-100">One free revision is included with each order. Additional revisions may incur additional charges.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Payment Terms</h2>
              <p className="text-gray-100">Payment is due upon order submission. We accept major credit cards and digital payment methods.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Liability</h2>
              <p className="text-gray-100">While we strive for accuracy and MLS compliance, the client is responsible for final review and verification of all content before publication.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
              <p className="text-gray-100">Questions about these terms? Contact us at support@getreadytopost.com</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">â† Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
