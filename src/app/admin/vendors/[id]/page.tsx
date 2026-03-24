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
  isVerified: boolean;
  verificationStatus: string;
  verifiedDate: string;
  verificationNotes: string;
}

const ev: Vendor = {
  id: "",
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  websiteUrl: "",
  categoryId: "",
  tier: "local",
  marketId: "",
  logoUrl: "",
  adGraphicUrl: "",
  ctaText: "",
  destinationUrl: "",
  shortDescription: "",
  status: "pending",
  notes: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  areasServed: [],
  tags: [],
  nowServing: [],
  videoUrl: "",
  videoTier: "",
  videoLanguages: [],
  vaultUrl: "",
  isParent: false,
  locations: [],
  isVerified: false,
  verificationStatus: "not_verified",
  verifiedDate: "",
  verificationNotes: "",
};

function sp(t: string) {
  return t.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function VendorEditPage() {
  const params = useParams();
  const router = useRouter();
  const vid = params?.id as string;

  const [form, setForm] = useState<Vendor>(ev);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("created") === "1"
      ? "✅ Vendor created successfully!"
      : ""
  );

  const [at, setAt] = useState("");
  const [tt, setTt] = useState("");
  const [nt, setNt] = useState("");
  const [vt, setVt] = useState("");

  useEffect(() => {
    if (!vid) return;

    fetch(`/api/admin/vendors/${vid}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.vendor) {
          setForm({
            ...ev,
            ...d.vendor,
            verifiedDate: d.vendor.verifiedDate
              ? String(d.vendor.verifiedDate).slice(0, 10)
              : "",
          });
          setAt((d.vendor.areasServed || []).join(", "));
          setTt((d.vendor.tags || []).join(", "));
          setNt((d.vendor.nowServing || []).join(", "));
          setVt((d.vendor.videoLanguages || []).join(", "));
        } else {
          setError("Not found.");
        }
      })
      .catch(() => setError("Load failed."))
      .finally(() => setLoading(false));
  }, [vid]);

  function hc(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({
        ...f,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function hs(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const p = {
      ...form,
      areasServed: sp(at),
      tags: sp(tt),
      nowServing: sp(nt),
      videoLanguages: sp(vt),
      verifiedDate: form.verifiedDate?.trim() || undefined,
      verificationNotes: form.verificationNotes?.trim() || "",
    };

    try {
      const r = await fetch(`/api/admin/vendors/${vid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });

      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");

      setForm({
        ...ev,
        ...d.vendor,
        verifiedDate: d.vendor.verifiedDate
          ? String(d.vendor.verifiedDate).slice(0, 10)
          : "",
      });
      setAt((d.vendor.areasServed || []).join(", "));
      setTt((d.vendor.tags || []).join(", "));
      setNt((d.vendor.nowServing || []).join(", "));
      setVt((d.vendor.videoLanguages || []).join(", "));
      setSuccess("Saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed.");
    } finally {
      setSaving(false);
    }
  }

  async function hd() {
    if (!confirm("Delete vendor?")) return;
    await fetch(`/api/admin/vendors/${vid}`, { method: "DELETE" });
    router.push("/admin/vendors");
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Vendor</h1>
        <button
          onClick={() => router.push("/admin/vendors")}
          className="text-sm text-blue-600 hover:underline"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg font-semibold animate-pulse">
          {success}
        </div>
      )}

      <form onSubmit={hs} className="space-y-4">
        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">
            Business Info
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Name
              </label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Name
              </label>
              <input
                name="contactName"
                value={form.contactName}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Website URL
              </label>
              <input
                name="websiteUrl"
                value={form.websiteUrl}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Short Description
              </label>
              <input
                name="shortDescription"
                value={form.shortDescription}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Street Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                name="city"
                value={form.city}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                name="state"
                value={form.state}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP</label>
              <input
                name="zip"
                value={form.zip}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Areas Served (comma separated)
              </label>
              <input
                value={at}
                onChange={(e) => setAt(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">
            Ad Settings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category ID
              </label>
              <input
                name="categoryId"
                value={form.categoryId}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tier</label>
              <select
                name="tier"
                value={form.tier}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="local">Local</option>
                <option value="regional">Regional</option>
                <option value="national">National</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Market ID
              </label>
              <input
                name="marketId"
                value={form.marketId}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Logo URL
              </label>
              <input
                name="logoUrl"
                value={form.logoUrl}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ad Graphic URL
              </label>
              <input
                name="adGraphicUrl"
                value={form.adGraphicUrl}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                CTA Text
              </label>
              <input
                name="ctaText"
                value={form.ctaText}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Destination URL
              </label>
              <input
                name="destinationUrl"
                value={form.destinationUrl}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Video</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Video URL
              </label>
              <input
                name="videoUrl"
                value={form.videoUrl}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Video Tier
              </label>
              <input
                name="videoTier"
                value={form.videoTier}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Video Languages (comma separated)
              </label>
              <input
                value={vt}
                onChange={(e) => setVt(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Vault URL
              </label>
              <input
                name="vaultUrl"
                value={form.vaultUrl}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">
            Verification
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="isVerified"
                id="isVerified"
                checked={form.isVerified}
                onChange={hc}
              />
              <label htmlFor="isVerified" className="text-sm font-medium">
                Vendor is verified
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Verification Status
              </label>
              <select
                name="verificationStatus"
                value={form.verificationStatus}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="not_verified">Not Verified</option>
                <option value="pending_verification">
                  Pending Verification
                </option>
                <option value="verified">Verified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Verified Date
              </label>
              <input
                type="date"
                name="verifiedDate"
                value={form.verifiedDate}
                onChange={hc}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Verification Notes
              </label>
              <textarea
                name="verificationNotes"
                value={form.verificationNotes}
                onChange={hc}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">
            Tags and Services
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (comma separated)
              </label>
              <input
                value={tt}
                onChange={(e) => setTt(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Now Serving (comma separated)
              </label>
              <input
                value={nt}
                onChange={(e) => setNt(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="isParent"
                id="isParent"
                checked={form.isParent}
                onChange={hc}
              />
              <label htmlFor="isParent" className="text-sm font-medium">
                Is Parent Vendor
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">Notes</h2>
          <textarea
            name="notes"
            value={form.notes}
            onChange={hc}
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </section>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={hd}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Vendor"}
          </button>
        </div>
      </form>
    </div>
  );
}
