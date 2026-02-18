"use client";
import { useState } from 'react';
import { saveListing } from '@/lib/listings';

export default function Tab5Save({ address, propertyData, nearby, listing, checklistState, notes, saved, setSaved, user }: any) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!user) {
      setError('You must be signed in to save listings.');
      return;
    }
    if (!address) {
      setError('Address is required.');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      await saveListing(
        user.uid,
        address,
        propertyData,
        nearby,
        listing,
        checklistState,
        notes
      );
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setSaving(false);
    }
  };

  const completedChecklist = Object.entries(checklistState).filter(([, v]) => v).length;
  const totalChecklist = Object.keys(checklistState).length;
  const nearbyCount = nearby ? Object.values(nearby).filter((arr: any) => arr && arr.length > 0).length : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">💾 Save to Agent Vault</h2>
        <p className="text-gray-300 mb-8">Review your listing package before saving:</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">🏠 Property Address</span>
            <span className={address ? 'text-green-400' : 'text-red-400'}>{address || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">📋 Tax ID</span>
            <span className={propertyData.taxId ? 'text-green-400' : 'text-red-400'}>{propertyData.taxId || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">🏗️ Year Built</span>
            <span className={propertyData.yearBuilt ? 'text-green-400' : 'text-gray-400'}>{propertyData.yearBuilt || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">📐 Property Details</span>
            <span className="text-gray-300">
              {[
                propertyData.beds && `${propertyData.beds} bed`,
                propertyData.baths && `${propertyData.baths} bath`,
                propertyData.sqft && `${propertyData.sqft} sqft`,
                propertyData.price && `$${propertyData.price}`,
              ].filter(Boolean).join(' · ') || 'Not set'}
            </span>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">📍 Neighborhood Data</span>
            <span className={nearbyCount > 0 ? 'text-green-400' : 'text-gray-400'}>
              {nearbyCount > 0 ? `${nearbyCount} categories loaded` : 'Not loaded'}
            </span>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">✨ AI Listing</span>
            <span className={listing ? 'text-green-400' : 'text-gray-400'}>
              {listing ? '✅ Generated' : 'Not generated'}
            </span>
          </div>
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">✅ Checklist</span>
            <span className="text-gray-300">{completedChecklist}/{totalChecklist} complete</span>
          </div>
          {notes && (
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
              <span className="text-white font-bold">📝 Notes</span>
              <span className="text-green-400">Added</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/60 border-2 border-red-500/60 rounded-xl p-4 text-center">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {!saved ? (
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={!address || !user || saving}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition shadow-2xl disabled:opacity-50"
          >
            {saving ? '💾 Saving...' : '💾 Save Complete Package to Vault'}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">Saved to Agent Vault!</h3>
          <p className="text-gray-300 mb-4">Your complete listing package for <strong className="text-white">{address}</strong> is now in your vault.</p>
          <p className="text-gray-400 text-sm mb-6">Access it anytime from your Agent Vault dashboard.</p>
          <button
            onClick={() => window.location.href = '/workspace'}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-bold transition"
          >
            Start New Listing
          </button>
        </div>
      )}
    </div>
  );
}
