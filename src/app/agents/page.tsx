import Link from 'next/link';

export default function AgentsPage() {
  return (
    <main>
      <section className="relative bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="absolute inset-0 opacity-20">
          <img alt="Real estate agent" className="w-full h-full object-cover" loading="lazy" src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">For Real Estate Agents</h1>
          <p className="text-xl text-gray-300">Instant listing analysis and professional rewrites — powered by AI</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-8 text-center">Stop Staring at Blank Screens</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">Submit your listing, get an instant grade and professional rewrite for just $19.99.</p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">Instant Results</h3>
              <p className="text-gray-600">Get your grade and rewrite immediately.</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">6-Category Grading</h3>
              <p className="text-gray-600">Know exactly where your listing needs work.</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">MLS-Ready Copy</h3>
              <p className="text-gray-600">Paste-ready descriptions that follow guidelines.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a2b4a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Try It Now — $19.99</h2>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Rate My Listing</Link>
        </div>
      </section>
    </main>
  );
}
