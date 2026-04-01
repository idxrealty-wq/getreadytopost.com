import { useState, useEffect } from 'react';

import { saveListing } from '@/lib/listings';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type SavedPhotoInput = {
  url: string;
  category: string;
  uploadedAt: string;
};

export default function Tab5Save({
  address,
  propertyData,
  nearby,
  listing,
  checklistState,
  notes,
  saved,
  setSaved,
  user,
  editId,
  photos,
  existingPhotos,
  documents,
  existingDocuments,
  saveNowNonce,
  documentAccessCode,
  setExistingDocuments,
}: any) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!saveNowNonce) return;
    handleSave();
  }, [saveNowNonce]);

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
      if (editId) {
        const listingRef = doc(db, 'listings', editId);
        await updateDoc(listingRef, {
          address,
          propertyData,
          nearby,
          aiListing: listing,
          checklistState,
          notes,
          documents: existingDocuments || [],
          documentAccessCode,
          updatedAt: new Date().toISOString(),
        });
        if (setExistingDocuments) setExistingDocuments(existingDocuments || []);
      } else {
        const photoList: SavedPhotoInput[] = [];

        Object.entries(photos || {}).forEach(([category, items]) => {
          const typedItems = Array.isArray(items) ? items : [];
          typedItems.forEach((item: any) => {
            if (item?.preview) {
              photoList.push({
                url: item.preview,
                category,
                uploadedAt: new Date().toISOString(),
              });
            }
          });
        });

        await saveListing(
          user.uid,
          address,
          propertyData,
          nearby,
          listing,
          checklistState,
          notes,
          photoList,
          existingDocuments,
          documentAccessCode
        );
      }

      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setSaving(false);
    }
  };

  const completedChecklist = Object.entries(checklistState).filter(([, v]) => v).length;
  const totalChecklist = Object.keys(checklistState).length;
  const photoCount =
    Object.values(photos || {}).reduce((s: number, a: any) => s + a.length, 0) + (existingPhotos || []).length;
  const docCount =
    (existingDocuments || []).filter((d: any) => d && d.downloadURL).length +
    Object.values(documents || {}).filter((d: any) => d && d.url).length;
  const nearbyCount = nearby ? Object.values(nearby).filter((arr: any) => arr && arr.length > 0).length : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">💾 {editId ? 'Update Listing' : 'Save to Agent Vault'}</h2>
        <p className="text-gray-300 mb-8">Review your listing package before saving:</p>

        {editId && (
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">🆔 Property ID</span>
            <span
              className="text-yellow-400 font-mono text-sm cursor-pointer hover:text-yellow-300 transition"
              title="Click to copy"
              onClick={() => navigator.clipboard.writeText(editId)}
            >
              {editId} 📋
            </span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">🏠 Property Address</span>
            <span className={address ? 'text-green-400' : 'text-red-400'}>{address || 'Not set'}</span>
          </div>

          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">📋 Tax ID</span>
            <span className={propertyData.taxId ? 'text-green-400' : 'text-red-400'}>
              {propertyData.taxId || 'Not set'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">🏗️ Year Built</span>
            <span className={propertyData.yearBuilt ? 'text-green-400' : 'text-gray-400'}>
              {propertyData.yearBuilt || 'Not set'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">📐 Property Details</span>
            <span className="text-gray-300">
              {[
                propertyData.beds && `${propertyData.beds} bed`,
                propertyData.baths && `${propertyData.baths} bath`,
                propertyData.sqft && `${propertyData.sqft} sqft`,
                propertyData.price && `$${propertyData.price}`,
              ]
                .filter(Boolean)
                .join(' · ') || 'Not set'}
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
            <span className="text-white font-bold">📸 Photos</span>
            <span className={photoCount > 0 ? 'text-green-400' : 'text-gray-400'}>
              {photoCount > 0 ? `${photoCount} uploaded` : 'None uploaded'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">📄 Documents</span>
            <span className={docCount > 0 ? 'text-green-400' : 'text-gray-400'}>
              {docCount > 0 ? `${docCount} uploaded` : 'None uploaded'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/20">
            <span className="text-white font-bold">✅ Checklist</span>
            <span className="text-gray-300">
              {completedChecklist}/{totalChecklist} complete
            </span>
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
            {saving ? '💾 Saving...' : editId ? '💾 Update Listing' : '💾 Save Complete Package to Vault'}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {editId ? 'Listing Updated!' : 'Saved to Agent Vault!'}
          </h3>
          <p className="text-gray-300 mb-4">
            Your {editId ? 'updated' : 'complete'} listing package for <strong className="text-white">{address}</strong> is now in your vault.
          </p>
          <p className="text-gray-400 text-sm mb-6">Access it anytime from your Agent Vault dashboard.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => (window.location.href = '/agent-vault')}
              className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-2 rounded-lg font-bold transition"
            >
              View in Vault
            </button>
            <button
              onClick={() => (window.location.href = '/workspace')}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-bold transition"
            >
              Start New Listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
