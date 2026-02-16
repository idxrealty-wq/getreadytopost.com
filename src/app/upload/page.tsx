"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', propertyAddress: '',
    propertyType: 'residential', listingDescription: '', wordCount: 'standard',
    turnaround: 'standard', notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit Your Listing</h1>
          <p className="text-xl text-gray-300">Paste your listing description and we'll send back a polished, MLS-ready rewrite</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Full Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="jane@email.com" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Property Address</label>
                <input name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="123 Main St, City, ST" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none bg-white">
                  <option value="residential">Residential</option>
                  <option value="condo">Condo / Townhome</option>
                  <option value="land">Vacant Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="multi-family">Multi-Family</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Turnaround</label>
                <select name="turnaround" value={formData.turnaround} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none bg-white">
                  <option value="standard">Standard (24 hours)</option>
                  <option value="rush">Rush (Same Day) +$50</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Listing Description *</label>
              <textarea name="listingDescription" value={formData.listingDescription} onChange={handleChange} required rows={8} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Paste your current listing description here..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Special Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Any special instructions or details..." />
            </div>

            <button type="submit" className="w-full bg-[#c9a227] hover:bg-[#e8c547] text-white py-4 rounded-xl font-bold text-lg transition">Submit for Rewrite</button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-[#1a2b4a]/60 hover:text-[#1a2b4a] font-semibold">← Back to Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
