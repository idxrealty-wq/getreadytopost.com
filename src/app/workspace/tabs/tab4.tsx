"use client";

import { useState, useEffect } from 'react';
import { storage, db } from '@/lib/firebaseClient';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const DOCUMENT_SLOTS = [
  { id: 'seller_disclosure', label: 'Seller Disclosure', required: true },
  { id: 'listing_agreement', label: 'Listing Agreement', required: true },
  { id: 'lead_paint', label: 'Lead-Based Paint Disclosure (Pre-1978)', required: false },
  { id: 'hoa_docs', label: 'HOA Documents', required: false },
  { id: 'survey', label: 'Property Survey', required: false },
  { id: 'title_info', label: 'Title Information', required: false },
  { id: 'appraisal', label: 'Appraisal', required: false },
  { id: 'inspection', label: 'Inspection Report', required: false },
];

const PHOTO_CATEGORIES = [
  { id: 'exterior', label: 'Exterior Photos' },
  { id: 'interior', label: 'Interior Photos' },
  { id: 'aerial', label: 'Aerial/Drone Photos' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bathrooms', label: 'Bathrooms' },
  { id: 'bedrooms', label: 'Bedrooms' },
  { id: 'outdoor', label: 'Outdoor/Yard' },
  { id: 'other', label: 'Other' },
];

const CHECKLIST_ITEMS = [
  { id: 'photos_exterior', label: 'Exterior Photos Taken', category: 'Photos & Media' },
  { id: 'photos_interior', label: 'Interior Photos Taken', category: 'Photos & Media' },
  { id: 'photos_aerial', label: 'Aerial/Drone Photos', category: 'Photos & Media' },
  { id: 'virtual_tour', label: 'Virtual Tour / Video Walkthrough', category: 'Photos & Media' },
  { id: 'floor_plan', label: 'Floor Plan Created', category: 'Photos & Media' },
  { id: 'lockbox', label: 'Lockbox Placed', category: 'Property Prep' },
  { id: 'sign_installed', label: 'Yard Sign Installed', category: 'Property Prep' },
  { id: 'staging', label: 'Staging Complete', category: 'Property Prep' },
  { id: 'cleaning', label: 'Deep Cleaning Done', category: 'Property Prep' },
  { id: 'repairs', label: 'Pre-Listing Repairs Complete', category: 'Property Prep' },
  { id: 'mls_entry', label: 'MLS Entry Complete', category: 'Marketing' },
  { id: 'description_written', label: 'Listing Description Written', category: 'Marketing' },
  { id: 'social_media', label: 'Social Media Posts Scheduled', category: 'Marketing' },
  { id: 'email_blast', label: 'Email Blast Sent', category: 'Marketing' },
  { id: 'open_house', label: 'Open House Scheduled', category: 'Marketing' },
];

export default function Tab4Checklist({
  checklistState,
  setChecklistState,
  notes,
  setNotes,
  photos,
  setPhotos,
  existingPhotos,
  onNext,
  listingId,
}: any) {
  const [uploads, setUploads] = useState<Record<string, { file: File; date: string; url?: string; uploading?: boolean } | null>>({});
  const [daysOut, setDaysOut] = useState('120');
  const [calculatedDate, setCalculatedDate] = useState('');

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

  const toggleChecklist = (id: string) => {
    setChecklistState((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = async (docId: string, file: File | null) => {
    if (!file) {
      setUploads((prev) => ({ ...prev, [docId]: null }));
      return;
    }

    setUploads((prev) => ({
      ...prev,
      [docId]: { file, date: new Date().toLocaleString(), uploading: true },
    }));

    try {
      const storagePath = 'documents/' + (listingId || 'temp') + '/' + docId + '/' + file.name;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setUploads((prev) => ({
        ...prev,
        [docId]: {
          file,
          date: new Date().toLocaleString(),
          url: downloadURL,
          uploading: false,
        },
      }));

      if (listingId) {
        const listingRef = doc(db, 'listings', listingId);
        const docMetadata = {
          docId,
          label: DOCUMENT_SLOTS.find((d) => d.id === docId)?.label || docId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          downloadURL,
          uploadedAt: new Date().toISOString(),
          required: DOCUMENT_SLOTS.find((d) => d.id === docId)?.required || false,
        };

        await updateDoc(listingRef, { documents: arrayUnion(docMetadata) });
      }
    } catch (error) {
      console.error('[Tab4] document upload failed', error);
      setUploads((prev) => ({
        ...prev,
        [docId]: { file, date: new Date().toLocaleString(), uploading: false },
      }));
    }
  };

  const totalPhotos = Object.values(photos).reduce((sum: number, arr: any) => sum + arr.length, 0);

  const handlePhotoUpload = async (categoryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const incoming = Array.from(files);
    if (totalPhotos + incoming.length > 20) {
      alert('Max 20 photos per listing. You currently have ' + totalPhotos + '.');
      return;
    }

    for (const file of incoming) {
      const preview = URL.createObjectURL(file);
      setPhotos((prev: Record<string, { file: File; preview: string; date: string }[]>) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), { file, preview, date: new Date().toLocaleString() }],
      }));

      if (!listingId) { console.log("No listingId, skipping Firestore persist"); continue; }

      try {
        const photoId = 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
        const storagePath = 'photos/' + listingId + '/' + categoryId + '/' + photoId + '_' + file.name;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const listingRef = doc(db, 'listings', listingId);
        await updateDoc(listingRef, {
          photos: arrayUnion({
            photoId,
            categoryId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            downloadURL,
            storagePath,
            uploadedAt: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error('[Tab4] photo persist failed', e);
      }
    }
  };

  const removePhoto = (categoryId: string, index: number) => {
    setPhotos((prev: Record<string, { file: File; preview: string; date: string }[]>) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((_: any, i: number) => i !== index),
    }));
  };

  const groupedChecklist = CHECKLIST_ITEMS.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const uploadedRequired = DOCUMENT_SLOTS.filter((d) => d.required && uploads[d.id]?.url).length;
  const requiredDocs = DOCUMENT_SLOTS.filter((d) => d.required).length;
  const uploadedCount = Object.values(uploads).filter((u) => u?.url).length;

  const completedCount = Object.values(checklistState).filter((v) => v).length;
  const totalCount = CHECKLIST_ITEMS.length;

  return (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📋 Contract Day Calculator</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Days from Today</label>
            <input
              type="number"
              value={daysOut}
              onChange={(e) => setDaysOut(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none"
            />
          </div>
          {calculatedDate && (
            <div className="text-lg font-bold text-[#c9a227]">📅 {calculatedDate}</div>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📄 Document Upload Center</h2>
        <p className="text-gray-300 mb-6">Upload required documents for this listing</p>

        <div className="space-y-4">
          {DOCUMENT_SLOTS.map((docSlot) => (
            <div key={docSlot.id} className="bg-white/5 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white font-semibold">
                  {docSlot.label}
                  {docSlot.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {uploads[docSlot.id]?.url && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">✓ Uploaded</span>
                )}
              </div>

              <input
                type="file"
                onChange={(e) => handleFileUpload(docSlot.id, e.target.files?.[0] || null)}
                disabled={uploads[docSlot.id]?.uploading}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c9a227] file:text-white hover:file:bg-[#b8911f] file:cursor-pointer disabled:opacity-50"
              />

              {uploads[docSlot.id] && (
                <div className="mt-2 text-xs text-gray-400">
                  <p>📎 {uploads[docSlot.id]?.file.name}</p>
                  <p className="text-gray-500">Uploaded: {uploads[docSlot.id]?.date}</p>
                  {uploads[docSlot.id]?.uploading && <p className="text-blue-400">⏳ Uploading...</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-300">
          📊 Uploaded: {uploadedRequired}/{requiredDocs} required, {uploadedCount}/20 total
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📸 Property Photos</h2>
        <p className="text-gray-300 mb-6">Upload photos organized by category. Total photos: {totalPhotos}/20</p>

        <div className="space-y-6">
          {PHOTO_CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-white/5 rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-bold mb-3">{cat.label}</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(cat.id, e.target.files)}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer mb-3"
              />

               {(() => {
                const localPhotos = (photos[cat.id] || []).map((p: any) => ({ ...p, src: p.url || p.preview }));
                const savedPhotos = (existingPhotos || []).filter((p: any) => p.categoryId === cat.id).map((p: any) => ({ src: p.downloadURL, date: p.uploadedAt ? new Date(p.uploadedAt).toLocaleString() : '' }));
                const allPhotos = [...savedPhotos, ...localPhotos];
                if (allPhotos.length === 0) return null;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allPhotos.map((photo: any, i: number) => (
                      <div key={i} className="relative group">
                        <img src={photo.src} alt={cat.label} className="w-full h-32 object-cover rounded-lg" />
                        <p className="text-xs text-gray-400 mt-1">{photo.date}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
              </div>
         })()}
            </div>
          ))}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">✅ Pre-Listing Checklist</h2>
        <p className="text-gray-300 mb-6">Track your progress: {completedCount}/{totalCount} complete</p>

        <div className="space-y-6">
          {Object.entries(groupedChecklist).map(([category, items]: [string, any]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-[#c9a227] mb-3">{category}</h3>
              <div className="space-y-2">
                {items.map((item: any) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/20 transition"
                  >
                    <input
                      type="checkbox"
                      checked={checklistState[item.id] || false}
                      onChange={() => toggleChecklist(item.id)}
                      className="w-5 h-5 accent-[#c9a227]"
                    />
                    <span className={'text-white ' + (checklistState[item.id] ? 'line-through opacity-60' : '')}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📝 Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes, reminders, or special instructions for this listing..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition"
        >
          Next: Save to Vault →
        </button>
      </div>
    </div>
  );
}
