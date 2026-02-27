import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
      <section
        className="relative min-h-screen pt-32 pb-20 px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-white/95" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-black mb-6">Your Photos Get the Click.</h1>
          <p className="text-2xl text-black mb-8">Your Words Get the Showing.</p>
          <p className="text-lg text-black mb-12 max-w-2xl mx-auto">Most listing descriptions are invisible to buyers. Ours aren't. GetReadyToPost grades your listing across six critical categories and delivers a professional rewrite optimized for MLS, Fair Housing compliance, and buyer psychology.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rate-my-listing" className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg">Rate My Listing</Link>
            <Link href="/how-it-works" className="bg-[#c9a227] hover:bg-[#b8911f] text-black px-8 py-4 rounded-lg font-bold text-lg transition">See How It Works</Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-12 text-center">MLS Listing Descriptions That Sell</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-[#c9a227] mb-4">6-Category Grade</h3>
              <p className="text-black">We analyze your listing across Title, Description, Photos, Keywords, Compliance, and Impact. You get a clear A-F grade showing exactly where you stand and what to fix.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-[#c9a227] mb-4">Professional Rewrite</h3>
              <p className="text-black">Our AI doesn't just flag problems—it rewrites your entire listing description. Optimized for buyer psychology, MLS compliance, and Fair Housing standards. Ready to use immediately.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-[#c9a227] mb-4">Instant Results</h3>
              <p className="text-black">No waiting. No back-and-forth. Paste your listing, get your grade and rewrite in seconds. Download both Safe Paste and Pretty versions for any MLS system.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-12 text-center">See How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#c9a227] text-[#1a2b4a] rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-black mb-3">Paste Your Listing</h3>
              <p className="text-black">Copy and paste your current listing description. Works with any MLS or format. Takes 30 seconds.</p>
            </div>
            <div className="text-center">
              <div className="bg-[#c9a227] text-[#1a2b4a] rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-black mb-3">AI Analysis & Rewrite</h3>
              <p className="text-black">Our AI grades your listing and generates a professional rewrite. You see both the grade and the improved version instantly.</p>
            </div>
            <div className="text-center">
              <div className="bg-[#c9a227] text-[#1a2b4a] rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-black mb-3">Delivered Instantly</h3>
              <p className="text-black">Download your rewrite in Safe Paste or Pretty format. Copy directly into your MLS. No revisions needed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-12 text-center">Why Agents Trust GetReadyToPost</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-3xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">MLS Compliant</h3>
                <p className="text-black">Every rewrite follows Fair Housing guidelines, NAR standards, and MLS best practices. No compliance risk.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-3xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Proven to Convert</h3>
                <p className="text-black">Better descriptions = more showings. Our rewrites follow buyer psychology and listing optimization best practices.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-3xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Broker Program Available</h3>
                <p className="text-black">Teams and brokerages get priority support, bulk pricing, and 24-hour turnaround on rewrites.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[#c9a227] text-3xl font-bold flex-shrink-0">✓</div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Works With Every MLS</h3>
                <p className="text-black">Safe Paste and Pretty versions work with any MLS system. No formatting headaches.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-12 text-center">Simple, Instant Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
              <h3 className="text-2xl font-bold text-black mb-4">Single Rewrite</h3>
              <p className="text-4xl font-bold text-[#c9a227] mb-6">$19.99</p>
              <p className="text-black mb-8">One listing. Professional rewrite. Instant delivery. Perfect for testing.</p>
              <Link href="/our-deals" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold transition">Buy Now</Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-[#c9a227]/50 text-center ring-2 ring-[#c9a227]/30">
              <div className="text-[#c9a227] font-bold text-sm mb-4">BEST VALUE</div>
              <h3 className="text-2xl font-bold text-black mb-4">5-Pack</h3>
              <p className="text-4xl font-bold text-[#c9a227] mb-6">$85</p>
              <p className="text-black mb-8">Five listings at $17 each. Save $17.95 vs. single pricing. Bulk discount included.</p>
              <Link href="/our-deals" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold transition">Buy Now</Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
              <h3 className="text-2xl font-bold text-black mb-4">Agent Vault Pro</h3>
              <p className="text-4xl font-bold text-[#c9a227] mb-6">$99/mo</p>
              <p className="text-black mb-8">Unlimited rewrites, grading, and organization. Full workspace access. Cancel anytime.</p>
              <Link href="/our-deals" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold transition">Buy Now</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Ready to Write Better MLS Listings?</h2>
          <p className="text-xl text-black mb-8">Start with a free grade of your listing. See what buyers see. Get actionable feedback in seconds.</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg">Grade My Listing Free</Link>
        </div>
      </section>
    </main>
  );
}
