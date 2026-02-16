import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="pt-20">
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: February 2026</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 prose prose-lg">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-4">We collect information you provide directly to us, including name, email, phone number, and listing content when you submit a rewrite request.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the information we collect to provide, maintain, and improve our services, process your requests, and communicate with you.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-4">We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.</p>

          <h2 className="text-2xl font-bold text-[#1a2b4a] mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">If you have questions about this Privacy Policy, please contact us at privacy@getreadytopost.com</p>
        </div>
      </section>

      <section className="py-8 bg-[#faf8f5] text-center">
        <Link href="/" className="text-[#1a2b4a] hover:text-[#c9a227] font-semibold">← Back to Home</Link>
      </section>
    </main>
  );
}
