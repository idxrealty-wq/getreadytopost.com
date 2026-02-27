import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - GetReadyToPost',
  description: 'Simple, transparent pricing for MLS listing rewrites. $19.99 per report or bulk packages starting at $85.',
  openGraph: {
    title: 'Pricing - GetReadyToPost',
    description: 'Simple, transparent pricing for MLS listing rewrites.',
    url: 'https://getreadytopost.com/pricing',
    type: 'website',
    image: '/og-pricing.png',
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <ShareButtons
        url="https://getreadytopost.com/pricing"
        title="Pricing - GetReadyToPost"
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Simple, Transparent Pricing</h1>
          <p className="text-2xl text-gray-200">Pay only for what you use. No subscriptions. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Pay Per Report */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 hover:bg-white/15 transition">
            <h3 className="text-2xl font-bold text-white mb-4">Pay Per Report</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-[#c9a227]">$19.99</span>
              <p className="text-gray-300 mt-2">per listing</p>
            </div>
            <ul className="space-y-3 mb-8 text-gray-200">
              <li>✓ 6-category grade</li>
              <li>✓ Professional rewrite</li>
              <li>✓ Actionable recommendations</li>
              <li>✓ Instant delivery</li>
              <li>✓ MLS compliant</li>
            </ul>
            <Link href="/rate-my-listing" className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold text-center transition">
              Grade My Listing
            </Link>
          </div>

          {/* 5-Pack */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-[#c9a227] p-8 relative transform md:scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#c9a227] text-[#1a2b4a] px-4 py-1 rounded-full font-bold text-sm">
              BEST VALUE
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">5-Pack</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-[#c9a227]">$85</span>
              <p className="text-gray-300 mt-2">$17 per listing</p>
            </div>
            <ul className="space-y-3 mb-8 text-gray-200">
              <li>✓ 5 reports</li>
              <li>✓ 15% savings</li>
              <li>✓ Use anytime</li>
              <li>✓ Never expires</li>
              <li>✓ Full features</li>
            </ul>
            <Link href="/checkout?package=5pack" className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold text-center transition">
              Buy 5-Pack
            </Link>
          </div>

          {/* Monthly */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 hover:bg-white/15 transition">
            <h3 className="text-2xl font-bold text-white mb-4">Monthly</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-[#c9a227]">$99</span>
              <p className="text-gray-300 mt-2">per month</p>
            </div>
            <ul className="space-y-3 mb-8 text-gray-200">
              <li>✓ Unlimited reports</li>
              <li>✓ Cancel anytime</li>
              <li>✓ Priority support</li>
              <li>✓ Full features</li>
              <li>✓ Best for teams</li>
            </ul>
            <Link href="/checkout?package=monthly" className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold text-center transition">
              Start Monthly
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* 6-Month */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 hover:bg-white/15 transition">
            <h3 className="text-2xl font-bold text-white mb-4">6-Month</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-[#c9a227]">$495</span>
              <p className="text-gray-300 mt-2">$82.50/month (17% off)</p>
            </div>
            <ul className="space-y-3 mb-8 text-gray-200">
              <li>✓ Unlimited reports</li>
              <li>✓ 6 months access</li>
              <li>✓ Priority support</li>
              <li>✓ Full features</li>
              <li>✓ Best for brokers</li>
            </ul>
            <Link href="/checkout?package=6month" className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold text-center transition">
              Start 6-Month
            </Link>
          </div>

          {/* Annual */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 hover:bg-white/15 transition">
            <h3 className="text-2xl font-bold text-white mb-4">Annual</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-[#c9a227]">$899</span>
              <p className="text-gray-300 mt-2">$74.92/month (24% off)</p>
            </div>
            <ul className="space-y-3 mb-8 text-gray-200">
              <li>✓ Unlimited reports</li>
              <li>✓ Full year access</li>
              <li>✓ Priority support</li>
              <li>✓ Full features</li>
              <li>✓ Best value</li>
            </ul>
            <Link href="/checkout?package=annual" className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold text-center transition">
              Start Annual
            </Link>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">6-Category Grade</h3>
                <p className="text-gray-300">Title, Description, Keywords, Emotion, CTA, Compliance</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Professional Rewrite</h3>
                <p className="text-gray-300">140–160 word optimized description</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Actionable Recommendations</h3>
                <p className="text-gray-300">Specific steps to improve your listing</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">MLS Compliant</h3>
                <p className="text-gray-300">Fair Housing safe. NAR guidelines followed.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Instant Delivery</h3>
                <p className="text-gray-300">Grade and rewrite in seconds</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Buyer Psychology</h3>
                <p className="text-gray-300">Optimized for search and readability</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Questions?</h2>
          <p className="text-xl text-gray-300 mb-8">Check out our <Link href="/faq" className="text-[#c9a227] hover:text-[#e8c547] underline">FAQ</Link> or <Link href="/contact-broker" className="text-[#c9a227] hover:text-[#e8c547] underline">contact us</Link>.</p>
        </div>
      </div>

      <ShareButtons
        url="https://getreadytopost.com/pricing"
        title="Pricing - GetReadyToPost"
      />
    </main>
  );
}
