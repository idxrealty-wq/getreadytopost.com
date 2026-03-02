"use client";
import { useEffect, useState } from "react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
const DOCUMENT_SLOTS = [
  { id: "seller_disclosure", label: "Seller Disclosure", required: true },
  { id: "listing_agreement", label: "Listing Agreement", required: true },
  { id: "lead_paint", label: "Lead-Based Paint Disclosure (Pre-1978)", required: false },
  { id: "hoa_docs", label: "HOA Documents", required: false },
  { id: "survey", label: "Property Survey", required: false },
  { id: "title_info", label: "Title Information", required: false },
  { id: "appraisal", label: "Appraisal", required: false },
  { id: "inspection", label: "Inspection Report", required: false },
];
const PHOTO_CATEGORIES = [
  { id: "exterior", label: "Exterior Photos" },
  { id: "interior", label: "Interior Photos" },
  { id: "aerial", label: "Aerial/Drone Photos" },
  { id: "kitchen", label: "Kitchen" },
  { id: "bathrooms", label: "Bathrooms" },
  { id: "bedrooms", label: "Bedrooms" },
  { id: "outdoor", label: "Outdoor/Yard" },
  { id: "other", label: "Other" },
];
const CHECKLIST_ITEMS = [
  { id: "photos_exterior", label: "Exterior Photos Taken", category: "Photos & Media" },
  { id: "photos_interior", label: "Interior Photos Taken", category: "Photos & Media" },
  { id: "photos_aerial", label: "Aerial/Drone Photos", category: "Photos & Media" },
  { id: "virtual_tour", label: "Virtual Tour / Video Walkthrough", category: "Photos & Media" },
  { id: "floor_plan", label: "Floor Plan Created", category: "Photos & Media" },
  { id: "lockbox", label: "Lockbox Placed", category: "Property Prep" },
  { id: "sign_installed", label: "Yard Sign Installed", category: "Property Prep" },
  { id: "staging", label: "Staging Complete", category: "Property Prep" },
  { id: "cleaning", label: "Deep Cleaning Done", category: "Property Prep" },
  { id: "repairs", label: "Pre-Listing Repairs Complete", category: "Property Prep" },
  { id: "mls_entry", label: "MLS Entry Complete", category: "Marketing" },
  { id: "description_written", label: "Listing Description Written", category: "Marketing" },
  { id: "social_media", label: "Social Media Posts Scheduled", category: "Marketing" },
  { id: "email_blast", label: "Email Blast Sent", category: "Marketing" },
  { id: "open_house", label: "Open House Scheduled", category: "Marketing" },
];
export default function Tab4Checklist({
  checklistState,
  setChecklistState,
  notes,
  setNotes,
  photos,
  setPhotos,
  existingPhotos,
  existingDocuments,
  setExistingDocuments,
  onNext,
  listingId,
  documentAccessCode,
  setDocumentAccessCode,
}: any) {
  const [uploads, setUploads] = useState<Record<string, any>>({});
  const [docMeta, setDocMeta] = useState<Record<string, { isPaid: boolean; price: string; party: string; accessCode: string; codeSaved?: boolean }>>(() => {
    const defaults: Record<string, any> = {};
    DOCUMENT_SLOTS.forEach((d) => {
      defaults[d.id] = { isPaid: true, price: "", party: "Buyer", accessCode: "", codeSaved: false };
    });
    return defaults;
  });
  const [savedPhotos, setSavedPhotos] = useState<any[]>([]);
  const [daysOut, setDaysOut] = useState("120");
  const [calculatedDate, setCalculatedDate] = useState("");
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [viewCodeInput, setViewCodeInput] = useState("");
  const [viewCodeError, setViewCodeError] = useState(false);
  const [viewCodePending, setViewCodePending] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  useEffect(() => {
    const days = parseInt(daysOut);
    if (!isNaN(days) && days > 0) {
      const future = new Date();
      future.setDate(future.getDate() + days);
      setCalculatedDate(future.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    } else {
      setCalculatedDate("");
    }
  }, [daysOut]);
  useEffect(() => {
    if (existingDocuments && existingDocuments.length > 0) {
      const loaded: Record<string, any> = {};
      existingDocuments.forEach((d: any) => {
        loaded[d.docId] = {
          file: { name: d.fileName } as File,
          date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "",
          url: d.downloadURL,
          uploading: false,
          storagePath: d.storagePath || null,
        };
      });
      setUploads(loaded);
    }
  }, [existingDocuments]);
  useEffect(() => {
    if (existingPhotos && existingPhotos.length > 0) {
      setSavedPhotos(existingPhotos);
    }
  }, [existingPhotos]);
  const toggleChecklist = (id: string) => {
    setChecklistState((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleViewClick = (docId: string) => {
    const code = docMeta[docId]?.accessCode || "";
    if (!code) {
      setViewingDoc(docId);
    } else {
      setViewCodePending(docId);
      setViewCodeInput("");
      setViewCodeError(false);
    }
  };
  const handleViewCodeSubmit = () => {
    if (!viewCodePending) return;
    const code = docMeta[viewCodePending]?.accessCode || "";
    if (viewCodeInput.trim() === code.trim()) {
      setViewingDoc(viewCodePending);
      setViewCodePending(null);
      setViewCodeInput("");
      setViewCodeError(false);
    } else {
      setViewCodeError(true);
    }
  };
  const handleFileUpload = async (docId: string, file: File | null) => {
    if (!file) {
      setUploads((prev) => ({ ...prev, [docId]: null }));
      return;
    }
    setUploads((prev) => ({ ...prev, [docId]: { file, date: new Date().toLocaleString(), uploading: true } }));
    try {
      const storagePath = `documents/${listingId || "temp"}/${docId}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploads((prev) => ({ ...prev, [docId]: { file, date: new Date().toLocaleString(), url: downloadURL, uploading: false, storagePath } }));
      if (listingId) {
        const docMetaItem = {
          docId,
          label: DOCUMENT_SLOTS.find((d) => d.id === docId)?.label || docId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          downloadURL,
          storagePath,
          uploadedAt: new Date().toISOString(),
          required: DOCUMENT_SLOTS.find((d) => d.id === docId)?.required || false,
        };
        await updateDoc(doc(db, "listings", listingId), { documents: arrayUnion(docMetaItem) });
        if (setExistingDocuments) {
          setExistingDocuments((prev: any[]) => [...prev, docMetaItem]);
        }
      }
    } catch (e) {
      console.error("[Tab4] upload failed", e);
      setUploads((prev) => ({ ...prev, [docId]: { file, date: new Date().toLocaleString(), uploading: false } }));
    }
  };
  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm("Delete this document?")) return;
    setDeletingDoc(docId);
    try {
      if (listingId) {
        const snap = await getDoc(doc(db, "listings", listingId));
        if (snap.exists()) {
          const updated = (snap.data().documents || []).filter((d: any) => d.docId !== docId);
          await updateDoc(doc(db, "listings", listingId), { documents: updated });
        }
      }
      setUploads((prev) => ({ ...prev, [docId]: null }));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingDoc(null);
    }
  };
  const handlePhotoUpload = async (categoryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    const total = Object.values(photos).reduce((s: number, a: any) => s + a.length, 0) + savedPhotos.length;
    if (total + incoming.length > 20) {
      alert(`Max 20 photos. You have ${total}.`);
      return;
    }
    for (const file of incoming) {
      const preview = URL.createObjectURL(file);
      setPhotos((prev: any) => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), { file, preview, date: new Date().toLocaleString() }] }));
      if (!listingId) continue;
      try {
        const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const storagePath = `photos/${listingId}/${categoryId}/${photoId}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "listings", listingId), {
          photos: arrayUnion({ photoId, categoryId, fileName: file.name, fileSize: file.size, fileType: file.type, downloadURL, storagePath, uploadedAt: new Date().toISOString() }),
        });
        setSavedPhotos((prev) => [...prev, { photoId, categoryId, fileName: file.name, downloadURL, storagePath, uploadedAt: new Date().toISOString() }]);
      } catch (e) {
        console.error("[Tab4] photo failed", e);
      }
    }
  };
  const handleDeleteSavedPhoto = async (photo: any) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      if (photo.storagePath) {
        try { await deleteObject(ref(storage, photo.storagePath)); } catch {}
      }
      if (listingId) {
        const snap = await getDoc(doc(db, "listings", listingId));
        if (snap.exists()) {
          const updated = (snap.data().photos || []).filter((p: any) => p.photoId !== photo.photoId);
          await updateDoc(doc(db, "listings", listingId), { photos: updated });
        }
      }
      setSavedPhotos((prev) => prev.filter((p) => p.photoId !== photo.photoId));
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteLocalPhoto = (categoryId: string, index: number) => {
    if (!window.confirm("Remove this photo?")) return;
    setPhotos((prev: any) => ({ ...prev, [categoryId]: prev[categoryId].filter((_: any, i: number) => i !== index) }));
  };
  const groupedChecklist = CHECKLIST_ITEMS.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  const uploadedRequired = DOCUMENT_SLOTS.filter((d) => d.required && uploads[d.id]?.url).length;
  const requiredDocs = DOCUMENT_SLOTS.filter((d) => d.required).length;
  const uploadedCount = Object.values(uploads).filter((u: any) => u?.url).length;
  const completedCount = Object.values(checklistState).filter((v) => v).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const totalPhotos = Object.values(photos).reduce((s: number, a: any) => s + a.length, 0) + savedPhotos.length;
  const shareUrl = listingId ? `https://getreadytopost.com/documents/view?id=${listingId}` : '';
  return (
    <div className="space-y-8">
      {/* Contract Day Calculator */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📋 Contract Day Calculator</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Days from Today</label>
            <input type="number" value={daysOut} onChange={(e) => setDaysOut(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
          </div>
          {calculatedDate && <div className="text-lg font-bold text-[#c9a227]">📅 {calculatedDate}</div>}
        </div>
      </div>
      {/* Document Upload Center */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📄 Document Upload Center</h2>
        <p className="text-gray-300 mb-6">Required: {uploadedRequired}/{requiredDocs} | Total: {uploadedCount}</p>
        <div className="space-y-4">
          {DOCUMENT_SLOTS.map((docSlot) => (
            <div key={docSlot.id} className="bg-white/5 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white font-semibold">
                  {docSlot.label}
                  {docSlot.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <div className="flex items-center gap-2">
                  {uploads[docSlot.id]?.url && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">✓ Uploaded</span>}
                  {uploads[docSlot.id]?.url && (
                    <>
                      <button onClick={() => handleViewClick(docSlot.id)} className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded transition">👁️ View</button>
                      <button onClick={() => handleDeleteDoc(docSlot.id)} disabled={deletingDoc === docSlot.id} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded transition disabled:opacity-50">
                        {deletingDoc === docSlot.id ? "⏳" : "🗑️ Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <input type="file" onChange={(e) => handleFileUpload(docSlot.id, e.target.files?.[0] || null)} disabled={uploads[docSlot.id]?.uploading} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c9a227] file:text-white hover:file:bg-[#b8911f] file:cursor-pointer disabled:opacity-50" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">💰 Price to Unlock ($)</label>
                  <input type="number" min="0" placeholder="0 = free" value={docMeta[docSlot.id]?.price || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], price: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">👤 Responsible Party</label>
                  <select value={docMeta[docSlot.id]?.party || "Buyer"} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], party: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm">
                    <option>Buyer</option>
                    <option>Seller</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">🔒 Access Code</label>
                  <div className="flex gap-2">
                    <input type={docMeta[docSlot.id]?.codeSaved ? "password" : "text"} placeholder="Optional code" value={docMeta[docSlot.id]?.accessCode || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], accessCode: e.target.value, codeSaved: false } }))} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />
                    <button onClick={async () => {
                      if (!listingId || !uploads[docSlot.id]?.url) return;
                      try {
                        const snap = await getDoc(doc(db, 'listings', listingId));
                        if (snap.exists()) {
                          const updated = (snap.data().documents || []).map((d: any) => d.docId === docSlot.id ? { ...d, accessCode: docMeta[docSlot.id]?.accessCode || '', price: docMeta[docSlot.id]?.price || '', party: docMeta[docSlot.id]?.party || 'Buyer', isPaid: docMeta[docSlot.id]?.price ? false : true } : d);
                          await updateDoc(doc(db, 'listings', listingId), { documents: updated });
                          alert('Saved!');
                          setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], codeSaved: true } }));
                        }
                      } catch(e) { alert('Save failed'); }
                    }} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap">💾 Save</button>
                  </div>
                </div>
              </div>
              {uploads[docSlot.id] && (
                <div className="mt-2 text-xs text-gray-300">
                  <p>📎 {uploads[docSlot.id]?.file.name}</p>
                  <p className="text-gray-400">Uploaded: {uploads[docSlot.id]?.date}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Property Photos */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📸 Property Photos</h2>
        <p className="text-gray-300 mb-6">Upload photos organized by category. Total: {totalPhotos}/20</p>
        <div className="space-y-6">
          {PHOTO_CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-white/5 rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-bold mb-3">{cat.label}</h3>
              <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(cat.id, e.target.files)} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer mb-3" />
              {(() => {
                const catSaved = savedPhotos.filter((p) => p.categoryId === cat.id);
                const catLocal = photos[cat.id] || [];
                const allPhotos = [
                  ...catSaved.map((p: any) => ({ src: p.downloadURL, date: p.uploadedAt ? new Date(p.uploadedAt).toLocaleString() : "", isSaved: true, photo: p })),
                  ...catLocal.map((p: any, i: number) => ({ src: p.preview, date: p.date, isSaved: false, localIndex: i })),
                ];
                if (allPhotos.length === 0) return null;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allPhotos.map((item: any, i: number) => (
                      <div key={i} className="relative group">
                        <img src={item.src} alt={cat.label} className="w-full h-32 object-cover rounded-lg" />
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">{item.date}</p>
                          {item.isSaved ? (
                            <button onClick={() => handleDeleteSavedPhoto(item.photo)} className="text-xs text-red-400 hover:text-red-300 transition">🗑️</button>
                          ) : (
                            <button onClick={() => handleDeleteLocalPhoto(cat.id, item.localIndex)} className="text-xs text-red-400 hover:text-red-300 transition">🗑️</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
      {/* Pre-Listing Checklist */}
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
                    <input type="checkbox" checked={checklistState[item.id] || false} onChange={() => toggleChecklist(item.id)} className="w-5 h-5 accent-[#c9a227]" />
                    <span className={"text-white " + (checklistState[item.id] ? "line-through opacity-60" : "")}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Notes */}
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
      {/* Share Documents with Buyer */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-bold text-lg mb-1">🔗 Share Documents with Buyer</h3>
        <p className="text-gray-400 text-sm mb-4">Set a master access code and share the link below with your buyer or seller.</p>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black"
            placeholder="Set master access code (e.g. SMITH2024)"
            value={documentAccessCode || ''}
            onChange={(e) => setDocumentAccessCode(e.target.value)}
          />
        </div>
        {listingId && documentAccessCode && (
          <div className="bg-white/5 border border-white/20 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">Shareable link:</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 text-[#c9a227] text-sm break-all">
                {shareUrl}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition"
              >
                {codeCopied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2">Access code: <span className="text-white font-bold">{documentAccessCode}</span></p>
          </div>
        )}
        {listingId && !documentAccessCode && (
          <p className="text-yellow-400 text-sm">⚠️ Set an access code above to generate the share link.</p>
        )}
        {!listingId && (
          <p className="text-yellow-400 text-sm">⚠️ Save the listing first to generate the share link.</p>
        )}
      </div>
      {/* Access Code Prompt Modal */}
      {viewCodePending && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-md p-8">
            <h3 className="text-white font-bold text-xl mb-4">🔒 Enter Access Code</h3>
            <p className="text-gray-400 text-sm mb-4">This document is protected. Enter the access code to view.</p>
            <input
              type="text"
              value={viewCodeInput}
              onChange={(e) => { setViewCodeInput(e.target.value); setViewCodeError(false); }}
              placeholder="Enter access code"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black mb-3"
              onKeyDown={(e) => { if (e.key === 'Enter') handleViewCodeSubmit(); }}
            />
            {viewCodeError && <p className="text-red-400 text-sm mb-3">❌ Incorrect code. Try again.</p>}
            <div className="flex gap-3">
              <button onClick={handleViewCodeSubmit} className="flex-1 bg-[#c9a227] hover:bg-[#b8911f] text-white px-4 py-3 rounded-xl font-bold transition">Unlock</button>
              <button onClick={() => { setViewCodePending(null); setViewCodeInput(""); setViewCodeError(false); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-bold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Document Viewer Modal */}
      {viewingDoc && uploads[viewingDoc]?.url && (() => {
        const url = String(uploads[viewingDoc]?.url || "");
        const lower = url.toLowerCase();
        const isPdf = lower.includes(".pdf");
        const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(lower);
        const title = uploads[viewingDoc]?.file?.name || uploads[viewingDoc]?.fileName || "Document";
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-white/20 p-4 flex justify-between items-center">
                <h3 className="text-white font-bold">{title}</h3>
                <button onClick={() => setViewingDoc(null)} className="text-gray-300 hover:text-white text-2xl">✕</button>
              </div>
              <div className="p-6">
                {isPdf ? (
                  <iframe src={url} className="w-full h-[600px] rounded-lg border border-white/10" title="PDF Viewer" />
                ) : isImage ? (
                  <img src={url} alt={title} className="max-w-full h-auto rounded-lg border border-white/10" />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-300 mb-4">Preview not available for this file type</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">📥 Download File</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      {/* Next Button */}
      <div className="flex justify-end">
        <button onClick={onNext} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
          Next: Save to Vault →
        </button>
      </div>
    </div>
  );
}
