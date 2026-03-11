'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import Link from 'next/link';

export default function PreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, 'public_previews', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProperty(docSnap.data());
          // Increment view counter via Netlify function (server-side, safe)
          try {
  const res = await fetch(`/.netlify/functions/increment-preview-views?slug=${slug}`);
  const j = await res.json();

  if (j && typeof j.viewCount === 'number') {
    setProperty((prev: any) => ({ ...(prev || {}), viewCount: j.viewCount }));
  }
} catch (err) {
  console.error('View counter error:', err);
}

        } else {
          setError('Property not found');
        }
      } catch (err: any) {
        console.error('Error fetching preview:', err);
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProperty();
  }, [slug]);

  if (loading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading property...</p>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Property Not Found</h1>
          <p className="text-gray-300 mb-6">{error || 'This property preview is not available.'}</p>
          <Link href="/workspace" className="text-[#c9a227] hover:underline text-lg font-bold">
            ← Back to Workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#c9a227] to-yellow-500 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">See What You Get</h1>
          <p className="text-yellow-100 text-lg mb-4">Full property data, documents, and insights—all in one place</p>
          <div className="text-sm text-yellow-100">
            Views: <span className="font-bold text-xl text-white">{property.viewCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Address & Quick Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-2">
            {property.address1 || 'Property Address'}
          </h2>
          <p className="text-gray-300 mb-6">
            {property.city}, {property.state} {property.zip}
          </p>

          {/* Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {property.avm && (
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-semibold">AVM Value</p>
                <p className="text-2xl font-bold text-green-400">${property.avm.toLocaleString()}</p>
              </div>
            )}
            {property.taxAmount && (
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/40 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-semibold">Annual Tax</p>
                <p className="text-2xl font-bold text-blue-400">${property.taxAmount.toLocaleString()}</p>
              </div>
            )}
            {property.floodZone && (
              <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-semibold">Flood Zone</p>
                <p className="text-lg font-bold text-orange-400">{property.floodZone}</p>
              </div>
            )}
            {property.schools && property.schools.length > 0 && (
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-semibold">Schools</p>
                <p className="text-lg font-bold text-purple-400">{property.schools.length} Nearby</p>
              </div>
            )}
          </div>
        </div>

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Construction & Lot */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">Construction & Lot</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Construction Type</p>
                <p className="text-lg font-semibold text-white">{property.constructionType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Year Built</p>
                <p className="text-lg font-semibold text-white">{property.yearBuilt || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Square Feet</p>
                <p className="text-lg font-semibold text-white">{property.sqft ? property.sqft.toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Lot Size</p>
                <p className="text-lg font-semibold text-white">{property.lotSize || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Bedrooms / Bathrooms</p>
                <p className="text-lg font-semibold text-white">
                  {property.bedrooms || '0'} / {property.bathrooms || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Owner & Assessment */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">Owner & Assessment</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Owner Name</p>
                <p className="text-lg font-semibold text-white">{property.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Owner 2</p>
                <p className="text-lg font-semibold text-white">{property.owner2 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Mailing Address</p>
                <p className="text-lg font-semibold text-white">{property.mailingAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Assessed Value</p>
                <p className="text-lg font-semibold text-white">
                  ${property.assessedValue ? property.assessedValue.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Tax Exemptions</p>
                <p className="text-lg font-semibold text-white">{property.taxExemptions || 'None'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales History */}
        {property.saleHistory && property.saleHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">Recent Sales</h3>
            <div className="space-y-4">
              {property.saleHistory.slice(0, 3).map((sale: any, idx: number) => (
                <div key={idx} className="border-l-4 border-[#c9a227] pl-4 py-2">
                  <p className="text-sm text-gray-400">{sale.saleDate}</p>
                  <p className="text-lg font-semibold text-white">${sale.salePrice?.toLocaleString() || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#c9a227] to-yellow-500 rounded-2xl p-8 text-center border border-yellow-400/30">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Full Property Data?</h3>
          <p className="text-yellow-100 mb-6">Start pulling instant property insights for your clients today.</p>
          <Link
            href="/workspace"
            className="inline-block bg-white text-[#1a2b4a] font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
          >
            Go to Workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
