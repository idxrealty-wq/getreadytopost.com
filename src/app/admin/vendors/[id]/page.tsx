"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Vendor, VendorStatus, VendorTier } from "@/types/vendor";

export default function VendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
    status: "pending" as VendorStatus,
    notes: "",
  });

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to fetch vendor");
        return;
      }

      setVendor(json.vendor);
      setFormData(json.vendor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to save vendor");
        return;
      }

      setSuccessMsg("Vendor saved! Redirecting...");
      setTimeout(() => {
        router.push("/admin/vendors");
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this vendor? This cannot be undone.")) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Failed to delete vendor");
        return;
      }

      router.push("/admin/vendors");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 pt-24 p-6">Loading vendor...</p>;

  return (
    <main className="min-h-screen bg-gray-950 pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🏢 {formData.businessName || "Vendor"}</h1>
            <p className="text-gray-400 text-sm mt-1">ID: {vendorId}</p>
          </div>
          <button
            onClick={() => router.push("/admin/vendors")}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back
          </button>
        </div>

        {/* ALERTS */}
        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {successMsg && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6">
            {successMsg}
          </div>
        )}

        {/* FORM */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-6">
          {/* BUSINESS INFO */}
          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Business Information</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Website URL</label>
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          </fieldset>

          {/* CLASSIFICATION */}
          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Classification</legend>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Category ID</label>
                <input
                  type="text"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Tier</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                >
                  <option value="local">Local</option>
                  <option value="state">State</option>
                  <option value="national">National</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Market ID</label>
                <input
                  type="text"
                  name="marketId"
                  value={formData.marketId}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          </fieldset>

          {/* AD ASSETS */}
          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Ad Assets</legend>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Logo URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Ad Graphic URL</label>
                <input
                  type="url"
                  name="adGraphicUrl"
                  value={formData.adGraphicUrl}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">CTA Text</label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  placeholder="e.g., Shop Now, Learn More"
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Destination URL</label>
                <input
                  type="url"
                  name="destinationUrl"
                  value={formData.destinationUrl}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Short Description</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          </fieldset>

          {/* STATUS & NOTES */}
          <fieldset>
            <legend className="text-lg font-bold text-white mb-4">Status & Notes</legend>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Internal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          </fieldset>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold px-4 py-2 rounded-lg transition"
            >
              {saving ? "Saving..." : "Save Vendor"}
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
