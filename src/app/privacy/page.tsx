import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-black/45 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-200 mb-8">Last updated: February 2026</p>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
              <p className="text-gray-100">We collect information you provide directly to us, including name, email, phone number, and listing content when you submit a rewrite request.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <p className="text-gray-100">We use the information we collect to provide, maintain, and improve our services, process your requests, and communicate with you.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
              <p className="text-gray-100">We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-gray-100">If you have questions about this Privacy Policy, please contact us at privacy@getreadytopost.com</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
