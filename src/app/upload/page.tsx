import Link from 'next/link';

export default function UploadPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit Your Listing</h1>
          <p className="text-xl text-gray-300">Instant analysis and rewrite for just $19.99</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-[#faf8f5] rounded-2xl p-10">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold text-[#1a2b4a] mb-4">We've Upgraded!</h2>
            <p className="text-gray-600 mb-6 text-lg">Our process is now fully automated. Paste your listing into Rate My Listing and get your grade, rewrite, and full report instantly — for just $19.99.</p>
            <Link href="#listing-form" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-xl font-bold text-lg">Go to Rate My Listing →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
