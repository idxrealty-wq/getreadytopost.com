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
  const virtualTourUrl = (listing as any)?.propertyData?.virtualTourUrl || "";
  const p = (listing as any)?.propertyData || {};
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(listing.address || "")}`;

  const Field = ({ label, value }: { label: string; value: any }) => {
    if (!value || value === "" || value === "0") return null;
    return (
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    );
  };

  const fmt$ = (val: any) =>
    val ? "$" + Number(val).toLocaleString("en-US", { minimumFractionDigits: 0 }) : null;

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🏠 {listing.address || "Untitled Listing"}
            </h1>
            <p className="text-gray-300">Tax ID: {p?.taxId || "N/A"}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/workspace?edit=${listing.id}`}
              className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-5 py-3 rounded-xl font-bold transition border border-amber-500/40"
            >
              ✏️ Edit
            </Link>
            <Link
              href={`/closing-costs?address=${encodeURIComponent(listing.address || "")}&price=${encodeURIComponent(String(p?.price || ""))}`}
              className="bg-green-600/30 hover:bg-green-600/50 text-green-300 px-5 py-3 rounded-xl font-bold transition border border-green-500/40"
            >
              🧮 Closing Costs
            </Link>
            <Link
              href={`/property-tax?address=${encodeURIComponent(listing.address || "")}&price=${encodeURIComponent(String(p?.price || ""))}`}
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

          {/* Closing Cost Estimate */}
          {closingEstimate?.results && (
            <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">🧮 Closing Cost Estimate</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-blue-300 text-sm">Buyer Cash to Close</p>
                  <p className="text-white font-bold text-xl">${Number(closingEstimate.results.buyerCashToClose || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-green-300 text-sm">Seller Net Proceeds</p>
                  <p className="text-white font-bold text-xl">${Number(closingEstimate.results.sellerNetProceeds || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Buyer Closing Costs</p>
                  <p className="text-white font-bold text-xl">${Number(closingEstimate.results.buyerTotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-green-300 text-sm">Seller Closing Costs</p>
                  <p className="text-white font-bold text-xl">${Number(closingEstimate.results.sellerTotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              {closingEstimate?.calculatedAt && (
                <p className="text-gray-400 text-xs mt-4">Calculated: {new Date(closingEstimate.calculatedAt).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Photos */}
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
                    <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition">←</button>
                    <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition">→</button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">{currentPhotoIndex + 1} / {photos.length}</div>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo: any, idx: number) => (
                    <button key={idx} onClick={() => setCurrentPhotoIndex(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${idx === currentPhotoIndex ? "border-[#c9a227]" : "border-white/20"}`}>
                      <img src={photo?.downloadURL || photo?.url || ""} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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

          {/* Documents */}
          {Array.isArray((listing as any)?.documents) && (listing as any).documents.length > 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-3">📄 Documents</h2>
              <p className="text-gray-300 mb-6">{(listing as any).documents.length} document(s) available</p>
              <Link href={`/documents/view?id=${listing.id}`} className="inline-block bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-6 py-3 rounded-xl font-bold transition border border-purple-500/40">
                🔐 View Documents in Vault
              </Link>
              <p className="text-gray-400 text-xs mt-3">Documents are protected and only accessible through the vault.</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-300">No documents uploaded yet</p>
            </div>
          )}

          {/* Virtual Tour */}
          {virtualTourUrl && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🎥 Virtual Tour</h2>
              <a href={virtualTourUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-6 py-3 rounded-xl font-bold transition border border-purple-500/40">
                🎥 Launch Virtual Tour
              </a>
            </div>
          )}

          {/* Map */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">📍 Location</h2>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
          {/* Core Property Details */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">📋 Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Field label="Year Built" value={p.yearBuilt} />
              <Field label="Bedrooms" value={p.beds} />
              <Field label="Bathrooms" value={p.baths} />
              <Field label="Square Feet" value={p.sqft ? Number(p.sqft).toLocaleString() : null} />
              <Field label="Lot Size (sqft)" value={p.lotSize ? Number(p.lotSize).toLocaleString() : null} />
              <Field label="Acres" value={p.acres} />
              <Field label="Price" value={fmt$(p.price)} />
              <Field label="Property Type" value={p.propertyType} />
              <Field label="Zoning" value={p.zoning} />
              <Field label="Zoning Code" value={p.zoningCode} />
              <Field label="Stories" value={p.stories} />
              <Field label="Garage" value={p.garage} />
              <Field label="Garage Sqft" value={p.garageSqft} />
              <Field label="Pool" value={p.pool} />
              <Field label="Fireplace" value={p.fireplace} />
              <Field label="Construction" value={p.construction} />
              <Field label="Wall Type" value={p.wallType} />
              <Field label="Roof Cover" value={p.roofCover} />
              <Field label="Roof Shape" value={p.roofShape} />
              <Field label="Roof Year" value={p.roofYear} />
              <Field label="AC Year" value={p.acYear} />
              <Field label="Water Heater Year" value={p.waterHeaterYear} />
              <Field label="Heating Type" value={p.heatingType} />
              <Field label="Heating Fuel" value={p.heatingFuel} />
              <Field label="Condition" value={p.condition} />
              <Field label="Subdivision" value={p.subdivision} />
              <Field label="Lot Number" value={p.lotNum} />
              <Field label="Water" value={p.water} />
              <Field label="Sewer" value={p.sewer} />
              <Field label="HOA" value={p.hoa} />
              <Field label="HOA Name" value={p.hoaName} />
              <Field label="HOA Amount" value={fmt$(p.hoaAmount)} />
              <Field label="School District" value={p.schoolDistrict} />
              <Field label="Date Added" value={p.dateAdded} />
            </div>
            {p.legalDescription && (
              <div className="mt-6">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Legal Description</p>
                <p className="text-white text-sm">{p.legalDescription}</p>
              </div>
            )}
            {p.amenities && (
              <div className="mt-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Amenities</p>
                <p className="text-white">{p.amenities}</p>
              </div>
            )}
            {p.features && (
              <div className="mt-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Features</p>
                <p className="text-white">{p.features}</p>
              </div>
            )}
          </div>

          {/* Owner Information */}
          {(p.ownerName || p.mailingAddress || p.ownerType) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">👤 Owner Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Field label="Owner Name" value={p.ownerName} />
                <Field label="Co-Owner Name" value={p.owner2Name} />
                <Field label="Owner Type" value={p.ownerType} />
                <Field label="Absentee Owner" value={p.absenteeOwner} />
                <Field label="Homestead" value={p.homestead} />
                <Field label="Mailing Address" value={p.mailingAddress} />
              </div>
            </div>
          )}

          {/* Tax & Assessment */}
          {(p.assessedValue || p.justValue || p.annualTax) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🏛️ Tax & Assessment</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Field label="Assessed Value" value={fmt$(p.assessedValue)} />
                <Field label="Just Value" value={fmt$(p.justValue)} />
                <Field label="Land Value" value={fmt$(p.landValue)} />
                <Field label="Building Value" value={fmt$(p.buildingValue)} />
                <Field label="Taxable Value" value={fmt$(p.taxableValue)} />
                <Field label="Annual Tax" value={fmt$(p.annualTax)} />
                <Field label="Tax Year" value={p.taxYear} />
                <Field label="DOR Use Code" value={p.dorUc} />
              </div>
              {Array.isArray(p.assessmentHistory) && p.assessmentHistory.length > 0 && (
                <div className="mt-6">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Assessment History</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10">
                          <th className="pb-2 pr-4">Year</th>
                          <th className="pb-2 pr-4">Assessed</th>
                          <th className="pb-2 pr-4">Just Value</th>
                          <th className="pb-2">Taxable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.assessmentHistory.slice(0, 5).map((row: any, i: number) => (
                          <tr key={i} className="border-b border-white/5 text-white">
                            <td className="py-2 pr-4">{row.year || row.tax_year || "—"}</td>
                            <td className="py-2 pr-4">{row.assessed_value ? fmt$(row.assessed_value) : "—"}</td>
                            <td className="py-2 pr-4">{row.just_value ? fmt$(row.just_value) : "—"}</td>
                            <td className="py-2">{row.taxable_value ? fmt$(row.taxable_value) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AVM / Valuation */}
          {(p.avmValue || p.avmLow || p.avmHigh) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📊 Automated Valuation (AVM)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Field label="AVM Value" value={fmt$(p.avmValue)} />
                <Field label="AVM Low" value={fmt$(p.avmLow)} />
                <Field label="AVM High" value={fmt$(p.avmHigh)} />
                <Field label="Confidence" value={p.avmConfidence ? p.avmConfidence + "%" : null} />
                <Field label="Price Per Sqft" value={fmt$(p.pricePerSqft)} />
                <Field label="AVM Date" value={p.avmDate} />
              </div>
            </div>
          )}

          {/* Sale Information */}
          {(p.lastSalePrice || p.saleDate || p.sellerName) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🤝 Sale Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Field label="Last Sale Price" value={fmt$(p.lastSalePrice)} />
                <Field label="Sale Date" value={p.saleDate} />
                <Field label="Sale Type" value={p.saleTransType} />
                <Field label="Seller Name" value={p.sellerName} />
                <Field label="Deed Type" value={p.deedType} />
                <Field label="Title Company" value={p.titleCompany} />
              </div>
              {Array.isArray(p.saleHistory) && p.saleHistory.length > 0 && (
                <div className="mt-6">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Sale History</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10">
                          <th className="pb-2 pr-4">Date</th>
                          <th className="pb-2 pr-4">Price</th>
                          <th className="pb-2 pr-4">Type</th>
                          <th className="pb-2">Seller</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.saleHistory.slice(0, 5).map((row: any, i: number) => (
                          <tr key={i} className="border-b border-white/5 text-white">
                            <td className="py-2 pr-4">{row.sale_date || row.date || "—"}</td>
                            <td className="py-2 pr-4">{row.sale_price ? fmt$(row.sale_price) : "—"}</td>
                            <td className="py-2 pr-4">{row.sale_trans_type || row.type || "—"}</td>
                            <td className="py-2">{row.seller_name || row.seller || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Mortgage */}
          {(p.mortgageLender || p.mortgageAmount) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🏦 Mortgage Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Field label="Lender" value={p.mortgageLender} />
                <Field label="Amount" value={fmt$(p.mortgageAmount)} />
                <Field label="Rate" value={p.mortgageRate ? p.mortgageRate + "%" : null} />
                <Field label="Type" value={p.mortgageType} />
                <Field label="Term" value={p.mortgageTerm} />
                <Field label="Date" value={p.mortgageDate} />
              </div>
            </div>
          )}

          {/* Flood Zone */}
          {(p.floodZone || p.floodSubtype) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🌊 Flood Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Field label="Flood Zone" value={p.floodZone} />
                <Field label="Flood Subtype" value={p.floodSubtype} />
                <Field label="SFHA" value={p.floodSFHA} />
              </div>
            </div>
          )}

          {/* Schools */}
          {Array.isArray(p.schools) && p.schools.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🎓 Schools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {p.schools.map((school: any, i: number) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white font-bold">{school.name || school.school_name || "—"}</p>
                    <p className="text-gray-400 text-sm">
                      {school.type || school.school_type || ""}{" "}
                      {school.district || school.school_district ? "· " + (school.district || school.school_district) : ""}
                    </p>
                    {(school.rating || school.great_schools_rating) && (
                      <p className="text-[#c9a227] text-sm mt-1">
                        Rating: {school.rating || school.great_schools_rating}/10
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Building Permits */}
          {Array.isArray(p.buildingPermits) && p.buildingPermits.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🔨 Building Permits</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Description</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.buildingPermits.slice(0, 10).map((permit: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 text-white">
                        <td className="py-2 pr-4">{permit.date || permit.permit_date || "—"}</td>
                        <td className="py-2 pr-4">{permit.type || permit.permit_type || "—"}</td>
                        <td className="py-2 pr-4">{permit.description || "—"}</td>
                        <td className="py-2">{permit.status || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Listing */}
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
                <p className="text-white whitespace-pre-wrap leading-relaxed">{(listing as any).aiListing}</p>
              </div>
            </div>
          )}

          {/* Checklist */}
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

          {/* Notes */}
          {(listing as any)?.notes && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📝 Notes</h2>
              <div className="bg-white/15 rounded-xl p-6 border border-white/20">
                <p className="text-white whitespace-pre-wrap">{(listing as any).notes}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
