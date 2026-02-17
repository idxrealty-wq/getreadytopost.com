"use client";
import { useState, useEffect } from 'react';

export default function Tab1PropertyBasics({ data, setData, onNext, address }: any) {
  const [daysOut, setDaysOut] = useState('120');
  const [calculatedDate, setCalculatedDate] = useState('');

  useEffect(() => {
    if (!data.dateAdded) {
      const today = new Date().toISOString().split('T')[0];
      setData((prev: any) => ({ ...prev, dateAdded: today }));
    }
  }, []);

  useEffect(() => {
    const days = parseInt(daysOut);
    if (!isNaN(days) && days > 0) {
      const future = new Date();
      future.setDate(future.getDate() + days);
      const formatted = future.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      setCalculatedDate(formatted);
    } else {
      setCalculatedDate('');
    }
  }, [daysOut]);

  const updateField = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const canProceed = address && data.taxId && data.yearBuilt;

  return (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">🏠 Property Basics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Date Added</label>
            <input
              type="date"
              value={data.dateAdded || ''}
              onChange={(e) => updateField('dateAdded', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Tax ID / Parcel Number *</label>
            <input
              type="text"
              value={data.taxId}
              onChange={(e) => updateField('taxId', e.target.value)}
              placeholder="e.g., 12-34-56-7890"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Year Built *</label>
            <input
              type="text"
              value={data.yearBuilt}
              onChange={(e) => updateField('yearBuilt', e.target.value)}
              placeholder="e.g., 2005"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Bedrooms</label>
            <input
              type="text"
              value={data.beds}
              onChange={(e) => updateField('beds', e.target.value)}
              placeholder="e.g., 3"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Bathrooms</label>
            <input
              type="text"
              value={data.baths}
              onChange={(e) => updateField('baths', e.target.value)}
              placeholder="e.g., 2"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Square Feet</label>
            <input
              type="text"
              value={data.sqft}
              onChange={(e) => updateField('sqft', e.target.value)}
              placeholder="e.g., 1,800"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Lot Size</label>
            <input
              type="text"
              value={data.lotSize}
              onChange={(e) => updateField('lotSize', e.target.value)}
              placeholder="e.g., 0.25 acres"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">List Price</label>
            <input
              type="text"
              value={data.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="e.g., 350,000"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 text-sm font-bold mb-2">Key Features</label>
            <input
              type="text"
              value={data.features}
              onChange={(e) => updateField('features', e.target.value)}
              placeholder="Pool, Updated Kitchen, Lake View..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border-2 border-blue-500/40 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">📅 Contract Day Calculator</h2>
        <p className="text-gray-300 mb-4">Calculate future dates for contracts (e.g., 120 days from today)</p>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={daysOut}
            onChange={(e) => setDaysOut(e.target.value)}
            placeholder="120"
            min="1"
            className="w-32 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
          <span className="text-white font-bold">days from today =</span>
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
            <span className="text-[#c9a227] font-bold text-lg">{calculatedDate || 'Enter days above'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          Next: Neighborhood →
        </button>
      </div>
    </div>
  );
}
