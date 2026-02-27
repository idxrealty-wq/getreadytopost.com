'use client';

import ShareButtons from '@/components/ShareButtons';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactBrokerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact-broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', company: '', phone: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <ShareButtons
        url="https://getreadytopost.com/contact-broker"
        title="Broker Solutions - GetReadyToPost"
      />

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Broker Solutions</h1>
          <p className="text-2xl text-gray-200">Scale your team's listing quality with GetReadyToPost.</p>
        </div>

        <div className="mb-16 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/NJWcpVAYuqM?rel=0"
              title="GetReadyToPost for Brokers"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">✓ Team Efficiency</h3>
            <p className="text-gray-300">
              Agents grade and rewrite listings in seconds. No back-and-forth. No delays. Faster listings to market.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">✓ Quality Control</h3>
            <p className="text-gray-300">
              Consistent, MLS-compliant descriptions across your entire portfolio. Fair Housing safe. Every time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">✓ Buyer Psychology</h3>
            <p className="text-gray-300">
              Listings optimized for search, readability, and conversion. Better descriptions = more showings.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">✓ Flexible Pricing</h3>
            <p className="text-gray-300">
              Monthly, 6-month, and annual plans. Bulk discounts available. Fits any team size or budget.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Get Started Today</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="company"
                placeholder="Brokerage / Company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
              />
            </div>

            <textarea
              name="message"
              placeholder="Tell us about your team and how we can help..."
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-lg font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Inquiry'}
            </button>

            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-center">
                ✓ Thank you! We'll be in touch soon.
              </div>
            )}
          </form>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Scale Your Team?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Or check out our <Link href="/pricing" className="text-[#c9a227] hover:text-[#e8c547] underline">pricing</Link> for individual agents.
          </p>
        </div>

        <div className="mt-16">
          <ShareButtons
            url="https://getreadytopost.com/contact-broker"
            title="Broker Solutions - GetReadyToPost"
          />
        </div>
      </div>
    </main>
  );
}
