"use client";

export default function UploadPage() {
  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit Your Listing</h1>
          <p className="text-xl text-gray-300">Instant analysis and rewrite for just $19.99</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-white/10 rounded-2xl p-12 border border-white/20 mb-12">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-white mb-8">We've Upgraded!</h2>
            <p className="text-gray-600 text-lg mb-4">Our process is now fully automated. Paste your listing into Rate My Listing and get your grade, rewrite, and full report instantly — for just $19.99.</p>
            <button onClick={() => document.getElementById("listing-form")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-xl font-bold text-lg cursor-pointer border-none">Go to Rate My Listing →</button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
        <div id="listing-form" className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Submit Your Listing</h2>
          <div className="bg-white rounded-2xl p-8 md:p-12">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email *</label>
                <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">Property Details *</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Address" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                  <input type="text" placeholder="City" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                  <input type="text" placeholder="State (FL)" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                  <input type="text" placeholder="Zip" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                  <input type="number" placeholder="Beds" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                  <input type="number" placeholder="Baths" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                  <input type="number" placeholder="Sqft" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                  <input type="number" placeholder="Year Built" className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Listing *</label>
                <textarea placeholder="Paste listing here..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a227] h-48 resize-none"></textarea>
                <p className="text-red-500 text-sm mt-2">0 words</p>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-[#c9a227] to-[#e8c547] text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition">🎯 Continue</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
