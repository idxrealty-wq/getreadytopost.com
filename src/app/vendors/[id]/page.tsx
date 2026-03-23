"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
}

export default function VendorProfilePage() {
  const params = useParams();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendors/${vendorId}`);
      const json = await res.json();

      if (!res.ok) {
        setNotFound(true);
        return;
      }

      setVendor(json.vendor);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  if (notFound || !vendor) {
    return (
      <main className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-white mb-2">Vendor Not Found</h1>
          <p className="text-gray-400 mb-6">This vendor profile does not exist or is not active.</p>
          <a href="/" className="text-yellow-500 hover:underline">← Back to Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* VENDOR CARD */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">

          {/* AD GRAPHIC BANNER */}
          {vendor.adGraphicUrl && (
            <div className="w-full h-56 overflow-hidden bg-gray-800">
              <img
                src={vendor.adGraphicUrl}
                alt={`${vendor.businessName} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* LOGO + NAME */}
            <div className="flex items-center gap-6 mb-6">
              {vendor.logoUrl && (
                <img
                  src={vendor.logoUrl}
                  alt={`${vendor.businessName} logo`}
                  className="w-20 h-20 rounded-xl object-contain bg-white p-2"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{vendor.businessName}</h1>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {vendor.tier && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 capitalize">
                      {vendor.tier}
                    </span>
                  )}
                  {vendor.categoryId && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      {vendor.categoryId}
                    </span>
                  )}
                  {vendor.marketId && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                      {vendor.marketId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            {vendor.shortDescription && (
              <p className="text-gray-300 text-base leading-relaxed mb-8">
                {vendor.shortDescription}
              </p>
            )}

            {/* CONTACT INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {vendor.phone && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Phone</p>
                  <a href={`tel:${vendor.phone}`} className="text-white font-medium hover:text-yellow-400 transition">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.email && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Email</p>
                  <a href={`mailto:${vendor.email}`} className="text-white font-medium hover:text-yellow-400 transition">
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.websiteUrl && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Website</p>
                  <a
                    href={vendor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 font-medium hover:underline"
                  >
                    {vendor.websiteUrl}
                  </a>
                </div>
              )}
              {vendor.contactName && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Contact</p>
                  <p className="text-white font-medium">{vendor.contactName}</p>
                </div>
              )}
            </div>

            {/* CTA BUTTON */}
            {vendor.destinationUrl && (
              <a
                href={vendor.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl transition text-lg"
              >
                {vendor.ctaText || "Learn More"} →
              </a>
            )}
          </div>
        </div>

        {/* BACK LINK */}
        <div className="mt-6 text-center">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
            ← Back to GetReadyToPost
          </a>
        </div>

      </div>
    </main>
  );
}
