import Link from 'next/link';

export default function BrokersPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">For Brokers & Teams</h1>
          <p className="text-xl text-gray-300">Give your agents instant access to professional listing analysis</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-8 text-center">Elevate Every Listing</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">Make sure every listing is professional and compliant.</p>
        </div>
      </section>

      <section className="py-16 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-8 text-center">Broker Program</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <p className="text-5xl font-bold text-[#c9a227] mb-2">$19.99</p>
            <p className="text-gray-600 mb-6">per listing â€” instant results for all agents</p>
            <Link href="/contact-broker" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
