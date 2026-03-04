import Link from 'next/link';

export default function WhyCopyMattersPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-20 pt-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Your Photos Get the Click.</h1>
          <h2 className="text-3xl md:text-4xl font-light mb-8 text-gray-200">Your Words Get the Showing.</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">A listing description is not extra - it is the copy that follows your property everywhere: MLS, Zillow, Realtor.com, Facebook, email blasts, and your agent website.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-6 text-center">See Why Descriptions Matter</h2>
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="aspect-video w-full"
              frameBorder="0"
              height="450"
              referrerPolicy="strict-origin-when-cross-origin"
              src="https://www.youtube.com/embed/q1gCe2-nE_o?rel=0"
              title="Why Listing Descriptions Matter"
              width="100%"
            ></iframe>
          </div>
        </div>
      </section>
      <section className="py-10 bg-[#c9a227]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl italic text-[#1a2b4a] mb-3">&quot;Images aren&apos;t everything... A lackluster description has the power to put buyers off even if they liked the images.&quot;</p>
          <p className="text-[#1a2b4a] font-semibold">- Newport Beach Real Estate</p>
        </div>
      </section>
      <section className="py-20 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-[#1a2b4a] mb-16 text-center">What a Professional Listing Description Does</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-white to-[#faf8f5] p-8 rounded-xl border-l-4 border-[#c9a227] shadow-lg">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Turns Interest Into Action</h3>
              <p className="text-gray-700">A clear, buyer-friendly description helps shoppers picture the home and decide faster if it is worth a visit.</p>
            </div>
            <div className="bg-gradient-to-br from-white to-[#faf8f5] p-8 rounded-xl border-l-4 border-[#c9a227] shadow-lg">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Stops Scroll-Past Behavior</h3>
              <p className="text-gray-700">Even with great photos, weak copy can make buyers lose confidence and move on to the next listing.</p>
            </div>
            <div className="bg-gradient-to-br from-white to-[#faf8f5] p-8 rounded-xl border-l-4 border-[#c9a227] shadow-lg">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Differentiates Your Listing</h3>
              <p className="text-gray-700">In a sea of similar homes, the right words highlight what is truly special - without hype or exaggeration.</p>
            </div>
            <div className="bg-gradient-to-br from-white to-[#faf8f5] p-8 rounded-xl border-l-4 border-[#c9a227] shadow-lg">
              <h3 className="text-2xl font-bold text-[#1a2b4a] mb-3">Protects Professionalism</h3>
              <p className="text-gray-700">Clean grammar, strong structure, and accurate details make the listing (and the agent) look sharp and trustworthy.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl italic text-[#1a2b4a] mb-3">&quot;Poor writing means lost money, time, productivity, and good will.&quot;</p>
          <p className="text-gray-600 font-semibold">- Danziger (via NC REALTORS)</p>
        </div>
      </section>
      <section className="py-20 bg-[#1a2b4a]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-16 text-center">What Happens When Copy is Weak</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50/10 border border-red-300/30 p-6 rounded-lg">
              <p className="text-white text-lg">Generic language that blends in with every other listing</p>
            </div>
            <div className="bg-red-50/10 border border-red-300/30 p-6 rounded-lg">
              <p className="text-white text-lg">Missing key details buyers are actually looking for</p>
            </div>
            <div className="bg-red-50/10 border border-red-300/30 p-6 rounded-lg">
              <p className="text-white text-lg">Confusing flow or overwhelming wall of text</p>
            </div>
            <div className="bg-red-50/10 border border-red-300/30 p-6 rounded-lg">
              <p className="text-white text-lg">Typos and awkward phrasing that reduce buyer trust</p>
            </div>
            <div className="bg-red-50/10 border border-red-300/30 p-6 rounded-lg">
              <p className="text-white text-lg">Longer days on market and lower offers</p>
            </div>
            <div className="bg-red-50/10 border border-red-300/30 p-6 rounded-lg">
              <p className="text-white text-lg">Lost showings to competitors with better copy</p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-xl italic text-gray-300 mb-3">&quot;A poorly written listing description can make a property seem less valuable and an agent seem less professional.&quot;</p>
            <p className="text-[#c9a227] font-semibold">- McKissock Learning</p>
          </div>
        </div>
      </section>
      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-8 text-center">What Experts Say About Perfectly Written Descriptions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow">
              <span className="text-[#c9a227] text-2xl">✓</span>
              <p className="text-gray-700">Start with the best feature</p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow">
              <span className="text-[#c9a227] text-2xl">✓</span>
              <p className="text-gray-700">Highlight benefits rather than just features</p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow">
              <span className="text-[#c9a227] text-2xl">✓</span>
              <p className="text-gray-700">Use specific details</p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow">
              <span className="text-[#c9a227] text-2xl">✓</span>
              <p className="text-gray-700">Be easy to read with short paragraphs</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#1a2b4a] to-[#2d4a7c] text-white p-12 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">The ReadyToPost Promise</h2>
            <p className="text-xl text-gray-200 mb-8">We rewrite your listing to be <strong>MLS-ready, buyer-focused, and paste-ready</strong> - so your property reads like it belongs at the top of the market.</p>
            <Link href="/upload" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">See How It Works</Link>
          </div>
        </div>
      </section>
      <section className="py-8 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Sources: Newport Beach Real Estate Cafe | Hometrack Real Estate Marketing | NC REALTORS | McKissock Learning | Perry Real Estate College | Redfin/Grammarly Study</p>
        </div>
      </section>
    </main>
  );
}
