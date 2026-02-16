import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white overflow-hidden flex items-center pt-20">
        <div className="absolute inset-0 opacity-20">
          <img alt="Agent at desk" className="w-full h-full object-cover" loading="lazy" src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Your Photos Get the Click.</h1>
              <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-200">Your Words Get the Showing.</h2>
              <p className="text-lg text-gray-300 mb-10 leading-relaxed">A listing description isn't "extra" — it's the copy that follows your property everywhere: MLS, Zillow, Realtor.com, Facebook, email blasts, and your agent website.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/rate-my-listing" className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg text-center">Rate My Listing</Link>
                <Link href="/get-why-copy-matters" className="border-2 border-[#c9a227] hover:bg-[#c9a227]/10 text-white px-8 py-4 rounded-lg font-semibold text-lg text-center">Why Copy Matters</Link>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
              <p className="text-gray-300 text-sm uppercase tracking-widest mb-4">Sound Familiar?</p>
              <p className="text-2xl md:text-3xl italic font-light mb-6 text-white">"I've been staring at this listing description for an hour..."</p>
              <p className="text-gray-300">— Every agent at 11pm before a listing goes live</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#1a2b4a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl italic text-white mb-4">"A real estate listing description tells a home's story and provides the buyer with insight about what it's like to live there."</p>
          <p className="text-[#c9a227] font-semibold">— Tyler Nicely, Realtor</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#c9a227] text-lg font-semibold uppercase tracking-widest mb-4">There's a Better Way</p>
            <h2 className="text-5xl md:text-6xl font-bold text-[#1a2b4a] mb-6">MLS Listing Descriptions That <span className="text-[#c9a227]">Sell</span></h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Residential. Commercial. Vacant Land. We write professional real estate copy for agents who want to close faster.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Paste Your Listing</h3>
              <p className="text-gray-600">Submit your listing description and get instant analysis.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">AI Analysis & Rewrite</h3>
              <p className="text-gray-600">Get your grade, polished rewrite, and full report instantly.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Delivered Instantly</h3>
              <p className="text-gray-600">Report sent to your email immediately. Paste-ready copy included.</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Try Rate My Listing Now</Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-6 text-center">See How It Works</h2>
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full aspect-video" frameBorder="0" height="450" loading="lazy" src="https://www.youtube.com/embed/9X_XMIAsjBo?rel=0" title="GetReadyToPost - Step Up Your Listing Game in 2026" width="100%"></iframe>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-4xl md:text-5xl font-bold text-[#1a2b4a] mb-4">87%</p>
          <p className="text-xl text-gray-600 mb-2">of buyers consider listing descriptions "extremely important or very important"</p>
          <p className="text-sm text-gray-500">— Redfin/Grammarly Study</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1a2b4a] mb-6 text-center">Simple, Instant Pricing</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">One flat rate. Any listing length. Instant results.</p>
          <div className="max-w-md mx-auto bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] rounded-2xl p-8 text-white text-center shadow-2xl">
            <p className="text-6xl font-bold text-[#c9a227] mb-4">$19.99</p>
            <p className="text-2xl mb-6">Per Listing Analysis</p>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-[#c9a227]">✓</span>
                <span>Instant AI-powered grade (6 categories)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c9a227]">✓</span>
                <span>Professional rewrite (MLS-ready)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c9a227]">✓</span>
                <span>Full report with recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c9a227]">✓</span>
                <span>Safe Paste & Pretty versions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c9a227]">✓</span>
                <span>Delivered instantly to your email</span>
              </li>
            </ul>
            <Link href="/rate-my-listing" className="block bg-[#c9a227] hover:bg-[#e8c547] text-white py-4 rounded-lg font-bold text-lg transition">Get Started Now</Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#1a2b4a] to-[#2d4a7c] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl italic text-gray-300 mb-6">"You're not just selling a house—you're selling a home and the experience of living in it."</p>
          <p className="text-[#c9a227] font-semibold mb-12">— Perry Real Estate College</p>
          <h2 className="text-4xl font-bold mb-6">Ready to Write Better MLS Listings?</h2>
          <p className="text-xl text-gray-200 mb-8">Join agents and brokers who are selling faster with polished, buyer-focused descriptions.</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Try Rate My Listing</Link>
        </div>
      </section>
    </main>
  );
}
