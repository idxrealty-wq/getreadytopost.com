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
  checklistState, setChecklistState, notes, setNotes, photos, setPhotos,
  existingPhotos, existingDocuments, setExistingDocuments, onNext,
  listingId, documentAccessCode, setDocumentAccessCode,
}: any) {
  const [uploads, setUploads] = useState<Record<string, any>>({});
  const [docMeta, setDocMeta] = useState<Record<string, { price: string; party: string; accessCode: string; codeSaved?: boolean; sharedWithBuyer: boolean }>>(() => {
    const defaults: Record<string, any> = {};
    DOCUMENT_SLOTS.forEach((d) => { defaults[d.id] = { price: "", party: "Buyer", accessCode: "", codeSaved: false, sharedWithBuyer: false }; });
    return defaults;
  });
  const [savedPhotos, setSavedPhotos] = useState<any[]>([]);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [viewCodeInput, setViewCodeInput] = useState("");
  const [viewCodeError, setViewCodeError] = useState(false);
  const [viewCodePending, setViewCodePending] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [savingCode, setSavingCode] = useState(false);
  const [codeSaved, setCodeSaved] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (listingId) setShareUrl("https://getreadytopost.com/documents/view?id=" + listingId);
  }, [listingId]);

  useEffect(() => {
    if (existingDocuments && existingDocuments.length > 0) {
      const loaded: Record<string, any> = {};
      existingDocuments.forEach((d: any) => {
        loaded[d.docId] = { file: { name: d.fileName } as File, date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "", url: d.downloadURL, uploading: false, storagePath: d.storagePath || null };
      });
      setUploads(loaded);
      const metaUpdate: Record<string, any> = {};
      existingDocuments.forEach((d: any) => {
        metaUpdate[d.docId] = { price: d.price || "", party: d.party || "Buyer", accessCode: d.accessCode || "", codeSaved: !!d.accessCode, sharedWithBuyer: d.sharedWithBuyer === true };
      });
      setDocMeta((prev) => ({ ...prev, ...metaUpdate }));
    }
  }, [existingDocuments]);

  useEffect(() => {
    if (existingPhotos && existingPhotos.length > 0) setSavedPhotos(existingPhotos);
  }, [existingPhotos]);

  const toggleChecklist = (id: string) => setChecklistState((prev: any) => ({ ...prev, [id]: !prev[id] }));

  const handleViewClick = (docId: string) => {
    const code = docMeta[docId]?.accessCode || "";
    if (!code) { setViewingDoc(docId); }
    else { setViewCodePending(docId); setViewCodeInput(""); setViewCodeError(false); }
  };

  const handleViewCodeSubmit = () => {
    if (!viewCodePending) return;
    const code = docMeta[viewCodePending]?.accessCode || "";
    if (viewCodeInput.trim() === code.trim()) {
      setViewingDoc(viewCodePending); setViewCodePending(null); setViewCodeInput(""); setViewCodeError(false);
    } else { setViewCodeError(true); }
  };

  const handleSaveAccessCode = async () => {
    if (!listingId) return;
    setSavingCode(true);
    try {
      await updateDoc(doc(db, "listings", listingId), { documentAccessCode });
      setCodeSaved(true);
    } catch (e) { alert("Failed to save access code"); }
    finally { setSavingCode(false); }
  };

  const handleShareClick = () => {
    if (!listingId) { alert("Save the listing first before sharing."); return; }
    if (!documentAccessCode) { setShowShareConfirm(true); }
    else { handleSaveAccessCode().then(() => setCodeCopied(false)); }
  };

  const handleSaveDocMeta = async (docId: string) => {
    if (!listingId) { alert("No listing ID found."); return; }
    
    try {
      const listingRef = doc(db, "listings", listingId);
      const snap = await getDoc(listingRef);
      if (!snap.exists()) { alert("Listing not found in Firestore."); return; }
      const allDocs = snap.data().documents || [];
      const meta = docMeta[docId] || {};
      let found = false;
      const updated = allDocs.map((d: any) => {
        if (d.docId !== docId) return d;
        found = true;
        return { ...d, accessCode: meta.accessCode || "", price: meta.price || "", party: meta.party || "Buyer", sharedWithBuyer: meta.sharedWithBuyer === true };
      });
      if (!found) { alert("Doc not found in Firestore. Total docs: " + allDocs.length); return; }
      await updateDoc(listingRef, { documents: updated });
      setDocMeta((prev) => ({ ...prev, [docId]: { ...prev[docId], codeSaved: true } }));
      
    } catch (e: any) { alert("Error: " + (e?.message || "unknown")); }
  };

  const handleFileUpload = async (docId: string, file: File | null) => {
    if (!file) { setUploads((prev) => ({ ...prev, [docId]: null })); return; }
    setUploads((prev) => ({ ...prev, [docId]: { file, date: new Date().toLocaleString(), uploading: true } }));
    try {
      const storagePath = "documents/" + (listingId || "temp") + "/" + docId + "/" + file.name;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploads((prev) => ({ ...prev, [docId]: { file, date: new Date().toLocaleString(), url: downloadURL, uploading: false, storagePath } }));
      if (listingId) {
        const docMetaItem = { docId, label: DOCUMENT_SLOTS.find((d) => d.id === docId)?.label || docId, fileName: file.name, fileSize: file.size, fileType: file.type, downloadURL, storagePath, uploadedAt: new Date().toISOString(), required: DOCUMENT_SLOTS.find((d) => d.id === docId)?.required || false, sharedWithBuyer: false };
        await updateDoc(doc(db, "listings", listingId), { documents: arrayUnion(docMetaItem) });
        if (setExistingDocuments) setExistingDocuments((prev: any[]) => [...prev, docMetaItem]);
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
    } catch (e) { console.error(e); }
    finally { setDeletingDoc(null); }
  };

  const handleDeleteSavedPhoto = async (photo: any) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      if (photo.storagePath) { const storageRef = ref(storage, photo.storagePath); await deleteObject(storageRef); }
      if (listingId) {
        const snap = await getDoc(doc(db, "listings", listingId));
        if (snap.exists()) {
          const updated = (snap.data().photos || []).filter((p: any) => p.downloadURL !== photo.downloadURL);
          await updateDoc(doc(db, "listings", listingId), { photos: updated });
        }
      }
      setSavedPhotos((prev) => prev.filter((p) => p.downloadURL !== photo.downloadURL));
    } catch (e) { console.error(e); }
  };

  const handleDeleteLocalPhoto = (categoryId: string, index: number) => {
    setPhotos((prev: any) => ({ ...prev, [categoryId]: (prev[categoryId] || []).filter((_: any, i: number) => i !== index) }));
  };

  const handlePhotoUpload = (categoryId: string, files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files).map((file) => ({ file, preview: URL.createObjectURL(file), date: new Date().toLocaleString() }));
    setPhotos((prev: any) => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), ...newPhotos] }));
  };

  const totalPhotos = savedPhotos.length + Object.values(photos).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0);
  const completedCount = Object.values(checklistState).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const groupedChecklist = CHECKLIST_ITEMS.reduce((acc: any, item) => { if (!acc[item.category]) acc[item.category] = []; acc[item.category].push(item); return acc; }, {});
  const sharedCount = DOCUMENT_SLOTS.filter((slot) => docMeta[slot.id]?.sharedWithBuyer).length;
  return (
    <div className="space-y-8">

      {/* Share Link */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2">Buyer Document Share Link</h2>
        <p className="text-gray-300 mb-6 text-sm">Set an access code and choose which documents to share. Only documents marked "Include in share link" will be visible to the buyer. <span className="text-[#c9a227] font-semibold">{sharedCount} document{sharedCount !== 1 ? "s" : ""} selected for sharing.</span></p>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            value={documentAccessCode}
            onChange={(e) => { setDocumentAccessCode(e.target.value); setCodeSaved(false); }}
            placeholder="Set access code (e.g. SMITH2024)"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black"
          />
          <button onClick={handleShareClick} disabled={savingCode} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
            {savingCode ? "Saving..." : "Save & Generate Link"}
          </button>
        </div>
        {codeSaved && shareUrl && (
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-gray-300 text-sm mb-2">Share this link with your buyer:</p>
            <div className="flex items-center gap-3">
              <code className="text-[#c9a227] text-sm break-all flex-1">{shareUrl}</code>
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCodeCopied(true); }} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap">
                {codeCopied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-2">Transaction Documents</h2>
        <p className="text-gray-300 mb-6 text-sm">Upload documents, set access codes, and check "Include in share link" to control what the buyer sees.</p>
        <div className="space-y-6">
          {DOCUMENT_SLOTS.map((docSlot) => (
            <div key={docSlot.id} className="bg-white/5 rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">{docSlot.label} {docSlot.required && <span className="text-red-400 text-xs ml-1">Required</span>}</h3>
                {uploads[docSlot.id]?.url && (
                  <div className="flex gap-2">
                    <button onClick={() => handleViewClick(docSlot.id)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition">View</button>
                    <button onClick={() => handleDeleteDoc(docSlot.id)} disabled={deletingDoc === docSlot.id} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50">
                      {deletingDoc === docSlot.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
              {uploads[docSlot.id] ? (
                <div className="mb-3 text-sm text-gray-300">
                  {uploads[docSlot.id].uploading ? (
                    <span className="text-yellow-400">Uploading...</span>
                  ) : (
                    <span className="text-green-400">{uploads[docSlot.id].file?.name} â€” uploaded {uploads[docSlot.id].date}</span>
                  )}
                </div>
              ) : (
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(docSlot.id, e.target.files?.[0] || null)} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer mb-3" />
              )}
              {uploads[docSlot.id]?.url && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer bg-[#c9a227]/10 hover:bg-[#c9a227]/20 border border-[#c9a227]/40 p-3 rounded-xl transition">
                      <input
                        type="checkbox"
                        checked={docMeta[docSlot.id]?.sharedWithBuyer || false}
                        onChange={async (e) => {
                        const checked = e.target.checked;
                        setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], sharedWithBuyer: checked, codeSaved: false } }));
                        if (listingId) {
                          try {
                            const listingRef = doc(db, "listings", listingId);
                            const snap = await getDoc(listingRef);
                            if (snap.exists()) {
                              const updated = (snap.data().documents || []).map((d: any) => d.docId !== docSlot.id ? d : { ...d, sharedWithBuyer: checked });
                              await updateDoc(listingRef, { documents: updated });
                            }
                          } catch (err) { console.error(err); }
                        }
                      }}
                        className="w-5 h-5 accent-[#c9a227]"
                      />
                      <span className="text-white font-semibold text-sm">Include in buyer share link</span>
                      {docMeta[docSlot.id]?.sharedWithBuyer && <span className="ml-auto text-[#c9a227] text-xs font-bold">WILL BE SHARED</span>}
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Access Code (optional)</label>
                    <input type="text" value={docMeta[docSlot.id]?.accessCode || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], accessCode: e.target.value, codeSaved: false } }))} placeholder="e.g. SMITH2024" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Visible To</label>
                    <select value={docMeta[docSlot.id]?.party || "Buyer"} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], party: e.target.value, codeSaved: false } }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm">
                      <option>Buyer</option>
                      <option>Seller</option>
                      <option>Both</option>
                      <option>Agent Only</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <button onClick={() => handleSaveDocMeta(docSlot.id)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-5 py-2 rounded-lg text-sm font-bold transition">
                      {docMeta[docSlot.id]?.codeSaved ? "Saved!" : "Save Settings"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Property Photos */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Property Photos</h2>
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
                            <button onClick={() => handleDeleteSavedPhoto(item.photo)} className="text-xs text-red-400 hover:text-red-300 transition">Delete</button>
                          ) : (
                            <button onClick={() => handleDeleteLocalPhoto(cat.id, item.localIndex)} className="text-xs text-red-400 hover:text-red-300 transition">Remove</button>
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
        <h2 className="text-2xl font-bold text-white mb-4">Pre-Listing Checklist</h2>
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
        <h2 className="text-2xl font-bold text-white mb-4">Notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes, reminders, or special instructions..." rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none resize-none" />
      </div>
      {/* No-Code Warning Modal */}
      {showShareConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-md p-8">
            <h3 className="text-white font-bold text-xl mb-3 text-center">No Access Code Set</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">This link is not password protected. Anyone with the link can view all shared documents. Do you want to add an access code first?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowShareConfirm(false)} className="flex-1 bg-[#c9a227] hover:bg-[#b8911f] text-white px-4 py-3 rounded-xl font-bold transition">Add Code First</button>
              <button onClick={async () => { setShowShareConfirm(false); await handleSaveAccessCode(); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-bold transition">Share Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Access Code Prompt Modal */}
      {viewCodePending && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-md p-8">
            <h3 className="text-white font-bold text-xl mb-4">Enter Access Code</h3>
            <p className="text-gray-400 text-sm mb-4">This document is protected. Enter the access code to view.</p>
            <input type="text" value={viewCodeInput} onChange={(e) => { setViewCodeInput(e.target.value); setViewCodeError(false); }} placeholder="Enter access code" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black mb-3" onKeyDown={(e) => { if (e.key === "Enter") handleViewCodeSubmit(); }} />
            {viewCodeError && <p className="text-red-400 text-sm mb-3">Incorrect code. Try again.</p>}
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
        const title = uploads[viewingDoc]?.file?.name || "Document";
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-white/20 p-4 flex justify-between items-center">
                <h3 className="text-white font-bold">{title}</h3>
                <button onClick={() => setViewingDoc(null)} className="text-gray-300 hover:text-white text-2xl font-bold">X</button>
              </div>
              <div className="p-6">
                {isPdf ? (
                  <iframe src={url} className="w-full h-[600px] rounded-lg border border-white/10" title="PDF Viewer" />
                ) : isImage ? (
                  <img src={url} alt={title} className="max-w-full h-auto rounded-lg border border-white/10" />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-300 mb-4">Preview not available for this file type</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">Download File</a>
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
          Next: Save to Vault
        </button>
      </div>
    </div>
  );
}

