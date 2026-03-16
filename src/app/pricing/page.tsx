import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - GetReadyToPost',
  description:
    'Flexible pricing for real estate agents. Monthly memberships, annual plans, and one-time credits. Start free or upgrade anytime.',
  openGraph: {
    title: 'Pricing - GetReadyToPost',
    description:
      'Flexible pricing for real estate agents. Monthly memberships, annual plans, and one-time credits.',
    url: 'https://getreadytopost.com/pricing',
    type: 'website',
    image: '/og-pricing.png',
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <ShareButtons url="https://getreadytopost.com/pricing" title="Pricing - GetReadyToPost" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Flexible Pricing for Every Agent
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with one-time credits, upgrade to monthly, or commit to annual for the best value.
            All plans include Agent Vault and full workspace access where applicable.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Membership Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
              <p className="text-gray-400 text-sm mb-6">Cancel anytime</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$30</span>
                <p className="text-gray-300 text-sm mt-2">/month</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 30 credits/month</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Property pulls @ $3</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Agent Vault</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Workspace access</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Cancel anytime</li>
              </ul>
              <Link
                href="/checkout?pkg=monthly"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Semi-Annual</h3>
              <p className="text-gray-400 text-sm mb-6">Save 17%</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$495</span>
                <p className="text-gray-300 text-sm mt-2">/6 months</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 300 credits total</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Property pulls @ $2.50</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Agent Vault</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Workspace access</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 6-month term</li>
              </ul>
              <Link
                href="/checkout?pkg=semi-annual"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#c9a227] p-8 relative flex flex-col transform md:scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#c9a227] text-[#1a2b4a] px-4 py-1 rounded-full font-bold text-sm">
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Annual</h3>
              <p className="text-gray-400 text-sm mb-6">Save 24%</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$899</span>
                <p className="text-gray-300 text-sm mt-2">/year</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 450 credits/year</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Property pulls @ $1.75</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Agent Vault</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Workspace access</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Full year access</li>
              </ul>
              <Link
                href="/checkout?pkg=annual"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Elite Annual</h3>
              <p className="text-gray-400 text-sm mb-6">Premium tier</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$999</span>
                <p className="text-gray-300 text-sm mt-2">/year</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 899 credits/year</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Property pulls @ $1.00</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Agent Vault</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Workspace access</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Priority support</li>
              </ul>
              <Link
                href="/checkout?pkg=elite-annual"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">One-Time Purchases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Single Credit</h3>
              <p className="text-gray-400 text-sm mb-6">Try it out</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$19.99</span>
                <p className="text-gray-300 text-sm mt-2">1 credit</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 1 property pull</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Rate My Listing</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Never expires</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> No commitment</li>
              </ul>
              <Link
                href="/checkout?pkg=single"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Buy Now
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">5-Pack</h3>
              <p className="text-gray-400 text-sm mb-6">Save 15%</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$85</span>
                <p className="text-gray-300 text-sm mt-2">5 credits</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 5 property pulls</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> $17 per credit</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Never expires</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Most popular</li>
              </ul>
              <Link
                href="/checkout?pkg=5pack"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Buy Now
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Vault Only</h3>
              <p className="text-gray-400 text-sm mb-6">Organization tool</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$49.95</span>
                <p className="text-gray-300 text-sm mt-2">/year</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Agent Vault only</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Save & organize</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> No credits</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Annual renewal</li>
              </ul>
              <Link
                href="/checkout?pkg=vault-only"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What's Included in Every Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Rate My Listing</h3>
                <p className="text-gray-300">6-category grade (Clarity, Buyer Focus, Keywords, Length, Emotional Appeal, MLS Compliance)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Professional Rewrite</h3>
                <p className="text-gray-300">MLS-ready description optimized for buyers and search engines</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Actionable Recommendations</h3>
                <p className="text-gray-300">Specific steps to improve your listing and increase buyer interest</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">MLS Compliant</h3>
                <p className="text-gray-300">Fair Housing safe. NAR guidelines followed. No discriminatory language.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Instant Delivery</h3>
                <p className="text-gray-300">Grade and rewrite generated in seconds. Download or save immediately.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-2xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Buyer Psychology</h3>
                <p className="text-gray-300">Optimized for emotional appeal, clarity, and conversion</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Questions?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Check out our <Link href="/faq" className="text-[#c9a227] hover:text-[#e8c547] underline">FAQ</Link> or <Link href="/" className="text-[#c9a227] hover:text-[#e8c547] underline">contact us</Link>.
          </p>
        </div>
      </div>

      <ShareButtons url="https://getreadytopost.com/pricing" title="Pricing - GetReadyToPost" />
    </main>
  );
}
