import Link from 'next/link';

export const metadata = {
  title: 'Closing Cost Calculator (Orange County, FL) | GetReadyToPost',
  description: 'Accurate closing cost calculator for Orange County, Florida. Buyer cash-to-close and seller net proceeds with itemized breakdown.',
  openGraph: {
    title: 'Closing Cost Calculator (Orange County, FL) | GetReadyToPost',
    description: 'Buyer cash-to-close + seller net proceeds. Orange County, FL.',
    url: 'https://getreadytopost.com/closing-costs',
    type: 'website',
  },
};

export default function ClosingCostsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Closing Cost Calculator</h1>
          <p className="text-xl text-gray-200 mb-8">
            Orange County, Florida — buyer cash-to-close + seller net proceeds.
          </p>
          <p className="text-gray-300 mb-10">
            We’re building the full calculator now (exact title insurance tiers, recording fees, doc stamps, and property tax proration).
          </p>
          <Link
            href="/contact-broker"
            className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-10 py-4 rounded-lg font-bold text-lg transition shadow-lg"
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </main>
  );
}
