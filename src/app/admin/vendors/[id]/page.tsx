"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  status: string;
  notes: string;
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
  vaultUrl: string;
  isParent: boolean;
  locations: string[];
}

const emptyVendor: Vendor = {
  id: "", businessName: "", contactName: "", email: "", phone: "",
  websiteUrl: "", categoryId: "", tier: "local", marketId: "",
  logoUrl: "", adGraphicUrl: "", ctaText: "", destinationUrl: "",
  shortDescription: "", status: "pending", notes: "", address: "",
  city: "", state: "", zip: "", areasServed: [], tags: [],
  nowServing: [], videoUrl: "", videoTier: "", videoLanguages: [],
  vaultUrl: "", isParent: false, locations: [],
};

export default function VendorEditPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.id as string;
  const [form, setForm] = useState<Vendor>(emptyVendor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!vendorId) return;
    fetch(`/api/admin/vendors/${vendorId}`)
      .then((r) => r.json())
      .then((data) => { if (data.vendor) setForm(data.vendor); else setError("Vendor not found."); })
      .catch(() => setError("Failed to load vendor."))
      .finally(() => setLoading(false));
  }, [vendorId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    else setForm((f) => ({ ...f, [name]: value }));
  }

  function handleArrayChange(field: keyof Vendor, value: string) {
    setForm((f) => ({ ...f, [field]: value.split(",").map((s) => s.trim()).filter(Boolean) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setForm(data.vendor);
      setSuccess("Vendor saved successfully.");
    } catch (err: any) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this vendor? This cannot be undone.")) return;
    await fetch(`/api/admin/vendors/${vendorId}`, { method: "DELETE" });
    router.push("/admin/vendors");
  }

  if (loading) return <div className="p-8 text-gray-500">Loading vendor...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Vendor</h1>
        <button onClick={() => router.push("/admin/vendors")} className="text-sm text-blue-600 hover:underline">Back to Vendors</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Business Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Business Name</label><input name="businessName" value={form.businessName} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Contact Name</label><input name="contactName" value={form.contactName} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Website URL</label><input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Short Description</label><input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Street Address</label><input name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">City</label><input name="city" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">State</label><input name="state" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">ZIP</label><input name="zip" value={form.zip} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Areas Served (comma separated)</label><input value={form.areasServed.join(", ")} onChange={(e) => handleArrayChange("areasServed", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Ad Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category ID</label><input name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Tier</label><select name="tier" value={form.tier} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm"><option value="local">Local</option><option value="regional">Regional</option><option value="national">National</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Market ID</label><input name="marketId" value={form.marketId} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Status</label><select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm"><option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Logo URL</label><input name="logoUrl" value={form.logoUrl} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Ad Graphic URL</label><input name="adGraphicUrl" value={form.adGraphicUrl} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">CTA Text</label><input name="ctaText" value={form.ctaText} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Destination URL</label><input name="destinationUrl" value={form.destinationUrl} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Video</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Video URL</label><input name="videoUrl" value={form.videoUrl} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Video Tier</label><input name="videoTier" value={form.videoTier} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Video Languages (comma separated)</label><input value={form.videoLanguages.join(", ")} onChange={(e) => handleArrayChange("videoLanguages", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Vault URL</label><input name="vaultUrl" value={form.vaultUrl} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" /></div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Tags and Services</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tags (comma separated)</label><input value={form.tags.join(", ")} onChange={(e) => handleArrayChange("tags", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Now Serving (comma separated)</label><input value={form.nowServing.join(", ")} onChange={(e) => handleArrayChange("nowServing", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div className="flex items-center gap-2 mt-2"><input type="checkbox" name="isParent" id="isParent" checked={form.isParent} onChange={handleChange} /><label htmlFor="isParent" className="text-sm font-medium">Is Parent Vendor</label></div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Notes</h2>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className="w-full border rounded px-3 py-2 text-sm" />
        </section>
        <div className="flex items-center justify-between pt-4">
          <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete Vendor</button>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50">{saving ? "Saving..." : "Save Vendor"}</button>
        </div>
      </form>
    </div>
  );
}
