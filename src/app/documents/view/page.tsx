'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DocumentViewContent() {
  const searchParams = useSearchParams();
  const listingIdFromUrl = searchParams.get('id') || '';
  const [listingId, setListingId] = useState(listingIdFromUrl);
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/documents/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, accessCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid access code'); return; }
      setAddress(data.address);
      setDocuments(data.documents);
      setUnlocked(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-8">
        <Link href="/"><h1 className="text-2xl font-bold text-white">GetReadyToPost</h1></Link>
        <p className="text-gray-400 text-sm mt-1">Secure Document Access</p>
      </div>
      {!unlocked ? (
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="text-xl font-bold text-[#1a2b4a]">Enter Access Code</h2>
            <p className="text-gray-500 text-sm mt-1">Enter the code provided by your agent to view documents</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!listingIdFromUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing ID</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Enter listing ID" value={listingId} onChange={(e) => setListingId(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Code</label>
              <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none text-center text-xl tracking-widest font-bold" placeholder="••••••••" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">{error}</div>}
            <button type="submit" disabled={loading || !accessCode || !listingId} className="w-full bg-[#1a2b4a] hover:bg-[#243a63] text-white py-3 rounded-xl font-bold transition disabled:opacity-50">
              {loading ? '🔄 Checking...' : '🔓 Access Documents'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-[#1a2b4a]">Documents Unlocked</h2>
            {address && <p className="text-gray-500 text-sm mt-1">{address}</p>}
          </div>
          {documents.length === 0 ? (
            <p className="text-center text-gray-500">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((d) => {
                const isPdf = d.fileType?.includes('pdf');
                const isImage = /image/i.test(d.fileType || '');
                return (
                  <div key={d.docId} className="border-2 border-gray-100 rounded-xl hover:border-[#c9a227] transition">
                    <button onClick={() => setViewingDoc(d)} className="w-full flex items-center gap-4 p-4 text-left">
                      <div className="text-3xl">{isPdf ? '📄' : isImage ? '🖼️' : '📎'}</div>
                      <div className="flex-1">
                        <p className="font-bold text-[#1a2b4a]">{d.label}</p>
                        <p className="text-xs text-gray-400">{d.fileName}</p>
                      </div>
                      <div className="text-[#c9a227] font-bold text-sm">View →</div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">These documents are confidential. Do not share this link.</p>
          </div>
        </div>
      )}
      {viewingDoc && (() => {
        const url = viewingDoc.downloadURL;
        const isPdf = viewingDoc.fileType?.includes('pdf');
        const isImage = /image/i.test(viewingDoc.fileType || '');
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl">
              <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
                <div>
                  <h3 className="font-bold text-[#1a2b4a]">{viewingDoc.label}</h3>
                  <p className="text-xs text-gray-400">{viewingDoc.fileName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <a href={url} download={viewingDoc.fileName} target="_blank" rel="noopener noreferrer" className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-4 py-2 rounded-lg text-sm font-bold transition">📥 Download</a>
                  <button onClick={() => setViewingDoc(null)} className="text-gray-400 hover:text-gray-700 text-2xl">✕</button>
                </div>
              </div>
              <div className="p-6">
                {isPdf ? (
                  <iframe src={url} className="w-full h-[600px] rounded-lg border border-gray-200" title="PDF Viewer" />
                ) : isImage ? (
                  <img src={url} alt={viewingDoc.label} className="max-w-full h-auto rounded-lg border border-gray-200 mx-auto" />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📎</div>
                    <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                    <a href={url} download={viewingDoc.fileName} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">📥 Download File</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function DocumentViewPage() {
  return (
    <main className="min-h-screen bg-[#1a2b4a] flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
        <DocumentViewContent />
      </Suspense>
    </main>
  );
}
