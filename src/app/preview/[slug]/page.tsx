'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
function prettyKey(k: string) {
  const map: Record<string, string> = {
    address1: "Street Address",
    address: "Street Address",
    city: "City",
    state: "State",
    zip: "ZIP Code",
    taxAmount: "Annual Property Tax",
    annualTax: "Annual Property Tax",
    assessedValue: "Assessed Value",
    justValue: "Just Value",
    taxableValue: "Taxable Value",
    avm_value: "AVM Value",
    avm_high: "AVM High",
    avm_low: "AVM Low",
    avm_date: "AVM Date",
    avm_confidence: "AVM Confidence",
    beds: "Bedrooms",
    bedrooms: "Bedrooms",
    baths: "Bathrooms",
    bathrooms: "Bathrooms",
    sqft: "Square Feet",
    lotSize: "Lot Size",
    yearBuilt: "Year Built",
    year_built: "Year Built",
    floodZone: "Flood Zone",
    flood_zone: "Flood Zone",
    ownerName: "Owner Name",
    owner_name: "Owner Name",
    mailingAddress: "Mailing Address",
    mailing_address: "Mailing Address",
    building_permits: "Building Permits",
    assessment_history: "Assessment History",
    sale_history: "Sale History",
    viewCount: "Views",
  };

  if (map[k]) return map[k];

  return k
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}


function formatValue(v: any) {
  if (v === null || v === undefined || v === "") return "—";

  if (typeof v === "boolean") return v ? "Yes" : "No";

  if (typeof v === "number") {
    if (Math.abs(v) >= 1000) return v.toLocaleString();
    return String(v);
  }

  if (typeof v === "string" && /^\d+(\.\d+)?$/.test(v)) {
    const n = Number(v);
    if (!Number.isNaN(n) && Math.abs(n) >= 1000) return n.toLocaleString();
    return v;
  }

  if (Array.isArray(v)) {
    return `${v.length} item${v.length === 1 ? "" : "s"}`;
  }

  if (typeof v === "object") {
    const keys = Object.keys(v);
    return keys.length
      ? `Object (${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", …" : ""})`
      : "Object";
  }

  return String(v);
}


export default function PreviewPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const highlight = useMemo(() => {
    const p = property || {};
    return {
      address1: p.address1 || p.address || 'Property Address',
      city: p.city || '',
      state: p.state || '',
      zip: p.zip || '',
      taxAmount: p.taxAmount ?? p.annualTax ?? '',
      floodZone: p.floodZone ?? p.flood_zone ?? '',
      assessedValue: p.assessedValue ?? p.justValue ?? p.assessed_value ?? '',
      sqft: p.sqft ?? '',
      bedrooms: p.bedrooms ?? p.beds ?? '',
      bathrooms: p.bathrooms ?? p.baths ?? '',
      ownerName: p.ownerName ?? p.owner_name ?? '',
      owner2: p.owner2 ?? p.owner2_name ?? '',
      mailingAddress: p.mailingAddress ?? p.mailing_address ?? '',
      viewCount: p.viewCount ?? 0,
      schools: Array.isArray(p.schools) ? p.schools : [],
      saleHistory: Array.isArray(p.saleHistory) ? p.saleHistory : (Array.isArray(p.sale_history) ? p.sale_history : []),
    };
  }, [property]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      setProperty(null);

      try {
        const ref = doc(db, 'public_previews', slug);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError('Property not found');
          setLoading(false);
          return;
        }

        const data = snap.data();
        setProperty(data);

        // Increment view count (server-side)
        try {
          const res = await fetch(`/.netlify/functions/increment-preview-views?slug=${encodeURIComponent(slug)}`);
          const j = await res.json();
          if (j && typeof j.viewCount === 'number') {
            setProperty((prev: any) => ({ ...(prev || {}), viewCount: j.viewCount }));
          }
        } catch (e) {
          // non-fatal
          console.error('View counter error', e);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    if (slug) run();
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
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#c9a227] to-yellow-500 text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">See What You Get</h1>
          <p className="text-yellow-100 text-lg mb-3">Full property data, documents, and insights—all in one place</p>
          <div className="text-sm text-yellow-100">
            Views: <span className="font-bold text-xl text-white">{highlight.viewCount || 0}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Address + highlight cards */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-2">{highlight.address1}</h2>
          <p className="text-gray-300 mb-6">
            {[highlight.city, highlight.state, highlight.zip].filter(Boolean).join(', ')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlight.taxAmount !== '' && (
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/40 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-semibold">Annual Tax</p>
                <p className="text-2xl font-bold text-blue-300">
                  ${Number(highlight.taxAmount || 0).toLocaleString()}
                </p>
              </div>
            )}

            {highlight.floodZone && (
  <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-lg p-4">
    <p className="text-sm text-gray-300 font-semibold">Flood Zone</p>
    <p className="text-lg font-bold text-orange-300">{String(highlight.floodZone)}</p>
    <p className="text-xs text-gray-300 mt-2 leading-snug">
      Flood zones can impact insurance costs and lender requirements. Always verify with FEMA and local maps before marketing.
    </p>
  </div>
)}


            {highlight.schools?.length > 0 && (
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-semibold">Schools</p>
                <p className="text-lg font-bold text-purple-300">{highlight.schools.length} Nearby</p>
              </div>
            )}

            {highlight.assessedValue !== '' && (
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-semibold">Assessed Value</p>
                <p className="text-lg font-bold text-green-300">
                  ${Number(highlight.assessedValue || 0).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">Quick Facts</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Square Feet</p>
                <p className="text-lg font-semibold text-white">
                  {highlight.sqft !== '' ? Number(highlight.sqft).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Bedrooms / Bathrooms</p>
                <p className="text-lg font-semibold text-white">
                  {highlight.bedrooms || 'N/A'} / {highlight.bathrooms || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">Owner</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Owner Name</p>
                <p className="text-lg font-semibold text-white">{highlight.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Owner 2</p>
                <p className="text-lg font-semibold text-white">{highlight.owner2 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Mailing Address</p>
                <p className="text-lg font-semibold text-white">{highlight.mailingAddress || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schools */}
        {highlight.schools?.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">Schools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlight.schools.map((s: any, idx: number) => (
                <div key={idx} className="bg-black/20 border border-white/10 rounded-lg p-4">
                  <div className="text-white font-bold">{s?.name || 'School'}</div>
                  <div className="text-gray-300 text-sm">{s?.type || ''}</div>
                  {s?.distance && <div className="text-gray-300 text-sm">Distance: {s.distance}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sale history */}
        {highlight.saleHistory?.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">Sale History</h3>
            <div className="space-y-3">
              {highlight.saleHistory.slice(0, 10).map((sale: any, idx: number) => (
                <div key={idx} className="bg-black/20 border border-white/10 rounded-lg p-4">
                  <div className="text-gray-300 text-sm">{sale?.saleDate || sale?.sale_date || ''}</div>
                  <div className="text-white font-bold">
                    ${Number(sale?.salePrice || sale?.sale_price || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FULL PAYLOAD RENDERER (this is what you’re missing) */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-white/20 pb-3">
            Full Data (All Fields)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(property || {})
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => (
                <div key={k} className="bg-black/20 border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-gray-300 font-bold mb-1 break-words">{prettyKey(k)}</div>
                  <div className="text-sm text-white break-words">{formatValue(v) || '—'}</div>
                </div>
              ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#c9a227] to-yellow-500 rounded-2xl p-8 text-center border border-yellow-400/30">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Pull a Real Property?</h3>
          <p className="text-yellow-100 mb-6">Jump into the workspace and run a live search.</p>
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
