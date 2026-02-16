"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User, logOut } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface SavedListing {
  id: string;
  tag?: string;
  fileName?: string;
  listingText: string;
  analysis?: {
    overall: string;
  };
  createdAt: string;
  savedAt: string;
}

export default function VaultPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/rate-my-listing');
      } else {
        loadListings(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadListings = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', userId),
        where('savedToVault', '==', true),
        orderBy('savedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedListing));
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    router.push('/');
  };

  if (!user) return null;

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📂 My Agent Vault</h1>
            <p className="text-gray-300">{user.email}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-gray-300 hover:text-white text-sm font-semibold"
          >
            Sign Out
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Saved Listings Yet</h2>
            <p className="text-gray-300 mb-6">Analyze your first listing and save it to your vault</p>
            <Link 
              href="/rate-my-listing"
              className="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              Analyze a Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <Link 
                key={listing.id}
                href={`/results?id=${listing.id}`}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-[#c9a227] transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">📄</span>
                  {listing.analysis?.overall && (
                    <span className={`text-2xl font-black px-3 py-1 rounded-lg ${
                      listing.analysis.overall === 'A' ? 'bg-green-500' :
                      listing.analysis.overall === 'B' ? 'bg-blue-500' :
                      listing.analysis.overall === 'C' ? 'bg-yellow-500' : 'bg-red-500'
                    } text-white`}>
                      {listing.analysis.overall}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#c9a227] transition">
                  {listing.tag || listing.fileName || 'Untitled Listing'}
                </h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {listing.listingText.substring(0, 100)}...
                </p>
                <p className="text-gray-400 text-xs">
                  Saved {new Date(listing.savedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
