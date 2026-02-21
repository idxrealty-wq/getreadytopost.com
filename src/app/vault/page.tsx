"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getUserListings, type Listing } from '@/lib/listings';
import { doc, deleteDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  email: string;
  listingText: string;
  status: string;
  analysis?: {
    overall: string;
    categories: Record<string, { grade: string; feedback: string }>;
    rewrite: string;
    recommendations: string[];
  };
  createdAt: string;
}

export default function VaultPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [tab, setTab] = useState<'listings' | 'reports'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadListings();
      loadReports();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadListings = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getUserListings(user.uid);
      setListings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', user.uid),
        where('savedToVault', '==', true)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(data);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleDelete = async (listingId: string, address: string) => {
    if (!confirm(`Are you sure you want to delete the listing for ${address}? This cannot be undone.`)) {
      return;
    }
    setDeleting(listingId);
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      setListings(listings.filter(l => l.id !== listingId));
    } catch (err: any) {
      alert('Failed to delete listing: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const gradeColor: Record<string, string> = {
    'A+': 'bg-green-500', A: 'bg-green-500', B: 'bg-blue-500', C: 'bg-yellow-500', D: 'bg-red-500'
  };

  if (authLoading || loading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading your vault...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
            <p className="text-gray-300 mb-8">You must be signed in to access your Agent Vault.</p>
            <Link href="/" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
              Go to Home and Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🗄️ Agent Vault</h1>
            <p className="text-gray-300 text-lg">All your saved listings and reports</p>
          </div>
          <Link href="/workspace" className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">
            + New Listing
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/20">
          <button
            onClick={() => setTab('listings')}
            className={'px-6 py-3 font-bold text-sm transition border-b-2 ' + (tab === 'listings' ? 'border-[#c9a227] text-[#c9a227]' : 'border-transparent text-gray-400 hover:text-white')}
          >
            🏠 My Listings ({listings.length})
          </button>
          <button
            onClick={() => setTab('reports')}
            className={'px-6 py-3 font-bold text-sm transition border-b-2 ' + (tab === 'reports' ? 'border-[#c9a227] text-[#c9a227]' : 'border-transparent text-gray-400 hover:text-white')}
          >
            📊 Rate My Listing Reports ({reports.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-900/60 border-2 border-red-500/60 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Listings Tab */}
        {tab === 'listings' && (
          <>
            {listings.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-white mb-3">No Listings Yet</h2>
                <p className="text-gray-300 mb-6">Start building your first listing in the Agent Workspace!</p>
                <Link href="/workspace" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/20">
                      <tr>
                        <th className="text-left px-6 py-4 text-white font-bold">Address</th>
                        <th className="text-left px-6 py-4 text-white font-bold">Details</th>
                        <th className="text-left px-6 py-4 text-white font-bold">Status</th>
                        <th className="text-left px-6 py-4 text-white font-bold">Date Saved</th>
                        <th className="text-center px-6 py-4 text-white font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing) => (
                        <tr key={listing.id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {listing.photos && listing.photos.length > 0 ? (
                                <img src={listing.photos[0].downloadURL || listing.photos[0].url || ""} alt="Property" className="w-14 h-14 object-cover rounded-lg border border-white/20 flex-shrink-0" />
                              ) : (
                                <div className="w-14 h-14 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center flex-shrink-0 text-2xl">🏠</div>
                              )}
                              <div>
                                <div className="text-white font-semibold text-sm">{listing.address}</div>
                                <div className="text-gray-400 text-xs">Tax ID: {listing.propertyData.taxId || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 text-sm">
                            {[
                              listing.propertyData.beds && `${listing.propertyData.beds} bed`,
                              listing.propertyData.baths && `${listing.propertyData.baths} bath`,
                              listing.propertyData.sqft && `${listing.propertyData.sqft} sqft`,
                            ].filter(Boolean).join(' · ') || 'No details'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm font-bold border border-green-500/40">
                              {listing.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(listing.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/listing/${listing.id}`} className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-500/40">
                                View
                              </Link>
                              <Link href={`/workspace?edit=${listing.id}`} className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-amber-500/40">
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(listing.id, listing.address)}
                                disabled={deleting === listing.id}
                                className="bg-red-600/30 hover:bg-red-600/50 text-red-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-500/40 disabled:opacity-50"
                              >
                                {deleting === listing.id ? '...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <>
            {reports.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-white mb-3">No Reports Yet</h2>
                <p className="text-gray-300 mb-6">Get your listing graded and save the report to your vault!</p>
                <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
                  Rate My Listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {report.analysis && (
                          <div className={'w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white flex-shrink-0 ' + (gradeColor[report.analysis.overall] || 'bg-gray-500')}>
                            {report.analysis.overall}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-semibold mb-1">Submitted {formatDate(report.createdAt)}</p>
                          <p className="text-gray-400 text-sm line-clamp-2">{report.listingText?.substring(0, 120)}...</p>
                        </div>
                      </div>
                      <Link
                        href={`/results?id=${report.id}`}
                        className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-5 py-2 rounded-xl font-bold text-sm transition whitespace-nowrap flex-shrink-0"
                      >
                        View Report
                      </Link>
                    </div>
                    {report.analysis && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {Object.entries(report.analysis.categories).map(([key, val]) => (
                          <span key={key} className={'text-xs font-bold px-2 py-1 rounded-full text-white ' + (gradeColor[val.grade] || 'bg-gray-500')}>
                            {key}: {val.grade}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
