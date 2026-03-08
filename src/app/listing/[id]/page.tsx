"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/contexts/UserContext";
import type { Listing } from "@/lib/listings";
import Link from "next/link";

export default function ListingViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (!authLoading && user && params?.id) {
      loadListing(params.id as string);
    } else if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, params?.id, router]);

  const loadListing = async (id: string) => {
    setLoading(true);
    setError("");

    try {
      const listingRef = doc(db, "listings", id);
      const listingSnap = await getDoc(listingRef);

      if (!listingSnap.exists()) {
        setError("Listing not found.");
        setListing(null);
        return;
      }

      const data = listingSnap.data() as Listing;

      if (data.userId !== user?.uid) {
        setError("You do not have permission to view this listing.");
        setListing(null);
        return;
      }

      setListing({ ...data, id } as any);
    } catch (err: any) {
      setError(err?.message || "Failed to load listing");
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const photos = listing?.photos || [];
  const hasPhotos = photos.length > 0;

  const nextPhoto = () => {
    if (!hasPhotos) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (!hasPhotos) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (authLoading || loading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading listing...</div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              {error || "Listing Not Found"}
            </h1>
            <Link
              href="/agent-vault"
              className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition"
            >
              Back to Vault
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const completedChecklist = listing?.checklistState
    ? Object.entries(listing.checklistState).filter(([, v]) => Boolean(v)).length
    : 0;

  const totalChecklist = listing?.checklistState
    ? Object.keys(listing.checklistState).length
    : 0;

  const closingEstimate = (listing as any)?.closingCostEstimate;

  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
    listing.address || ""
  )}`;

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🏠 {listing.address || "Untitled Listing"}
            </h1>
            <p className="text-gray-300">
              Tax ID: {(listing as any)?.propertyData?.taxId || "N/A"}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/workspace?edit=${listing.id}`}
              className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-5 py-3 rounded-xl font-bold transition border border-amber-500/40"
            >
              ✏️ Edit
            </Link>

            <Link
              href={`/closing-costs?address=${encodeURIComponent(
                listing.address || ""
              )}&price=${encodeURIComponent(
                String((listing as any)?.propertyData?.price || "")
              )}`}
              className="bg-green-600/30 hover:bg-green-600/50 text-green-300 px-5 py-3 rounded-xl font-bold transition border border-green-500/40"
            >
              🧮 Closing Costs
            </Link>

            <Link
              href={`/property-tax?address=${encodeURIComponent(
                listing.address || ""
              )}&price=${encodeURIComponent(
                String((listing as any)?.propertyData?.price || "")
              )}`}
              className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-5 py-3 rounded-xl font-bold transition border border-blue-500/40"
            >
              🏛️ Tax Estimate
            </Link>

            <Link
              href="/agent-vault"
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-xl font-bold transition"
            >
              ← Vault
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {closingEstimate?.results && (
            <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">
                🧮 Closing Cost Estimate
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-blue-300 text-sm">Buyer Cash to Close</p>
                  <p className="text-white font-bold text-xl">
                    $
                    {Number(
                      closingEstimate.results.buyerCashToClose || 0
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-green-300 text-sm">Seller Net Proceeds</p>
                  <p className="text-white font-bold text-xl">
                    $
                    {Number(
                      closingEstimate.results.sellerNetProceeds || 0
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-blue-300 text-sm">Buyer Closing Costs</p>
                  <p className="text-white font-bold text-xl">
                    $
                    {Number(closingEstimate.results.buyerTotal || 0).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-green-300 text-sm">Seller Closing Costs</p>
                  <p className="text-white font-bold text-xl">
                    $
                    {Number(
                      closingEstimate.results.sellerTotal || 0
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {closingEstimate?.calculatedAt && (
                <p className="text-gray-400 text-xs mt-4">
                  Calculated: {new Date(closingEstimate.calculatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {hasPhotos ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📸 Property Photos</h2>

              <div className="relative">
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                  <img
                    src={photos[currentPhotoIndex]?.downloadURL || photos[currentPhotoIndex]?.url || ""}
                    alt={`Property photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                      {currentPhotoIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {photos.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentPhotoIndex ? "border-[#c9a227]" : "border-white/20"
                      }`}
                    >
                      <img
                        src={photo?.downloadURL || photo?.url || ""}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-300">No photos uploaded yet</p>
            </div>
          )}

          {Array.isArray((listing as any)?.documents) &&
          (listing as any).documents.length > 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-3">📄 Documents</h2>
              <p className="text-gray-300 mb-6">
                {(listing as any).documents.length} document(s) available
              </p>

              <Link
                href={`/documents/view?id=${listing.id}`}
                className="inline-block bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-6 py-3 rounded-xl font-bold transition border border-purple-500/40"
              >
                🔐 View Documents in Vault
              </Link>

              <p className="text-gray-400 text-xs mt-3">
                Documents are protected and only accessible through the vault.
              </p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-300">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">📍 Location</h2>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">📋 Property Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-200 text-sm">Year Built</p>
                <p className="text-white font-bold text-lg">
                  {(listing as any)?.propertyData?.yearBuilt || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-200 text-sm">Bedrooms</p>
                <p className="text-white font-bold text-lg">
                  {(listing as any)?.propertyData?.beds || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-200 text-sm">Bathrooms</p>
                <p className="text-white font-bold text-lg">
                  {(listing as any)?.propertyData?.baths || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-200 text-sm">Square Feet</p>
                <p className="text-white font-bold text-lg">
                  {(listing as any)?.propertyData?.sqft || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-200 text-sm">Lot Size</p>
                <p className="text-white font-bold text-lg">
                  {(listing as any)?.propertyData?.lotSize || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-200 text-sm">Price</p>
                <p className="text-white font-bold text-lg">
                  {(listing as any)?.propertyData?.price
                    ? `$${(listing as any).propertyData.price}`
                    : "N/A"}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-gray-200 text-sm">Date Added</p>
                <p className="text-white font-bold text-lg">
                  {(listing as any)?.propertyData?.dateAdded || "N/A"}
                </p>
              </div>
            </div>

            {(listing as any)?.propertyData?.features && (
              <div className="mt-6">
                <p className="text-gray-400 text-sm mb-2">Features</p>
                <p className="text-white">{(listing as any).propertyData.features}</p>
              </div>
            )}
          </div>

          {(listing as any)?.aiListing && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">✨ AI-Generated Listing</h2>
                <button
                  onClick={() => navigator.clipboard.writeText((listing as any).aiListing)}
                  className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-4 py-2 rounded-lg font-bold transition text-sm"
                >
                  📋 Copy
                </button>
              </div>

              <div className="bg-white/15 rounded-xl p-6 border border-white/20">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {(listing as any).aiListing}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              ✅ Pre-Listing Checklist ({completedChecklist}/{totalChecklist} complete)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {listing?.checklistState &&
                Object.entries(listing.checklistState).map(([key, checked]) => (
                  <div key={key} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                    <span className="text-2xl">{checked ? "✅" : "⬜"}</span>
                    <span className={checked ? "text-green-300" : "text-gray-200"}>{key}</span>
                  </div>
                ))}
            </div>
          </div>

          {(listing as any)?.notes && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📝 Notes</h2>
              <div className="bg-white/15 rounded-xl p-6 border border-white/20">
                <p className="text-white whitespace-pre-wrap">
                  {(listing as any).notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
