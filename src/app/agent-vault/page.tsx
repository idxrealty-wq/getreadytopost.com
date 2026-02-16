import Link from 'next/link';

export default function AgentVaultPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="bg-[#c9a227] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 inline-block">COMING SOON</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Agent Vault</h1>
          <p className="text-xl text-gray-300">Your library of templates, scripts, and listing tools — all in one place</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-[#c9a227]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">Listing Templates</h3>
              <p className="text-gray-600">Pre-written descriptions for every property type</p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-[#c9a227]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">Scripts & Dialogues</h3>
              <p className="text-gray-600">Phone scripts, email templates, objection handlers</p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-[#c9a227]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">Quick Tools</h3>
              <p className="text-gray-600">Calculators, checklists, and workflow shortcuts</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-4">Stay Tuned</h2>
          <p className="text-gray-600 mb-8">We're building a comprehensive resource library for real estate professionals. Sign up to be notified when it launches.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" />
            <button className="bg-[#c9a227] hover:bg-[#e8c547] text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap">Notify Me</button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600 mb-4">In the meantime, check out our listing services:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload" className="bg-[#1a2b4a] hover:bg-[#2d4a7c] text-white px-6 py-3 rounded-lg font-semibold">Submit a Listing</Link>
            <Link href="/pricing" className="border-2 border-[#1a2b4a] text-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white px-6 py-3 rounded-lg font-semibold">View Pricing</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
