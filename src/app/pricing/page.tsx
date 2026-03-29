import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - GetReadyToPost',
  description:
    'Flexible pricing for real estate agents. Monthly memberships, annual plans, verification badges, and one-time credits. Start free or upgrade anytime.',
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

        {/* Membership Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Membership Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Monthly */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/4efc6b79-44b1-482f-b9b1-4c1c07aac7bd/Monthly_membership_tier.png" alt="Monthly Membership" className="w-full rounded-xl mb-4" />
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

            {/* Semi-Annual */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/c0a3ab94-9392-4636-b162-49c20d62ba6d/image.png" alt="Semi-Annual Membership" className="w-full rounded-xl mb-4" />
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

            {/* Annual - Best Value */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#c9a227] p-8 relative flex flex-col transform md:scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#c9a227] text-[#1a2b4a] px-4 py-1 rounded-full font-bold text-sm">
                BEST VALUE
              </div>
              <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/7bab95e6-60a4-4213-9371-3e11ef3995c0/Annual_membership_tier.png" alt="Annual Membership" className="w-full rounded-xl mb-4" />
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

            {/* Elite Annual */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/23e4afde-f5cd-4a9c-91dd-dcb1c2a89e63/Elite_Annual_membership_tier.png" alt="Elite Annual Membership" className="w-full rounded-xl mb-4" />
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
        {/* One-Time Purchases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">One-Time Purchases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Rate My Listing */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <img
                src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/e534edfe-c16a-4fa3-b549-0f3bdec9bcee/image.png?w=1024&h=1024"
                alt="Rate My Listing - Professional MLS Description Rewrite"
                className="w-full rounded-xl mb-4"
              />
              <h3 className="text-2xl font-bold text-white mb-2">Rate My Listing</h3>
              <p className="text-gray-400 text-sm mb-6">Professional MLS Rewrite</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">20 Credits</span>
                <p className="text-gray-300 text-sm mt-2">$19.99 one-time</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> AI-powered listing grade</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Professional description rewrite</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Actionable recommendations</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Uses 20 credits</li>
              </ul>
              <Link
                href="/checkout?pkg=single"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Buy Now
              </Link>
            </div>

            {/* Single Credit */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <img
                src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/b65fa186-00db-43cf-ad8a-b8f19f91a41c/image.png"
                alt="Single Credit"
                className="w-full rounded-xl mb-4"
              />
              <h3 className="text-2xl font-bold text-white mb-2">Single Credit</h3>
              <p className="text-gray-400 text-sm mb-6">Site-wide credit currency</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$1</span>
                <p className="text-gray-300 text-sm mt-2">1 credit</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> $1 = 1 credit</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Use across the site</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Rate My Listing = 20 credits</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Property pulls vary by plan</li>
              </ul>
              <Link
                href="/checkout?pkg=single"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Buy Now
              </Link>
            </div>

            {/* 5-Pack */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <img
                src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/e882dfc4-ae35-4d83-9018-05cd63c389d8/image.png"
                alt="5-Pack"
                className="w-full rounded-xl mb-4"
              />
              <h3 className="text-2xl font-bold text-white mb-2">5-Pack</h3>
              <p className="text-gray-400 text-sm mb-6">Bulk credit option</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$85</span>
                <p className="text-gray-300 text-sm mt-2">5 credits</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> 5 credits total</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Use across the site</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Never expires</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Good for add-on usage</li>
              </ul>
              <Link
                href="/checkout?pkg=5pack"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Buy Now
              </Link>
            </div>

            {/* Vault Only */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <img
                src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/36b3584a-cf2a-40d9-9caf-1338472e8fa4/image.png"
                alt="Vault Only"
                className="w-full rounded-xl mb-4"
              />
              <h3 className="text-2xl font-bold text-white mb-2">Vault Only</h3>
              <p className="text-gray-400 text-sm mb-6">Organization tool</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$49.95</span>
                <p className="text-gray-300 text-sm mt-2">/year</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Agent Vault only</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Save &amp; organize</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> No credits included</li>
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

        {/* Verification Badges */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-3 text-center">Verification Badges</h2>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Build trust with buyers, sellers, and fellow agents. Each badge is reviewed and issued by the GRTP team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">GRTP Agent Verified</h3>
              <p className="text-gray-400 text-sm mb-4">Annual badge — reviewed within 48 hrs</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$19.99</span>
                <p className="text-gray-300 text-sm mt-1">/year</p>
              </div>
              <ul className="space-y-2 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Badge on all reports</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Public verification record</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Phone verification required</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Annual renewal</li>
              </ul>
              <a
                href="https://square.link/u/o0gy2tby"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Get Verified
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Company Verified</h3>
              <p className="text-gray-400 text-sm mb-4">Requires Agent Verified first</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$10</span>
                <p className="text-gray-300 text-sm mt-1">/year</p>
              </div>
              <ul className="space-y-2 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Brokerage badge</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Co-branded reports</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Team credibility signal</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Annual renewal</li>
              </ul>
              <a
                href="https://square.link/u/Z8le2Ijg"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Get Company Badge
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Verify My Agent</h3>
              <p className="text-gray-400 text-sm mb-4">For buyers &amp; sellers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$10</span>
                <p className="text-gray-300 text-sm mt-1">one-time</p>
              </div>
              <ul className="space-y-2 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Confirm agent credentials</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Peace of mind</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Before signing agreements</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> One-time payment</li>
              </ul>
              <a
                href="https://square.link/u/X74D5bgW"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Verify My Agent
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Verified Buyer / Seller</h3>
              <p className="text-gray-400 text-sm mb-4">Show you are serious</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$10</span>
                <p className="text-gray-300 text-sm mt-1">one-time</p>
              
              </div>
              <ul className="space-y-2 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Vetted participant status</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Signal to agents</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Transaction credibility</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> One-time payment</li>
              </ul>
              <a
                href="https://square.link/u/xe0oMnV6"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Get Verified
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Reverification</h3>
              <p className="text-gray-400 text-sm mb-4">Keep your badge active</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#c9a227]">$10</span>
                <p className="text-gray-300 text-sm mt-1">/year</p>
              </div>
              <ul className="space-y-2 mb-8 text-gray-200 text-sm flex-grow">
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Annual renewal</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Maintain badge status</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Uninterrupted trust signal</li>
                <li className="flex gap-2"><span className="text-[#c9a227]">✓</span> Required every 12 months</li>
              </ul>
              <a
                href="https://square.link/u/XjhkSbC3"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold text-center transition"
              >
                Renew Badge
              </a>
            </div>

          </div>
        </div>

        {/* What's Included */}
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

        {/* Questions */}
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
