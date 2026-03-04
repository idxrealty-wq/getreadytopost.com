import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="pt-24 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#1a2b4a] mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-gray-700 space-y-6">
          <p>Last updated: January 2025</p>
          <h2 className="text-2xl font-bold text-[#1a2b4a]">Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your email address when you submit a listing or create an account.</p>
          <h2 className="text-2xl font-bold text-[#1a2b4a]">How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices and support messages.</p>
          <h2 className="text-2xl font-bold text-[#1a2b4a]">Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except as described in this policy.</p>
          <h2 className="text-2xl font-bold text-[#1a2b4a]">Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          <h2 className="text-2xl font-bold text-[#1a2b4a]">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us through our website.</p>
        </div>
        <div className="mt-12">
          <Link href="/" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

