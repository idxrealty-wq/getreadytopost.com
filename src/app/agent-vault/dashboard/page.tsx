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
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadListings();
      loadReports();
      fetchCreditBalance();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchCreditBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await res.json();
      setCreditBalance(data.balance || 0);
    } catch (err) {
      console.error('Failed to fetch credit balance:', err);
    }
  };

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
      const reportsRef = collection(db, 'submissions');
      const q = query(reportsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Report));
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!user || !window.confirm('Are you sure? This cannot be undone.')) return;
    setDeleting(listingId);
    try {
      const listingRef = doc(db, 'users', user.uid, 'listings', listingId);
      await deleteDoc(listingRef);
      setListings(listings.filter((l) => l.id !== listingId));
    } catch (err) {
      setError('Failed to delete listing');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Sign in to access your vault</h1>
          <Link href="/" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">
            â† Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Agent Vault</h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <p className="text-gray-300 flex-grow">Manage your listings and rewrite reports</p>
            {creditBalance !== null && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 w-full md:w-auto">
                <p className="text-gray-300 text-sm mb-1">Credit Balance</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-3xl font-bold text-[#c9a227]">{creditBalance}</p>
                  <Link href="/checkout" className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-4 py-2 rounded-lg font-bold text-sm transition">
                    Buy More
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/50 rounded-xl p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-8 border-b border-white/20">
          <button
            onClick={() => setTab('listings')}
            className={`px-6 py-3 font-bold transition ${
              tab === 'listings'
                ? 'text-[#c9a227] border-b-2 border-[#c9a227]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setTab('reports')}
            className={`px-6 py-3 font-bold transition ${
              tab === 'reports'
                ? 'text-[#c9a227] border-b-2 border-[#c9a227]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Reports ({reports.length})
          </button>
        </div>

        {tab === 'listings' && (
          <div>
            {loading ? (
              <p className="text-gray-300">Loading listings...</p>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No listings yet</p>
                <Link href="/workspace" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">
                  Create your first listing â†’
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-[#c9a227]/50 transition">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        <h3 className="text-white font-bold text-lg mb-2">{listing.address || 'Untitled Listing'}</h3>
                        <p className="text-gray-500 text-xs">Created: {new Date(listing.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        disabled={deleting === listing.id}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                      >
                        {deleting === listing.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div>
            {loading ? (
              <p className="text-gray-300">Loading reports...</p>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No reports yet</p>
                <Link href="/rate-my-listing" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">
                  Rate your first listing â†’
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-[#c9a227]/50 transition cursor-pointer" onClick={() => router.push(`/results?id=${report.id}`)}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-grow">
                        <h3 className="text-white font-bold text-lg mb-2">{report.email}</h3>
                        <p className="text-gray-400 text-sm mb-2">{report.listingText.substring(0, 100)}...</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Status: <span className={report.status === 'completed' ? 'text-green-400' : 'text-amber-400'}>{report.status}</span></span>
                          <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {report.analysis?.overall && (
                          <p className="text-2xl font-bold text-[#c9a227]">{report.analysis.overall}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/" className="text-white/70 hover:text-white font-semibold">
            â† Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
