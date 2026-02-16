import Link from 'next/link';

export default function ExamplesPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Real Before & After Examples</h1>
          <p className="text-xl text-gray-300">See exactly how we transform listing descriptions</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-6">
            <span className="bg-[#c9a227]/10 text-[#c9a227] px-3 py-1 rounded-full text-sm font-semibold">Residential Lakefront</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-4 inline-block">BEFORE</span>
              <p className="text-gray-700">Beautiful lakefront home in a great neighborhood. 3 bedroom 2 bath with open floor plan and lots of updates. Big backyard and amazing views. Must see, won't last!</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mb-4 inline-block">AFTER</span>
              <p className="text-gray-700">Enjoy lakefront living in this 3-bedroom, 2-bath home with a comfortable layout and beautiful water views. The open living and dining areas create an easy flow for everyday life.</p>
              <p className="text-gray-700 mt-2">Conveniently located near shopping and dining. Schedule your showing today.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-6">
            <span className="bg-[#c9a227]/10 text-[#c9a227] px-3 py-1 rounded-full text-sm font-semibold">Vacant Land</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-4 inline-block">BEFORE</span>
              <p className="text-gray-700">Nice lot near the lake. Good location. Build your dream home. Close to town. Bring offers.</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mb-4 inline-block">AFTER</span>
              <p className="text-gray-700">Bring your plans and vision to this vacant homesite near the lake, offering an opportunity to build in a setting that supports everyday living and weekend escape.</p>
              <p className="text-gray-700 mt-2">Buyer to verify zoning, utilities, setbacks, and building requirements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a2b4a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Get Your Listing Analyzed</h2>
          <p className="text-gray-300 mb-8">Instant grade, rewrite, and full report — $19.99</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Rate My Listing</Link>
        </div>
      </section>
    </main>
  );
}
