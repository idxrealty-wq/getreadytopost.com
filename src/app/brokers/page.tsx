import Link from 'next/link';

export default function BrokersPage() {
  return (
    <main>
      <section className="relative bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">For Brokers and Teams</h1>
          <p className="text-xl text-gray-300 mb-2">Instant AI-powered listing analysis for your entire team</p>
          <p className="text-lg text-[#c9a227] font-semibold">19.99 per listing - instant results for all agents</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-8 text-center">Elevate Every Listing on Your Roster</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">Give your agents an unfair advantage. Every listing graded, rewritten, and ready to convert - in seconds.</p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">Instant Turnaround</h3>
              <p className="text-gray-600">No waiting. Every agent gets results immediately after submission.</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">Consistent Quality</h3>
              <p className="text-gray-600">6-category grading ensures every listing meets your brokerage standard.</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-2">MLS and Fair Housing</h3>
              <p className="text-gray-600">AI-checked for compliance on every rewrite. Reduce risk across your team.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-4">See It In Action</h2>
          <p className="text-gray-600 mb-8 text-lg">Watch how GetReadyToPost helps brokers and teams raise the bar on every listing.</p>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
              src="https://www.youtube.com/embed/UWlBHck5PiM?rel=0"
              title="GetReadyToPost for Brokers and Teams"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a2b4a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Team?</h2>
          <p className="text-gray-300 mb-8">Contact us to discuss volume pricing and broker packages.</p>
          <Link href="/contact-broker" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg transition">Contact Us</Link>
        </div>
      </section>
    </main>
  );
}
