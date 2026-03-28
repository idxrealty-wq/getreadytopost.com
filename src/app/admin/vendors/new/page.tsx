"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VendorTier, VendorStatus, VerificationStatus, VideoTier, Category, Market } from "@/types/vendor";

export default function NewVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, mktRes] = await Promise.all([
          fetch("/api/admin/vendors/categories"),
          fetch("/api/admin/vendors/markets"),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (mktRes.ok) setMarkets(await mktRes.json());
      } catch (err) {
        console.error("Failed to load categories/markets:", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    websiteUrl: "",
    categoryId: "",
    tier: "local" as VendorTier,
    marketId: "",
    logoUrl: "",
    adGraphicUrl: "",
    ctaText: "",
    destinationUrl: "",
    shortDescription: "",
	description: "",
    status: "pending" as VendorStatus,
    notes: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    areasServed: "",
    tags: "",
    nowServing: "",
    videoUrl: "",
    videoTier: "none" as VideoTier,
    videoLanguages: "",
    vaultUrl: "",
    isParent: false,
    isVerified: false,
    verificationStatus: "not_verified" as VerificationStatus,
    verifiedDate: "",
    verificationNotes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.businessName.trim()) {
      setError("Business Name is required");
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError("Full Description is required");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
	  description: formData.description.trim(),
      areasServed: formData.areasServed
        ? formData.areasServed.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      tags: formData.tags
        ? formData.tags.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      nowServing: formData.nowServing
        ? formData.nowServing.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      videoLanguages: formData.videoLanguages
        ? formData.videoLanguages.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      verifiedDate: formData.verifiedDate.trim() || undefined,
      verificationNotes: formData.verificationNotes.trim() || "",
    };

    try {
      const res = await fetch("/api/admin/vendors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to create vendor");
        return;
      }

      router.push("/admin/vendors/" + json.vendor.id + "?created=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500";
  const labelClass = "block text-gray-400 text-sm mb-2";

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">New Vendor</h1>
            <p className="text-gray-400 text-sm mt-1">Create a new vendor record</p>
          </div>
          <button
            onClick={() => router.push("/admin/vendors")}
            className="text-gray-400 hover:text-white text-sm"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-6"
        >
          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Business Information</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="col-span-2">
                <label className={labelClass}>Website URL</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Address</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="FL"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Zip Code</label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Classification</legend>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loadingData}
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Tier</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="local">Local</option>
                  <option value="state">State</option>
                  <option value="national">National</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Market</label>
                <select
                  name="marketId"
                  value={formData.marketId}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loadingData}
                >
                  <option value="">Select a market...</option>
                  {markets.map((mkt) => (
                    <option key={mkt.id} value={mkt.id}>
                      {mkt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className={labelClass}>
                  Areas Served <span className="text-gray-500">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="areasServed"
                  value={formData.areasServed}
                  onChange={handleChange}
                  placeholder="Orlando, Tampa, Lake County"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Now Serving <span className="text-gray-500">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="nowServing"
                  value={formData.nowServing}
                  onChange={handleChange}
                  placeholder="Orlando, Kissimmee"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Tags <span className="text-gray-500">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="roofing, licensed, insured"
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isParent"
                  checked={formData.isParent}
                  onChange={handleChange}
                  className="w-4 h-4 accent-yellow-500"
                />
                <label className="text-gray-400 text-sm">Is Parent Vendor (multi-location)</label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Ad Assets</legend>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Logo URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Ad Graphic URL (Banner)</label>
                <input
                  type="url"
                  name="adGraphicUrl"
                  value={formData.adGraphicUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>CTA Text</label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  placeholder="e.g., Get a Free Quote, Learn More"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Destination URL</label>
                <input
                  type="url"
                  name="destinationUrl"
                  value={formData.destinationUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

                            <div>
                <label className={labelClass}>Short Description</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Full Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={inputClass}
                  placeholder="Detailed vendor description for profile pages and SEO."
                />
              </div>

              <div>
                <label className={labelClass}>
                  Vault URL <span className="text-gray-500">(documents/forms access link)</span>
                </label>
                <input
                  type="url"
                  name="vaultUrl"
                  value={formData.vaultUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Video Ad</legend>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  Video URL <span className="text-gray-500">(YouTube or Vimeo)</span>
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Video Tier</label>
                <select
                  name="videoTier"
                  value={formData.videoTier}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="none">None</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Video Languages <span className="text-gray-500">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="videoLanguages"
                  value={formData.videoLanguages}
                  onChange={handleChange}
                  placeholder="English, Spanish, Haitian Creole"
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Verification</legend>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  className="w-4 h-4 accent-yellow-500"
                />
                <label className="text-gray-400 text-sm">Vendor is verified</label>
              </div>

              <div>
                <label className={labelClass}>Verification Status</label>
                <select
                  name="verificationStatus"
                  value={formData.verificationStatus}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="not_verified">Not Verified</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Verified Date</label>
                <input
                  type="date"
                  name="verifiedDate"
                  value={formData.verifiedDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Verification Notes</label>
                <textarea
                  name="verificationNotes"
                  value={formData.verificationNotes}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Status & Notes</legend>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Internal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold px-4 py-2 rounded-lg transition"
            >
              {loading ? "Creating..." : "Create Vendor"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/vendors")}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
