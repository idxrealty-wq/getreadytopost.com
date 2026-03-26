"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface VendorLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  contactName: string;
  areasServed: string[];
  hours: string;
  isPrimary: boolean;
}

interface Vendor {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  categoryId: string;
  tier: string;
  marketId: string;
  logoUrl: string;
  adGraphicUrl: string;
  ctaText: string;
  destinationUrl: string;
  shortDescription: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  areasServed: string[];
  tags: string[];
  nowServing: string[];
  videoUrl: string;
  videoTier: string;
  videoLanguages: string[];
  locations: VendorLocation[];
  isParent: boolean;
  vaultUrl: string;
  isVerified: boolean;
  verificationStatus: string;
  verifiedDate?: string;
  verificationNotes?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return "https://www.youtube.com/embed/" + match[1];
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return "https://player.vimeo.com/video/" + vimeoMatch[1];
  return null;
}

function shareVendor(vendor: Vendor) {
  const url = window.location.href;
  const text = vendor.businessName + " - " + vendor.shortDescription;
  
  if (navigator.share) {
    navigator.share({
      title: vendor.businessName,
      text: text,
      url: url,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }
}

export default function VendorProfilePage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "locations">("about");

  useEffect(() => { fetchVendor(); }, [vendorId]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors/" + vendorId);
      const json = await res.json();
      if (!res.ok) { setNotFound(true); return; }
      setVendor(json.vendor);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <main className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  );

  if (notFound || !vendor) return (
    <main className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-white mb-2">Vendor Not Found</h1>
        <p className="text-gray-400 mb-6">This vendor profile does not exist or is not active.</p>
        <a href="/" className="text-yellow-500 hover:underline">Back to Home</a>
      </div>
    </main>
  );

  const embedUrl = getYouTubeEmbedUrl(vendor.videoUrl || "");
  const hasLocations = vendor.locations && vendor.locations.length > 0;
  const primaryAddress = vendor.address
    ? vendor.address + ", " + vendor.city + ", " + vendor.state + " " + vendor.zip
    : "";
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapEmbedUrl = primaryAddress && mapsKey
    ? "https://www.google.com/maps/embed/v1/place?key=" + mapsKey + "&q=" + encodeURIComponent(primaryAddress)
    : null;

  return (
    <main className="min-h-screen bg-gray-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">

          {vendor.adGraphicUrl && (
            <div className="w-full h-56 overflow-hidden bg-gray-800">
              <img src={vendor.adGraphicUrl} alt={vendor.businessName + " banner"} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start gap-6 mb-4">
              {vendor.logoUrl && (
                <img src={vendor.logoUrl} alt={vendor.businessName + " logo"} className="w-20 h-20 rounded-xl object-contain bg-white p-2 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{vendor.businessName}</h1>
                  <button
                    onClick={() => shareVendor(vendor)}
                    className="text-gray-400 hover:text-yellow-400 transition p-2"
                    title="Share this vendor"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.589 12.938 10 12.052 10 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3c.981 0 1.816-.402 2.684-.842m0 0a3 3 0 002.632 1.632c3.036 0 5.684-2.317 5.684-5.344M9.684 13.342A3.072 3.072 0 0112 15c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6c0 1.657.342 3.229.684 4.342m0 0h.028v.028" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {vendor.tier && <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 capitalize">{vendor.tier}</span>}
                  {vendor.categoryId && <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">{vendor.categoryId}</span>}
                  {vendor.marketId && <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">{vendor.marketId}</span>}
                  {vendor.verificationStatus === "verified" || vendor.isVerified ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">✓ Verified</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-semibold">Unverified</span>
                  )}
                </div>
                {vendor.nowServing && vendor.nowServing.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
                      Now Serving:
                    </span>
                    {vendor.nowServing.map((area, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">{area}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {hasLocations && (
              <div className="flex gap-1 mb-6 border-b border-gray-700">
                <button onClick={() => setActiveTab("about")} className={"px-4 py-2 text-sm font-medium transition border-b-2 -mb-px " + (activeTab === "about" ? "border-yellow-500 text-yellow-400" : "border-transparent text-gray-400 hover:text-white")}>About</button>
                <button onClick={() => setActiveTab("locations")} className={"px-4 py-2 text-sm font-medium transition border-b-2 -mb-px " + (activeTab === "locations" ? "border-yellow-500 text-yellow-400" : "border-transparent text-gray-400 hover:text-white")}>{"Locations (" + vendor.locations.length + ")"}</button>
              </div>
            )}

            {activeTab === "about" && (
              <>
                {vendor.shortDescription && (
                  <p className="text-gray-300 text-base leading-relaxed mb-6">{vendor.shortDescription}</p>
                )}
                {vendor.description && (
                  <p className="text-gray-300 text-base leading-relaxed mb-6 whitespace-pre-wrap">{vendor.description}</p>
                )}
                {vendor.tags && vendor.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {vendor.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{tag.startsWith("#") ? tag : "#" + tag}</span>
                    ))}
                  </div>
                )}
                {vendor.areasServed && vendor.areasServed.length > 0 && (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Areas Served</h3>
    <div className="flex flex-wrap gap-2">
      {vendor.areasServed.map((area, i) => (
        <span key={i} className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/30 whitespace-nowrap">{area}</span>
      ))}
    </div>
  </div>
)}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {vendor.phone && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Phone</p>
                      <a href={"tel:" + vendor.phone} className="text-white font-medium hover:text-yellow-400 transition">{vendor.phone}</a>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Email</p>
                      <a href={"mailto:" + vendor.email} className="text-white font-medium hover:text-yellow-400 transition">{vendor.email}</a>
                    </div>
                  )}
                  {vendor.websiteUrl && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Website</p>
                      <a href={vendor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-400 font-medium hover:underline">{vendor.websiteUrl}</a>
                    </div>
                  )}
                  {vendor.contactName && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Contact</p>
                      <p className="text-white font-medium">{vendor.contactName}</p>
                    </div>
                  )}
                </div>
                {mapEmbedUrl && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Location</h3>
                    <div className="rounded-xl overflow-hidden border border-gray-700 h-64">
                      <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                    {primaryAddress && <p className="text-gray-400 text-xs mt-2">{primaryAddress}</p>}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Video</h3>
                  {embedUrl ? (
                    <div className="rounded-xl overflow-hidden border border-gray-700 aspect-video">
                      <iframe src={embedUrl} width="100%" height="100%" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 0 }} />
                    </div>
                  ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
                      <p className="text-3xl mb-3">🎬</p>
                      <p className="text-white font-semibold mb-1">Want a professional video ad on your profile?</p>
                      <p className="text-gray-400 text-sm mb-4">Custom scripted video ads starting at <span className="text-yellow-400 font-bold">$100</span> — available in 120 languages. Additional languages just <span className="text-yellow-400 font-bold">$50</span> each.</p>
                      <a href="mailto:idxrealty@gmail.com?subject=Video Ad Production Request" className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg transition text-sm">Get My Video Ad →</a>
                    </div>
                  )}
                </div>
                {vendor.vaultUrl && (
                  <div className="mb-6">
                    <a href={vendor.vaultUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-800 border border-gray-600 hover:border-yellow-500 rounded-xl p-4 transition group">
                      <span className="text-2xl">📁</span>
                      <div>
                        <p className="text-white font-semibold group-hover:text-yellow-400 transition">Access Documents</p>
                        <p className="text-gray-400 text-xs">{"Forms, checklists, and resources from " + vendor.businessName}</p>
                      </div>
                      <span className="ml-auto text-gray-500 group-hover:text-yellow-400">→</span>
                    </a>
                  </div>
                )}
                {vendor.destinationUrl && (
                  <a href={vendor.destinationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl transition text-lg">
                    {(vendor.ctaText || "Learn More") + " →"}
                  </a>
                )}
              </>
            )}
            {activeTab === "locations" && hasLocations && (
              <div className="space-y-4">
                {vendor.locations.map((loc, i) => {
                  const locAddress = loc.address
                    ? loc.address + ", " + loc.city + ", " + loc.state + " " + loc.zip
                    : "";
                  const locMapUrl = locAddress && mapsKey
                    ? "https://www.google.com/maps/embed/v1/place?key=" + mapsKey + "&q=" + encodeURIComponent(locAddress)
                    : null;

                  return (
                    <div key={loc.id || i} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-base">{loc.name || "Location " + (i + 1)}</h3>
                          {loc.isPrimary && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 mt-1 inline-block">Primary</span>
                          )}
                        </div>
                      </div>

                      {locAddress && (
                        <p className="text-gray-400 text-sm mb-3">{locAddress}</p>
                      )}

                      {loc.phone && (
                        <p className="text-sm mb-2">
                          <span className="text-gray-500">Phone: </span>
                          <a href={"tel:" + loc.phone} className="text-white hover:text-yellow-400 transition">{loc.phone}</a>
                        </p>
                      )}

                      {loc.contactName && (
                        <p className="text-sm mb-2">
                          <span className="text-gray-500">Contact: </span>
                          <span className="text-white">{loc.contactName}</span>
                        </p>
                      )}

                      {loc.hours && (
                        <p className="text-sm mb-3">
                          <span className="text-gray-500">Hours: </span>
                          <span className="text-white">{loc.hours}</span>
                        </p>
                      )}

                      {loc.areasServed && loc.areasServed.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {loc.areasServed.map((area, j) => (
                            <span key={j} className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 border border-gray-600">{area}</span>
                          ))}
                        </div>
                      )}

                      {locMapUrl && (
                        <div className="rounded-xl overflow-hidden border border-gray-700 h-48 mt-3">
                          <iframe
                            src={locMapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
