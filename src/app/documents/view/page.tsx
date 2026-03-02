'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DocumentViewPage() {
  const searchParams = useSearchParams();
  const listingIdFromUrl = searchParams.get('id') || '';

  const [listingId, setListingId] = useState(listingIdFromUrl);
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [unlocked, setUnlocked] = useState(false);

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

      if (!res.ok) {
        setError(data.error || 'Invalid access code');
        return;
      }

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
    <main className="min-h-screen bg-[#1a2b4a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-2xl font-bold text-white">GetReadyToPost</h1>
          </Link>
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
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="Enter listing ID"
                    value={listingId}
                    onChange={(e) => setListingId(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Code</label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none text-center text-xl tracking-widest font-bold"
                  placeholder="••••••••"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !accessCode || !listingId}
                className="w-full bg-[#1a2b4a] hover:bg-[#243a63] text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
              >
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
                {documents.map((doc) => (
                  <a
                    key={doc.docId}
                    href={doc.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-[#c9a227] transition group"
                  >
                    <div className="text-3xl">
                      {doc.fileType?.includes('pdf') ? '📄' : '🖼️'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#1a2b4a] group-hover:text-[#c9a227] transition">{doc.label}</p>
                      <p className="text-xs text-gray-400">{doc.fileName}</p>
                    </div>
                    <div className="text-gray-400 group-hover:text-[#c9a227] transition">↓</div>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-xs text-gray-500">These documents are confidential. Do not share this link.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
