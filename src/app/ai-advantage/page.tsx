export default function AIAdvantagePage() {
  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Not Your Average AI</h1>
          <p className="text-2xl text-gray-300">Why GetReadyToPost AI writes listings that <span className="text-[#c9a227] font-bold">actually sell</span></p>
        </div>

        <div className="bg-red-900/20 border-2 border-red-500/40 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">The ChatGPT Problem</h2>
          <div className="space-y-3 text-gray-300 text-lg">
            <p>You have tried ChatGPT. You know what happens:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-red-400">Generic fluff:</strong> Charming home in a desirable neighborhood...</li>
              <li><strong className="text-red-400">No specifics:</strong> Does not mention actual schools parks or amenities nearby</li>
              <li><strong className="text-red-400">Fair Housing violations:</strong> Says things like perfect for families or quiet street</li>
              <li><strong className="text-red-400">Wrong length:</strong> Too short or too long for MLS best practices</li>
              <li><strong className="text-red-400">No SEO:</strong> Misses the keywords buyers are searching for</li>
              <li><strong className="text-red-400">Boring tone:</strong> Reads like Wikipedia not a sales pitch</li>
            </ul>
            <p className="text-xl font-bold text-red-300 mt-6">Result: Listings that do not convert. Days on market pile up.</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/30 border-2 border-emerald-500/40 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">The GetReadyToPost Difference</h2>
          <p className="text-gray-300 text-lg mb-6">Our AI is not generic ChatGPT. It is a <strong className="text-emerald-400">real estate-specific engine</strong> built on MLS best practices, NAR compliance, and Fair Housing law.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">MLS Best Practices</h3>
              <p className="text-gray-300">140 to 160 words. Action-driven. Buyer psychology. NAR compliance. Every listing hits the sweet spot.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="text-xl font-bold text-white mb-2">Fair Housing Safe</h3>
              <p className="text-gray-300">Zero violations. No protected class language. No subjective neighborhood descriptions. Legally bulletproof.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="text-xl font-bold text-white mb-2">Real Neighborhood Data</h3>
              <p className="text-gray-300">Mentions actual schools, parks, restaurants BY NAME with distances. Not near shopping but 0.5 miles from Publix.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">SEO Optimized</h3>
              <p className="text-gray-300">Includes the keywords buyers search: updated kitchen, open floor plan, lake access, top-rated schools.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Conversion-Focused</h3>
              <p className="text-gray-300">Vivid sensory language. Urgency. Strong calls to action. Designed to get showings booked, not just views.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Instant A+ Quality</h3>
              <p className="text-gray-300">Every listing gets the A+ badge. No C-grade output. No rewrites needed. Copy, paste, publish.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">How Our AI Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#c9a227] text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">You Enter Property Details</h3>
                <p className="text-gray-300">Address, beds, baths, sqft, price, year built, lot size, features. The basics every agent already knows.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#c9a227] text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">We Pull Real Neighborhood Data</h3>
                <p className="text-gray-300">Google Maps and Places API: nearby schools, grocery stores, parks, golf courses, restaurants, hospitals with names, distances, and ratings.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#c9a227] text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">AI Writes the Listing</h3>
                <p className="text-gray-300">Our real estate-trained GPT-4 model combines property details, neighborhood data, MLS best practices, Fair Housing compliance, SEO keywords, and buyer psychology.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#c9a227] text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">You Get an A+ Listing in 10 Seconds</h3>
                <p className="text-gray-300">Professional, specific, compliant, SEO-optimized, conversion-focused. Copy to clipboard. Paste into MLS. Done.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-12 overflow-x-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Side-by-Side Comparison</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-3 px-4 text-gray-400 font-bold">Feature</th>
                <th className="py-3 px-4 text-red-400 font-bold">Generic ChatGPT</th>
                <th className="py-3 px-4 text-emerald-400 font-bold">GetReadyToPost AI</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10"><td className="py-3 px-4 font-bold">Real Estate Training</td><td className="py-3 px-4">General purpose</td><td className="py-3 px-4">MLS + NAR + Fair Housing</td></tr>
              <tr className="border-b border-white/10"><td className="py-3 px-4 font-bold">Neighborhood Data</td><td className="py-3 px-4">Generic</td><td className="py-3 px-4">Real places with distances</td></tr>
              <tr className="border-b border-white/10"><td className="py-3 px-4 font-bold">Fair Housing</td><td className="py-3 px-4">Risky language</td><td className="py-3 px-4">100% compliant</td></tr>
              <tr className="border-b border-white/10"><td className="py-3 px-4 font-bold">Word Count</td><td className="py-3 px-4">Inconsistent</td><td className="py-3 px-4">Always 140-160 words</td></tr>
              <tr className="border-b border-white/10"><td className="py-3 px-4 font-bold">SEO Keywords</td><td className="py-3 px-4">Misses buyer terms</td><td className="py-3 px-4">Optimized for search</td></tr>
              <tr className="border-b border-white/10"><td className="py-3 px-4 font-bold">Conversion</td><td className="py-3 px-4">Informational tone</td><td className="py-3 px-4">Urgency + CTA</td></tr>
              <tr className="border-b border-white/10"><td className="py-3 px-4 font-bold">Speed</td><td className="py-3 px-4">Manual data entry</td><td className="py-3 px-4">10 seconds automated</td></tr>
              <tr><td className="py-3 px-4 font-bold">Price</td><td className="py-3 px-4">$20/month subscription</td><td className="py-3 px-4 font-bold text-emerald-400">$19.99 per listing</td></tr>
            </tbody>
          </table>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to See Your Listings Sell Faster?</h2>
          <p className="text-gray-300 text-lg mb-8">Try the Agent Workspace and experience real estate AI built by agents, for agents.</p>
          <a href="/workspace" className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition shadow-2xl">Try Agent Workspace Now</a>
        </div>

      </div>
    </main>
  );
}
