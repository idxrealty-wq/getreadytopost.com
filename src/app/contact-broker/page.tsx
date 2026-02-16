"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function ContactBrokerPage() {
  const [formData, setFormData] = useState({
    brokerageName: '', contactName: '', email: '', phone: '', 
    agentCount: '', message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us - Broker Inquiries</h1>
          <p className="text-xl text-gray-300">Let's discuss volume pricing and brokerage solutions</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Brokerage Name *</label>
                <input name="brokerageName" value={formData.brokerageName} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Your Name *</label>
                <input name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Number of Agents</label>
              <select name="agentCount" value={formData.agentCount} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none bg-white">
                <option value="">Select...</option>
                <option value="1-10">1-10 agents</option>
                <option value="11-50">11-50 agents</option>
                <option value="51-100">51-100 agents</option>
                <option value="100+">100+ agents</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Tell us about your needs..." />
            </div>

            <button type="submit" className="w-full bg-[#c9a227] hover:bg-[#e8c547] text-white py-4 rounded-xl font-bold text-lg transition">Send Inquiry</button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/brokers" className="text-[#1a2b4a]/60 hover:text-[#1a2b4a] font-semibold">← Back to Broker Info</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
