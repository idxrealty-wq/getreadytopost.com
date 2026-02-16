import Link from 'next/link';

export default function SEOPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="bg-[#c9a227] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 inline-block">LISTING SEO</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SEO-Optimized Listings</h1>
          <p className="text-xl text-gray-300">Get found on Google, Zillow, and Realtor.com with keyword-rich descriptions</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1a2b4a] mb-6">Why SEO Matters for Listings</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700"><strong>Higher visibility:</strong> Buyers search by neighborhood, features, and property type</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700"><strong>More clicks:</strong> Well-written descriptions rank higher on Zillow and Realtor.com</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700"><strong>Faster sales:</strong> Listings with clear, keyword-rich copy get more qualified leads</p>
                </div>
              </div>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-8">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-4">SEO Checklist</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#c9a227] font-bold">✓</span>
                  <span>Neighborhood name in first sentence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c9a227] font-bold">✓</span>
                  <span>Key features (bedrooms, baths, square footage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c9a227] font-bold">✓</span>
                  <span>Lifestyle keywords (waterfront, golf course, downtown)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c9a227] font-bold">✓</span>
                  <span>Natural language (no keyword stuffing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c9a227] font-bold">✓</span>
                  <span>140-160 words for optimal length</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-8 text-center">SEO Example</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">❌ NO SEO</span>
              </div>
              <p className="text-gray-700">Beautiful home with lots of upgrades. Great location near everything. Must see!</p>
              <div className="mt-4 text-sm text-red-600">
                <strong>Missing:</strong> Neighborhood, features, keywords
              </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">✓ SEO OPTIMIZED</span>
              </div>
              <p className="text-gray-700">Discover this 3-bedroom, 2-bath home in the heart of downtown Orlando, offering modern updates and walkable access to dining, shopping, and entertainment. The open-concept living area flows into a chef's kitchen with granite countertops and stainless appliances.</p>
              <div className="mt-4 text-sm text-green-600">
                <strong>Includes:</strong> Location, beds/baths, lifestyle keywords, features
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a2b4a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Get SEO-Ready Listings</h2>
          <p className="text-gray-300 mb-8">Every rewrite includes SEO optimization by default — no extra charge</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload" className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block">Submit Your Listing</Link>
            <Link href="/pricing" className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block">View Pricing</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
