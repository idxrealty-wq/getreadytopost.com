"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type DocPayload = {
  docId: string;
  label: string;
  fileName: string;
  fileType: string;
};

function Inner() {
  const params = useParams();
  const searchParams = useSearchParams();

  const docId = String((params as any)?.docId || "").trim();
  const listingId = String(searchParams.get("id") || "").trim();

  const storageKey = useMemo(() => {
    return listingId ? `grtp_doc_access_code:${listingId}` : `grtp_doc_access_code:unknown`;
  }, [listingId]);

  const [accessCode, setAccessCode] = useState("");
  const [showGate, setShowGate] = useState(true);

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState("");
  const [doc, setDoc] = useState<DocPayload | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey) || "";
      if (saved.trim()) {
        setAccessCode(saved.trim());
        setShowGate(false);
      } else {
        setShowGate(true);
      }
    } catch {
      setShowGate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const fetchDocMeta = async (code: string) => {
    if (!listingId) {
      setError("Missing listing id in URL. Use /documents/view/[docId]?id=LISTING_ID");
      setShowGate(true);
      return;
    }
    if (!docId) {
      setError("Missing document id.");
      setShowGate(true);
      return;
    }

    setLoading(true);
    setError("");
    setPreviewUrl("");

    try {
      const res = await fetch("/api/documents/get-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          docId,
          accessCode: String(code || "").trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDoc(null);
        setAddress("");
        setShowGate(true);
        setError(data?.error || "Invalid access code");
        return;
      }

      const d = data?.document || null;
      if (!d?.docId) {
        setShowGate(true);
        setError("Document metadata missing.");
        return;
      }

      try {
        sessionStorage.setItem(storageKey, String(code || "").trim());
      } catch {}

      setAddress(String(data?.address || ""));
      setDoc({
        docId: String(d.docId || ""),
        label: String(d.label || ""),
        fileName: String(d.fileName || ""),
        fileType: String(d.fileType || ""),
      });

      setShowGate(false);
    } catch {
      setShowGate(true);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviewUrl = async () => {
    if (!listingId || !docId || !accessCode.trim()) return;

    setPreviewLoading(true);
    setError("");

    try {
      const res = await fetch("/api/documents/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          docId,
          accessCode: accessCode.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Preview failed");
        setPreviewUrl("");
        return;
      }

      const url = String(data?.previewUrl || "").trim();
      if (!url) {
        setError("Preview URL missing.");
        setPreviewUrl("");
        return;
      }

      setPreviewUrl(url);
    } catch {
      setError("Failed to load preview");
      setPreviewUrl("");
    } finally {
      setPreviewLoading(false);
    }
  };

  const secureDownload = async () => {
    if (!listingId || !docId || !accessCode.trim()) {
      setError("Missing listing id, document id, or access code.");
      setShowGate(true);
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const res = await fetch("/api/documents/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          docId,
          accessCode: accessCode.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Download failed");
        return;
      }

      const url = String(data?.downloadUrl || "").trim();
      if (!url) {
        setError("Download link missing.");
        return;
      }

      window.open(url, "_blank");
    } catch {
      setError("Failed to generate download link");
    } finally {
      setDownloading(false);
    }
  };

  // Auto-load metadata if we had a saved code
  useEffect(() => {
    if (!showGate && accessCode.trim() && !doc && !loading) {
      fetchDocMeta(accessCode.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGate]);

  // Once we have doc meta, fetch signed preview URL
  useEffect(() => {
    if (doc && !previewUrl && !previewLoading) {
      fetchPreviewUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const isPdf = doc?.fileType?.toLowerCase().includes("pdf");
  const isImage = /image/i.test(doc?.fileType || "");

  return (
    <main className="min-h-screen bg-[#1a2b4a] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={
              listingId
                ? `/documents/view?id=${encodeURIComponent(listingId)}`
                : "/documents/view"
            }
          >
            <span className="text-white/90 hover:text-white font-bold">← Back to documents</span>
          </Link>
          <Link href="/">
            <span className="text-white/70 hover:text-white text-sm">GetReadyToPost</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-[#1a2b4a]">
              {doc?.label || "Protected Document"}
            </h1>
            {address ? (
              <p className="text-sm text-gray-500 mt-1">{address}</p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Secure preview requires an access code.</p>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {!doc ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">🔒</div>
                <p className="text-gray-700 font-semibold">This document is protected.</p>
                <p className="text-gray-500 text-sm mt-1">
                  Enter the access code to view the file.
                </p>

                <button
                  onClick={() => setShowGate(true)}
                  className="mt-6 bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition"
                >
                  Enter Access Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm text-gray-500">{doc.fileName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        try {
                          sessionStorage.removeItem(storageKey);
                        } catch {}
                        setDoc(null);
                        setAddress("");
                        setAccessCode("");
                        setPreviewUrl("");
                        setShowGate(true);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                      Lock
                    </button>

                    <button
                      onClick={secureDownload}
                      disabled={downloading}
                      className="bg-[#1a2b4a] hover:bg-[#243a63] text-white px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-60"
                    >
                      {downloading ? "Preparing..." : "Download"}
                    </button>
                  </div>
                </div>

                {previewLoading && (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading secure preview…</p>
                  </div>
                )}

                {!previewLoading && previewUrl && isPdf && (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[75vh] rounded-xl border border-gray-200"
                    title="PDF Viewer"
                  />
                )}

                {!previewLoading && previewUrl && isImage && (
                  <img
                    src={previewUrl}
                    alt={doc.label}
                    className="max-w-full h-auto rounded-xl border border-gray-200 mx-auto"
                  />
                )}

                {!previewLoading && !previewUrl && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 mb-4">
                      Preview not available yet. Try again.
                    </p>
                    <button
                      onClick={fetchPreviewUrl}
                      className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition"
                    >
                      Load Preview
                    </button>
                  </div>
                )}

                {!previewLoading && previewUrl && !isPdf && !isImage && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 mb-4">
                      Preview not available for this file type.
                    </p>
                    <button
                      onClick={secureDownload}
                      disabled={downloading}
                      className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-60"
                    >
                      {downloading ? "Preparing..." : "Download File"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WOW FACTOR GATE MODAL */}
      {showGate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 text-center">
              <div className="text-5xl mb-2">🔐</div>
              <h2 className="text-xl font-bold text-[#1a2b4a]">Access Code Required</h2>
              <p className="text-gray-500 text-sm mt-1">
                Enter the code provided by your agent to view this document.
              </p>
            </div>

            <form
              className="p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                fetchDocMeta(accessCode);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Code
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none text-center text-xl tracking-widest font-bold"
                  placeholder="••••••••"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowGate(false);
                    setError("");
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold transition"
                >
                  Not Now
                </button>
                <button
                  type="submit"
                  disabled={loading || !accessCode.trim()}
                  className="flex-1 bg-[#1a2b4a] hover:bg-[#243a63] text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
                >
                  {loading ? "Checking..." : "Unlock"}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                This access code is saved for this browser session only.
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DocumentViewDocPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1a2b4a] text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
