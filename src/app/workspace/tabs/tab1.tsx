"use client";
import { useState, useEffect } from 'react';

export default function Tab1({ address, setAddress }: any) {
  const [data, setData] = useState<any>({
    dateAdded: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!data.dateAdded) {
      const today = new Date().toISOString().split('T')[0];
      setData((prev: any) => ({ ...prev, dateAdded: today }));
    }
  }, []);

  const updateField = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    if (field === 'address') {
      setAddress(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">📍 Property Address</h2>
        <p className="text-gray-300 mb-6">Enter the full property address to get started.</p>
        <input
          type="text"
          placeholder="123 Main St, City, State 12345"
          value={data.address || address || ''}
          onChange={(e) => updateField('address', e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-white font-bold mb-2">📅 Date Added</label>
        <input
          type="date"
          value={data.dateAdded || ''}
          onChange={(e) => updateField('dateAdded', e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
