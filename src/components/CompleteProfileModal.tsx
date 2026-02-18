"use client";
import { useState } from 'react';
import { updateUserProfile } from '@/lib/profile';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
  currentEmail: string;
}

export default function CompleteProfileModal({ isOpen, onClose, userId, currentName, currentEmail }: CompleteProfileModalProps) {
  const [fullName, setFullName] = useState(currentName || '');
  const [company, setCompany] = useState('');
  const [designations, setDesignations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !company.trim()) {
      setError('Full Name and Company are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateUserProfile(userId, {
        fullName: fullName.trim(),
        company: company.trim(),
        designations: designations.trim(),
        profileComplete: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative my-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-2xl font-bold text-[#1a2b4a]">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mt-1">
            Just a few details so we can personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={currentEmail}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Company / Brokerage *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Keller Williams, RE/MAX"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Designations</label>
            <input
              type="text"
              value={designations}
              onChange={(e) => setDesignations(e.target.value)}
              placeholder="e.g., Realtor®, ABR, GRI"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a227] hover:bg-[#b8911f] text-white py-3 rounded-xl font-bold transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
