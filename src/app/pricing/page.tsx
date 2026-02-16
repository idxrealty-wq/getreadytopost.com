import Link from 'next/link';

export default function PricingPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-20 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-300 mb-8">Pay per listing. No subscriptions. No hidden fees.</p>
        </div>
      </section>

      <section className="py-6 bg-[#faf8f5] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm"><span className="font-semibold text-[#1a2b4a]">Trusted by agents across Florida</span> — Professional MLS copy that sells homes faster</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Listing Rewrites</h2>
          
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1a2b4a] text-white">
                  <th className="px-4 py-4 text-left font-semibold rounded-tl-lg">Word Count</th>
                  <th className="px-4 py-4 text-center font-semibold">Standard<br/><span className="text-sm font-normal text-gray-300">24 hrs</span></th>
                  <th className="px-4 py-4 text-center font-semibold">Rush<br/><span className="text-sm font-normal text-gray-300">Same day*</span></th>
                  <th className="px-4 py-4 text-center font-semibold rounded-tr-lg bg-[#c9a227]">Immediate<br/><span className="text-sm font-normal">3 hrs</span></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-5 font-medium">0-400 words</td>
                  <td className="px-4 py-5 text-center"><span className="text-2xl font-bold">$79</span></td>
                  <td className="px-4 py-5 text-center"><span className="text-2xl font-bold">$129</span></td>
                  <td className="px-4 py-5 text-center bg-amber-50"><span className="text-2xl font-bold text-[#c9a227]">$179</span></td>
                </tr>
                <tr className="border-b border-gray-200 bg-[#faf8f5]">
                  <td className="px-4 py-5 font-medium">401-800 words</td>
                  <td className="px-4 py-5 text-center"><span className="text-2xl font-bold">$129</span></td>
                  <td className="px-4 py-5 text-center"><span className="text-2xl font-bold">$179</span></td>
                  <td className="px-4 py-5 text-center bg-amber-50"><span className="text-2xl font-bold text-[#c9a227]">$229</span></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-5 font-medium">801-1200 words</td>
                  <td className="px-4 py-5 text-center"><span className="text-2xl font-bold">$179</span></td>
                  <td className="px-4 py-5 text-center"><span className="text-2xl font-bold">$229</span></td>
                  <td className="px-4 py-5 text-center bg-amber-50"><span className="text-2xl font-bold text-[#c9a227]">$279</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            <div className="bg-[#faf8f5] rounded-xl p-5">
              <h3 className="font-bold text-[#1a2b4a] mb-4">0-400 words</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Standard</p>
                  <p className="text-lg font-bold text-[#1a2b4a]">$79</p>
                  <p className="text-xs text-gray-400">24 hrs</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rush</p>
                  <p className="text-lg font-bold text-[#1a2b4a]">$129</p>
                  <p className="text-xs text-gray-400">Same day*</p>
                </div>
                <div className="bg-amber-100 rounded-lg py-1">
                  <p className="text-xs text-[#c9a227]">Immediate</p>
                  <p className="text-lg font-bold text-[#c9a227]">$179</p>
                  <p className="text-xs text-gray-400">3 hrs</p>
                </div>
              </div>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-5">
              <h3 className="font-bold text-[#1a2b4a] mb-4">401-800 words</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Standard</p>
                  <p className="text-lg font-bold text-[#1a2b4a]">$129</p>
                  <p className="text-xs text-gray-400">24 hrs</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rush</p>
                  <p className="text-lg font-bold text-[#1a2b4a]">$179</p>
                  <p className="text-xs text-gray-400">Same day*</p>
                </div>
                <div className="bg-amber-100 rounded-lg py-1">
                  <p className="text-xs text-[#c9a227]">Immediate</p>
                  <p className="text-lg font-bold text-[#c9a227]">$229</p>
                  <p className="text-xs text-gray-400">3 hrs</p>
                </div>
              </div>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-5">
              <h3 className="font-bold text-[#1a2b4a] mb-4">801-1200 words</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Standard</p>
                  <p className="text-lg font-bold text-[#1a2b4a]">$179</p>
                  <p className="text-xs text-gray-400">24 hrs</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rush</p>
                  <p className="text-lg font-bold text-[#1a2b4a]">$229</p>
                  <p className="text-xs text-gray-400">Same day*</p>
                </div>
                <div className="bg-amber-100 rounded-lg py-1">
                  <p className="text-xs text-[#c9a227]">Immediate</p>
                  <p className="text-lg font-bold text-[#c9a227]">$279</p>
                  <p className="text-xs text-gray-400">3 hrs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800"><strong>*Rush:</strong> Request + payment by 12 PM ET for same-day.</p>
            </div>
            <div className="p-4 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-lg">
              <p className="text-sm text-[#1a2b4a]"><strong>Immediate:</strong> Front of the queue, guaranteed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1a2b4a] mb-12 text-center">Listing Description Add-Ons</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-2">Editor Notes</h3>
              <p className="text-gray-600 mb-4">Get detailed feedback on your original listing — what works, what doesn't, and why.</p>
              <p className="text-[#c9a227] font-semibold">$29</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-2">Headline Pack</h3>
              <p className="text-gray-600 mb-4">Get 5 alternative headlines optimized for MLS, Zillow, and social media.</p>
              <p className="text-[#c9a227] font-semibold">$19</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-2">Caption Pack</h3>
              <p className="text-gray-600 mb-4">Get 5 captions for social media posts (Instagram, Facebook, email).</p>
              <p className="text-[#c9a227] font-semibold">$29</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-2">View Full Pricing</h3>
              <p className="text-gray-600 mb-4">See all pricing tiers, turnaround times, and add-on options.</p>
              <Link href="/pricing" className="text-[#c9a227] font-semibold hover:underline">Go to Pricing →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#1a2b4a] to-[#2d4a7c] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-200 mb-8">Upload your listing and get professional copy back in 24 hours or less.</p>
          <Link href="/upload" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Submit Your Listing</Link>
        </div>
      </section>
    </main>
  );
}
