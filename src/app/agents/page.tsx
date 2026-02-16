import Link from 'next/link';

export default function AgentsPage() {
  return (
    <main>
      <section className="relative min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white overflow-hidden flex items-center pt-20">
        <div className="absolute inset-0 opacity-20">
          <img alt="Agent at desk" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 w-full">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Listing Descriptions That Sell</h1>
          <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-200">For Real Estate Agents</h2>
          <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-2xl">Stop spending an hour on listing descriptions. Upload your draft, get polished, MLS-ready copy back in 24 hours — or faster.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/upload" className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg text-center">Submit Your Listing</Link>
            <Link href="/pricing" className="border-2 border-[#c9a227] hover:bg-[#c9a227]/10 text-white px-8 py-4 rounded-lg font-semibold text-lg text-center">View Pricing</Link>
          </div>
        </div>
      </section>

      <section className="py-10 bg-[#c9a227]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl italic text-[#1a2b4a] mb-3">"Instead of saying, 'four-bedroom home,' talk about relaxing in your beautiful backyard."</p>
          <p className="text-[#1a2b4a] font-semibold">— NC REALTORS® (advising on evoking a vision)</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1a2b4a] mb-16 text-center">See the Difference</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-[#faf8f5] to-white p-8 rounded-xl border-l-4 border-red-400">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">C- DRAFT</span>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed text-sm">Beautiful lakefront home with great views. Has a big kitchen and nice living room. The property is on the water and has a dock. Good for boating. Lots of trees around. Recently updated. Must see to believe. Call for more info.</p>
              <p className="text-gray-500 text-xs italic">Generic, vague, missing key details buyers need</p>
            </div>
            <div className="bg-gradient-to-br from-[#faf8f5] to-white p-8 rounded-xl border-l-4 border-green-400">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">A+ POLISHED</span>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed text-sm">Stunning lakefront residence with panoramic water views and direct dock access. Chef's kitchen features stainless steel appliances and granite countertops. Open-concept living spaces flood with natural light. Mature landscaping provides privacy while framing the water views. Recently renovated with modern systems. Ideal for boating enthusiasts and entertaining. Schedule your private showing today.</p>
              <p className="text-gray-500 text-xs italic">Specific, buyer-focused, compliance-ready, MLS-optimized</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <h3 className="text-lg font-bold text-[#1a2b4a] mb-3">What Changed</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-3"><span className="text-green-600 font-bold">✓</span><span>Replaced vague adjectives with specific details</span></li>
              <li className="flex gap-3"><span className="text-green-600 font-bold">✓</span><span>Added buyer motivations (boating, entertaining, privacy)</span></li>
              <li className="flex gap-3"><span className="text-green-600 font-bold">✓</span><span>Improved flow for MLS and web syndication</span></li>
              <li className="flex gap-3"><span className="text-green-600 font-bold">✓</span><span>Added professional CTA</span></li>
            </ul>
          </div>
          <div className="text-center">
            <Link href="/examples" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">View All Examples</Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1a2b4a] mb-16 text-center">Why Agents Choose GetReadyToPost</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Fast Turnaround</h3>
              <p className="text-gray-600">Standard 24 hours, Rush same-day, or Immediate within 3 hours.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">MLS-Ready</h3>
              <p className="text-gray-600">Plain text and formatted versions. Paste directly into your MLS.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Affordable</h3>
              <p className="text-gray-600">Pricing starts at $79. Add-ons like headlines and captions available.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Professional Copywriters</h3>
              <p className="text-gray-600">Real humans. Real expertise. Quality check on every listing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1a2b4a] mb-2">What do I need to submit?</h3>
              <p className="text-gray-600">Your name, email, property address, and current listing description (or rough notes).</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1a2b4a] mb-2">How fast will I get my listing back?</h3>
              <p className="text-gray-600">Standard is 24 hours, Rush is same day (order by 12 PM ET), Immediate is within 3 hours.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1a2b4a] mb-2">Is the copy MLS-compliant?</h3>
              <p className="text-gray-600">Yes! Every listing is checked for Fair Housing compliance and MLS guidelines.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1a2b4a] mb-2">What if I don't like the rewrite?</h3>
              <p className="text-gray-600">Every order includes 1 free revision. Just reply with your feedback within 24 hours.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1a2b4a] mb-2">Can you match my voice or brokerage style?</h3>
              <p className="text-gray-600">Absolutely! Just include style notes or examples when you submit.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1a2b4a] mb-2">Do you write for luxury properties?</h3>
              <p className="text-gray-600">Yes! We handle all property types: residential, luxury, commercial, vacant land, and more.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#1a2b4a] to-[#2d4a7c] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl italic text-gray-300 mb-4">"You're not just selling a house—you're selling a home and the experience of living in it."</p>
          <p className="text-[#c9a227] font-semibold mb-12">— Perry Real Estate College</p>
          <h2 className="text-4xl font-bold mb-6">Ready to Sell Faster?</h2>
          <p className="text-xl text-gray-200 mb-8">Join agents spending less time on descriptions and more time closing deals.</p>
          <Link href="/upload" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Submit Your First Listing</Link>
        </div>
      </section>
    </main>
  );
}
