"use client";
import { useEffect, useRef, useState } from "react";
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

const MAX_PHOTOS = 20;

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
  address,
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
  userId,
  documentAccessCode,
  setDocumentAccessCode,
}: any) {
  const [uploads, setUploads] = useState<Record<string, any>>({});
  const [docMeta, setDocMeta] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    DOCUMENT_SLOTS.forEach((d) => {
      defaults[d.id] = { price: "", party: "Buyer", accessCode: "", codeSaved: false, sharedWithBuyer: false };
    });
    return defaults;
  });
  const [savedPhotos, setSavedPhotos] = useState<any[]>([]);
  const [googlePhoto, setGooglePhoto] = useState<any>(null);
  const [googlePhotoLoading, setGooglePhotoLoading] = useState(false);
  const [googlePhotoError, setGooglePhotoError] = useState("");
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
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<{ categoryId: string; index: number; isSaved: boolean } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  useEffect(() => {
    if (listingId) setShareUrl("https://getreadytopost.com/documents/view?id=" + listingId);
  }, [listingId]);

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
      const metaUpdate: Record<string, any> = {};
      existingDocuments.forEach((d: any) => {
        metaUpdate[d.docId] = {
          price: d.price || "",
          party: d.party || "Buyer",
          accessCode: d.accessCode || "",
          codeSaved: !!d.accessCode,
          sharedWithBuyer: d.sharedWithBuyer === true,
        };
      });
      setDocMeta((prev) => ({ ...prev, ...metaUpdate }));
    }
  }, [existingDocuments]);

  useEffect(() => {
    if (existingPhotos && existingPhotos.length > 0) setSavedPhotos(existingPhotos);
  }, [existingPhotos]);

  useEffect(() => {
    if (!listingId) return;
    const loadGooglePhoto = async () => {
      try {
        const snap = await getDoc(doc(db, "listings", listingId));
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.googlePhoto) setGooglePhoto(data.googlePhoto);
        }
      } catch (e) {
        console.error("[Tab4] failed loading google photo", e);
      }
    };
    loadGooglePhoto();
  }, [listingId]);

  const toggleChecklist = (id: string) =>
    setChecklistState((prev: any) => ({ ...prev, [id]: !prev[id] }));

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

  const handleSaveAccessCode = async () => {
    if (!listingId) return;
    setSavingCode(true);
    try {
      await updateDoc(doc(db, "listings", listingId), { documentAccessCode });
      setCodeSaved(true);
    } catch (e) {
      alert("Failed to save access code");
    } finally {
      setSavingCode(false);
    }
  };

  const handleShareClick = () => {
    if (!listingId) {
      alert("Save the listing first before sharing.");
      return;
    }
    if (!documentAccessCode) {
      setShowShareConfirm(true);
    } else {
      handleSaveAccessCode().then(() => setCodeCopied(false));
    }
  };

  const handleSaveDocMeta = async (docId: string) => {
    if (!listingId) {
      alert("No listing ID found.");
      return;
    }
    if (!window.confirm("Save settings for this document?")) return;
    try {
      const listingRef = doc(db, "listings", listingId);
      const snap = await getDoc(listingRef);
      if (!snap.exists()) {
        alert("Listing not found in Firestore.");
        return;
      }
      const allDocs = snap.data().documents || [];
      const meta = docMeta[docId] || {};
      const upload = uploads[docId] || {};
      const slot = DOCUMENT_SLOTS.find((d) => d.id === docId);
      let found = false;
      const updated = allDocs.map((d: any) => {
        if (d.docId !== docId) return d;
        found = true;
        return {
          ...d,
          accessCode: meta.accessCode || "",
          price: meta.price || "",
          party: meta.party || "Buyer",
          sharedWithBuyer: meta.sharedWithBuyer === true,
        };
      });
      const finalDocs = found
        ? updated
        : [
            ...allDocs,
            {
              docId,
              label: slot?.label || docId,
              required: !!slot?.required,
              fileName: upload?.file?.name || "",
              fileSize: upload?.file?.size || 0,
              fileType: upload?.file?.type || "",
              downloadURL: upload?.url || "",
              storagePath: upload?.storagePath || "",
              uploadedAt: new Date().toISOString(),
              accessCode: meta.accessCode || "",
              price: meta.price || "",
              party: meta.party || "Buyer",
              sharedWithBuyer: meta.sharedWithBuyer === true,
            },
          ];
      await updateDoc(listingRef, { documents: finalDocs });
      if (setExistingDocuments) setExistingDocuments(finalDocs);
      setDocMeta((prev) => ({ ...prev, [docId]: { ...prev[docId], codeSaved: true } }));
      alert("Document settings saved.");
    } catch (e: any) {
      alert("Error: " + (e?.message || "unknown"));
    }
  };

  const handleFileUpload = async (docId: string, file: File | null) => {
    if (!file) {
      setUploads((prev) => ({ ...prev, [docId]: null }));
      return;
    }
    setUploads((prev) => ({ ...prev, [docId]: { file, date: new Date().toLocaleString(), uploading: true } }));
    try {
      const storagePath = "documents/" + (listingId || "temp") + "/" + docId + "/" + file.name;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploads((prev) => ({
        ...prev,
        [docId]: { file, date: new Date().toLocaleString(), url: downloadURL, uploading: false, storagePath },
      }));
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
          sharedWithBuyer: false,
        };
        const snap = await getDoc(doc(db, "listings", listingId));
        if (snap.exists()) {
          const allDocs = snap.data().documents || [];
          const updated = allDocs.filter((d: any) => d.docId !== docId).concat([docMetaItem]);
          await updateDoc(doc(db, "listings", listingId), { documents: updated });
          if (setExistingDocuments) setExistingDocuments(updated);
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
      if (setExistingDocuments) {
        setExistingDocuments((prev: any[]) => prev.filter((d: any) => d.docId !== docId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingDoc(null);
    }
  };

  const handleDeleteSavedPhoto = async (photo: any) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      if (photo.storagePath) {
        const storageRef = ref(storage, photo.storagePath);
        await deleteObject(storageRef);
      }
      if (listingId) {
        const snap = await getDoc(doc(db, "listings", listingId));
        if (snap.exists()) {
          const updated = (snap.data().photos || []).filter((p: any) => p.downloadURL !== photo.downloadURL);
          await updateDoc(doc(db, "listings", listingId), { photos: updated });
        }
      }
      setSavedPhotos((prev) => prev.filter((p) => p.downloadURL !== photo.downloadURL));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLocalPhoto = (categoryId: string, index: number) => {
    setPhotos((prev: any) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleUnlockGooglePhoto = async () => {
    if (!listingId) {
      alert("No listing found yet.");
      return;
    }
    setGooglePhotoLoading(true);
    setGooglePhotoError("");
    try {
      const res = await fetch("/api/workspace/fetch-google-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch Google photo.");
      if (data.googlePhoto) setGooglePhoto(data.googlePhoto);
    } catch (e: any) {
      console.error("[Tab4] google photo unlock failed", e);
      setGooglePhotoError(e?.message || "Failed to unlock Google photo.");
    } finally {
      setGooglePhotoLoading(false);
    }
  };

  const completedCount = Object.values(checklistState || {}).filter(Boolean).length;
  const totalPhotos =
    Object.values(photos || {}).reduce((sum: number, arr: any) => sum + ((arr as any[])?.length || 0), 0) +
    savedPhotos.length;
  const remainingPhotoSlots = Math.max(0, MAX_PHOTOS - totalPhotos);
  const totalCount = CHECKLIST_ITEMS.length;

  const handlePhotoUpload = async (categoryId: string, files: FileList | null) => {
    if (!files) return;
    const incomingFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (incomingFiles.length === 0) {
      alert("Please upload image files only.");
      return;
    }
    if (remainingPhotoSlots <= 0) {
      alert(`Photo limit reached. You can only upload up to ${MAX_PHOTOS} photos total.`);
      return;
    }
    if (incomingFiles.length > remainingPhotoSlots) {
      alert(`You only have ${remainingPhotoSlots} photo slot${remainingPhotoSlots !== 1 ? "s" : ""} remaining.`);
      return;
    }
    const newPhotos = incomingFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      date: new Date().toLocaleString(),
    }));
    setPhotos((prev: any) => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), ...newPhotos],
    }));
  };

  const groupedChecklist = CHECKLIST_ITEMS.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sharedCount = DOCUMENT_SLOTS.filter((slot) => docMeta[slot.id]?.sharedWithBuyer).length;
  return (
    <div className="space-y-8">
      {/* Share Access Code Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">🔗 Buyer Document Access</h3>
            <p className="text-gray-400 text-sm">
              Set a master access code for this listing's documents. Share the link with your buyer.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input
              type="text"
              placeholder="Access code (optional)"
              value={documentAccessCode || ""}
              onChange={(e) => setDocumentAccessCode(e.target.value)}
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={handleShareClick}
              disabled={savingCode}
              className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-4 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50"
            >
              {savingCode ? "Saving..." : codeSaved ? "✅ Saved" : "Save & Share"}
            </button>
            {shareUrl && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition border border-white/20"
              >
                {codeCopied ? "✅ Copied!" : "📋 Copy Link"}
              </button>
            )}
          </div>
        </div>
        {shareUrl && (
          <div className="mt-3 bg-white/5 rounded-lg px-4 py-2 text-xs text-gray-300 font-mono break-all">
            {shareUrl}
          </div>
        )}
        {showShareConfirm && (
          <div className="mt-4 bg-yellow-900/40 border border-yellow-500/40 rounded-xl p-4">
            <p className="text-yellow-200 text-sm mb-3">
              ⚠️ No access code set. Documents will be accessible to anyone with the link. Continue?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowShareConfirm(false); handleSaveAccessCode(); }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
              >
                Yes, Share Without Code
              </button>
              <button
                onClick={() => setShowShareConfirm(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">📄 Listing Documents</h3>
          <span className="text-xs text-gray-400">{sharedCount} shared with buyer</span>
        </div>
        <div className="space-y-4">
          {DOCUMENT_SLOTS.map((slot) => {
            const upload = uploads[slot.id];
            const meta = docMeta[slot.id] || {};
            const isUploaded = !!(upload?.url);
            const isUploading = upload?.uploading;
            const isDeleting = deletingDoc === slot.id;
            const isViewing = viewingDoc === slot.id;
            return (
              <div key={slot.id} className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{isUploaded ? "📄" : "📭"}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{slot.label}</p>
                      {slot.required && (
                        <span className="text-xs text-red-400 font-semibold">Required</span>
                      )}
                      {upload?.file && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {upload.file.name} · {upload.date}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {!isUploaded ? (
                      <>
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition border border-white/20">
                          {isUploading ? "Uploading..." : "📎 Upload"}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(slot.id, e.target.files?.[0] || null)}
                            disabled={isUploading}
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleViewClick(slot.id)}
                          className="bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          👁 View
                        </button>
                        <a
                          href={upload.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition border border-white/20"
                        >
                          ⬇ Download
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(slot.id)}
                          disabled={isDeleting}
                          className="bg-red-900/60 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "🗑 Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Document Settings */}
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Price / Cost</label>
                    <input
                      type="text"
                      placeholder="e.g. $350"
                      value={meta.price || ""}
                      onChange={(e) =>
                        setDocMeta((prev) => ({ ...prev, [slot.id]: { ...prev[slot.id], price: e.target.value } }))
                      }
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Paid By</label>
                    <select
                      value={meta.party || "Buyer"}
                      onChange={(e) =>
                        setDocMeta((prev) => ({ ...prev, [slot.id]: { ...prev[slot.id], party: e.target.value } }))
                      }
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-400"
                    >
                      <option value="Buyer">Buyer</option>
                      <option value="Seller">Seller</option>
                      <option value="Split">Split</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Doc Access Code</label>
                    <input
                      type="text"
                      placeholder="Optional per-doc code"
                      value={meta.accessCode || ""}
                      onChange={(e) =>
                        setDocMeta((prev) => ({ ...prev, [slot.id]: { ...prev[slot.id], accessCode: e.target.value, codeSaved: false } }))
                      }
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={meta.sharedWithBuyer === true}
                      onChange={(e) =>
                        setDocMeta((prev) => ({
                          ...prev,
                          [slot.id]: { ...prev[slot.id], sharedWithBuyer: e.target.checked },
                        }))
                      }
                      className="accent-yellow-400 w-4 h-4"
                    />
                    <span className="text-xs text-gray-300">Share with Buyer</span>
                  </label>
                  <button
                    onClick={() => handleSaveDocMeta(slot.id)}
                    className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    💾 Save Settings
                  </button>
                  {meta.codeSaved && (
                    <span className="text-xs text-green-400">✅ Settings saved</span>
                  )}
                </div>

                {/* Inline doc viewer */}
                {isViewing && upload?.url && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/20">
                    {upload.file?.type?.includes("pdf") || upload.url?.includes(".pdf") ? (
                      <iframe src={upload.url} className="w-full h-96" title={slot.label} />
                    ) : (
                      <img src={upload.url} alt={slot.label} className="w-full max-h-96 object-contain bg-black" />
                    )}
                    <button
                      onClick={() => setViewingDoc(null)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-2 text-xs font-bold"
                    >
                      Close Preview
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* View Code Modal */}
      {viewCodePending && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a2b4a] border border-white/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">🔒 Enter Access Code</h3>
            <p className="text-gray-400 text-sm mb-4">This document is protected. Enter the access code to view it.</p>
            <input
              type="password"
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-3 mb-3 focus:outline-none focus:border-yellow-400 text-center text-xl tracking-widest"
              placeholder="••••••••"
              value={viewCodeInput}
              onChange={(e) => { setViewCodeInput(e.target.value); setViewCodeError(false); }}
              autoFocus
            />
            {viewCodeError && <p className="text-red-400 text-sm text-center mb-3">Incorrect code. Try again.</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setViewCodePending(null); setViewCodeInput(""); setViewCodeError(false); }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleViewCodeSubmit}
                className="flex-1 bg-[#c9a227] hover:bg-[#b8911f] text-white py-2 rounded-lg font-bold text-sm"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Google Street View Photo */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">🗺️ Google Street View Photo</h3>
        </div>
        {googlePhoto ? (
          <div className="rounded-xl overflow-hidden border border-white/20">
            <img src={googlePhoto.url} alt="Street View" className="w-full max-h-64 object-cover" />
            <p className="text-xs text-gray-400 text-center py-2">{googlePhoto.attribution || "Google Street View"}</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">
              Unlock a Google Street View photo for this property address.
            </p>
            {googlePhotoError && (
              <p className="text-red-400 text-xs mb-3">{googlePhotoError}</p>
            )}
            <button
              onClick={handleUnlockGooglePhoto}
              disabled={googlePhotoLoading || !listingId}
              className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50"
            >
              {googlePhotoLoading ? "Fetching..." : "🔓 Unlock Street View Photo"}
            </button>
          </div>
        )}
      </div>

      {/* Photo Upload Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">📸 Listing Photos</h3>
          <span className="text-xs text-gray-400">
            {totalPhotos}/{MAX_PHOTOS} photos uploaded
          </span>
        </div>

        {/* Saved Photos */}
        {savedPhotos.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3 font-semibold">Previously Saved Photos</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {savedPhotos.map((photo, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-square">
                  <img src={photo.downloadURL} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteSavedPhoto(photo)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold"
                    >
                      🗑 Delete
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-gray-300 px-1 py-0.5 truncate">
                    {photo.category || "Photo"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Upload Zones */}
        <div className="space-y-4">
          {PHOTO_CATEGORIES.map((cat) => {
            const catPhotos = photos?.[cat.id] || [];
            const isDragOver = dragOverCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`rounded-xl border-2 border-dashed p-4 transition ${
                  isDragOver ? "border-yellow-400 bg-yellow-400/10" : "border-white/20 bg-white/5"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCategory(cat.id); }}
                onDragLeave={() => setDragOverCategory(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCategory(null);
                  handlePhotoUpload(cat.id, e.dataTransfer.files);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold text-sm">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{catPhotos.length} photo{catPhotos.length !== 1 ? "s" : ""}</span>
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold transition border border-white/20">
                      + Add
                      <input
                        ref={(el) => { fileInputRefs.current[cat.id] = el; }}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(cat.id, e.target.files)}
                        disabled={remainingPhotoSlots <= 0}
                      />
                    </label>
                  </div>
                </div>
                {catPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {catPhotos.map((photo: any, i: number) => (
                      <div
                        key={i}
                        draggable
                        onDragStart={() => setDraggedPhoto({ categoryId: cat.id, index: i, isSaved: false })}
                        onDragEnd={() => setDraggedPhoto(null)}
                        className="relative group rounded-lg overflow-hidden border border-white/10 aspect-square cursor-grab"
                      >
                        <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteLocalPhoto(cat.id, i)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs text-center py-4">
                    Drag & drop or click "+ Add" to upload {cat.label.toLowerCase()}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {remainingPhotoSlots <= 0 && (
          <div className="mt-4 bg-yellow-900/40 border border-yellow-500/40 rounded-xl p-3 text-center">
            <p className="text-yellow-200 text-sm">
              📸 Photo limit reached ({MAX_PHOTOS} max). Delete a photo to add more.
            </p>
          </div>
        )}
      </div>

      {/* Checklist Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">✅ Listing Checklist</h3>
          <span className="text-sm text-gray-300">
            {completedCount}/{totalCount} complete
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all"
            style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
          />
        </div>
        <div className="space-y-6">
          {Object.entries(groupedChecklist).map(([category, items]: [string, any]) => (
            <div key={category}>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{category}</h4>
              <div className="space-y-2">
                {items.map((item: any) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={!!checklistState[item.id]}
                      onChange={() => toggleChecklist(item.id)}
                      className="accent-yellow-400 w-4 h-4 flex-shrink-0"
                    />
                    <span className={`text-sm ${checklistState[item.id] ? "text-green-400 line-through" : "text-white"}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">📝 Agent Notes</h3>
        <textarea
          value={notes || ""}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add private notes about this listing (visible only to you)..."
          rows={5}
          className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">Notes are saved when you save the listing package.</p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-[#c9a227] to-[#e6b830] hover:from-[#b8911f] hover:to-[#d4a72a] text-white px-10 py-3 rounded-xl font-bold text-base transition shadow-xl"
        >
          Continue to Save →
        </button>
      </div>
    </div>
  );
}

