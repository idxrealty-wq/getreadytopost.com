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
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</span>
                <span className="text-red-600 text-sm font-medium">C- Draft</span>
              </div>
              <p className="text-gray-700">Beautiful lakefront home in a great neighborhood. 3 bedroom 2 bath with open floor plan and lots of updates. Big backyard and amazing views. Close to shopping and restaurants. Bring your boat and enjoy the lake life. Must see, won't last!</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">AFTER</span>
                <span className="text-green-600 text-sm font-medium">A+ Polished</span>
              </div>
              <p className="text-gray-700">Enjoy lakefront living in this 3-bedroom, 2-bath home with a comfortable layout and beautiful water views. The open living and dining areas create an easy flow for everyday life, while the backyard offers room to relax and entertain.</p>
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
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</span>
              </div>
              <p className="text-gray-700">Nice lot near the lake. Good location. Build your dream home. Close to town. Bring offers.</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">AFTER</span>
              </div>
              <p className="text-gray-700">Bring your plans and vision to this vacant homesite near the lake, offering an opportunity to build in a setting that supports everyday living and weekend escape.</p>
              <p className="text-gray-700 mt-2">Buyer to verify zoning, utilities, setbacks, and building requirements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a2b4a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Transformation?</h2>
          <p className="text-gray-300 mb-8">Submit your listing and get professional, MLS-ready copy back in 24 hours.</p>
          <Link href="/upload" className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block">Submit Your Listing</Link>
        </div>
      </section>
    </main>
  );
}
