"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getUserListings, type Listing } from '@/lib/listings';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VaultPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadListings();
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
            <Link
              href="/"
              className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition"
            >
              Go to Home & Sign In
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
            <p className="text-gray-300 text-lg">All your saved listings in one place</p>
          </div>
          <Link
            href="/workspace"
            className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition"
          >
            + New Listing
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/60 border-2 border-red-500/60 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-3">No Listings Yet</h2>
            <p className="text-gray-300 mb-6">Start building your first listing in the Agent Workspace!</p>
            <Link
              href="/workspace"
              className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition"
            >
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
                        <div className="text-white font-bold">{listing.address}</div>
                        <div className="text-gray-400 text-sm">Tax ID: {listing.propertyData.taxId || 'N/A'}</div>
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
                          ✅ {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {formatDate(listing.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/listing/${listing.id}`}
                            className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-500/40"
                          >
                            👁️ View
                          </Link>
                          <Link
                            href={`/workspace?edit=${listing.id}`}
                            className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-amber-500/40"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(listing.id, listing.address)}
                            disabled={deleting === listing.id}
                            className="bg-red-600/30 hover:bg-red-600/50 text-red-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-500/40 disabled:opacity-50"
                          >
                            {deleting === listing.id ? '...' : '🗑️'}
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
      </div>
    </main>
  );
}
