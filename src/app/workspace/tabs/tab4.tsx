"use client";
import { useState } from 'react';

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

export default function Tab4Checklist({ checklistState, setChecklistState, notes, setNotes, onNext }: any) {
  const [uploads, setUploads] = useState<Record<string, File | null>>({});

  const toggleChecklist = (id: string) => {
    setChecklistState((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = (docId: string, file: File | null) => {
    setUploads((prev) => ({ ...prev, [docId]: file }));
  };

  const groupedChecklist = CHECKLIST_ITEMS.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const completedCount = Object.values(checklistState).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const uploadedCount = Object.values(uploads).filter(Boolean).length;
  const requiredDocs = DOCUMENT_SLOTS.filter((d) => d.required).length;
  const uploadedRequired = DOCUMENT_SLOTS.filter((d) => d.required && uploads[d.id]).length;

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📄 Document Upload Center</h2>
        <p className="text-gray-300 mb-6">Upload key documents for this listing. Each document gets its own labeled slot.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENT_SLOTS.map((doc) => (
            <div key={doc.id} className="bg-white/5 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white font-bold text-sm">
                  {doc.label} {doc.required && <span className="text-red-400">*</span>}
                </label>
                {uploads[doc.id] && <span className="text-green-400 text-2xl">✅</span>}
              </div>
              <input
                type="file"
                onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c9a227] file:text-white hover:file:bg-[#b8911f] file:cursor-pointer"
              />
              {uploads[doc.id] && (
                <p className="text-xs text-gray-400 mt-2">📎 {uploads[doc.id]?.name}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-300">
          📊 Uploaded: {uploadedRequired}/{requiredDocs} required, {uploadedCount}/{DOCUMENT_SLOTS.length} total
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">✅ Pre-Listing Checklist</h2>
        <p className="text-gray-300 mb-6">Track your progress: {completedCount}/{totalCount} complete</p>
        <div className="space-y-6">
          {Object.entries(groupedChecklist).map(([category, items]: [string, any]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-[#c9a227] mb-3">{category}</h3>
              <div className="space-y-2">
                {items.map((item: any) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/20 transition">
                    <input
                      type="checkbox"
                      checked={checklistState[item.id] || false}
                      onChange={() => toggleChecklist(item.id)}
                      className="w-5 h-5 accent-[#c9a227]"
                    />
                    <span className={`text-white ${checklistState[item.id] ? 'line-through opacity-60' : ''}`}>
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
