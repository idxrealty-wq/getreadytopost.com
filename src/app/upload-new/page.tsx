"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function UploadNewPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', name: '', propertyType: 'residential', 
    listingText: '', turnaround: 'standard'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const wordCount = formData.listingText.trim().split(/\s+/).filter(w => w).length;

  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit Your Listing (New Flow)</h1>
          <p className="text-xl text-gray-300">Step-by-step submission process</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${step >= 1 ? 'text-[#c9a227]' : 'text-gray-400'}`}>1. Contact</span>
              <span className={`text-sm font-semibold ${step >= 2 ? 'text-[#c9a227]' : 'text-gray-400'}`}>2. Property</span>
              <span className={`text-sm font-semibold ${step >= 3 ? 'text-[#c9a227]' : 'text-gray-400'}`}>3. Listing</span>
              <span className={`text-sm font-semibold ${step >= 4 ? 'text-[#c9a227]' : 'text-gray-400'}`}>4. Review</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#c9a227] transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>
          </div>

          {/* Step 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Contact Information</h2>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Full Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" />
              </div>
              <button onClick={() => setStep(2)} disabled={!formData.email || !formData.name} className="w-full bg-[#c9a227] hover:bg-[#e8c547] text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50">Next Step →</button>
            </div>
          )}

          {/* Step 2: Property Type */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Property Details</h2>
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
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold text-lg">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#c9a227] hover:bg-[#e8c547] text-white py-4 rounded-xl font-bold text-lg transition">Next Step →</button>
              </div>
            </div>
          )}

          {/* Step 3: Listing Text */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Paste Your Listing</h2>
              <div>
                <label className="block text-sm font-semibold text-[#1a2b4a] mb-2">Current Listing Description *</label>
                <textarea name="listingText" value={formData.listingText} onChange={handleChange} required rows={10} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Paste your listing description here..." />
                <p className="text-sm text-gray-500 mt-1">{wordCount} words</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold text-lg">← Back</button>
                <button onClick={() => setStep(4)} disabled={!formData.listingText} className="flex-1 bg-[#c9a227] hover:bg-[#e8c547] text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50">Review →</button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Review Your Submission</h2>
              <div className="bg-[#faf8f5] rounded-xl p-6 space-y-3">
                <div><strong className="text-[#1a2b4a]">Email:</strong> {formData.email}</div>
                <div><strong className="text-[#1a2b4a]">Name:</strong> {formData.name}</div>
                <div><strong className="text-[#1a2b4a]">Property Type:</strong> {formData.propertyType}</div>
                <div><strong className="text-[#1a2b4a]">Turnaround:</strong> {formData.turnaround === 'standard' ? 'Standard (24 hours)' : 'Rush (Same Day)'}</div>
                <div><strong className="text-[#1a2b4a]">Word Count:</strong> {wordCount} words</div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold text-lg">← Back</button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition">Submit Order ✓</button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="text-[#1a2b4a]/60 hover:text-[#1a2b4a] font-semibold">← Back to Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
