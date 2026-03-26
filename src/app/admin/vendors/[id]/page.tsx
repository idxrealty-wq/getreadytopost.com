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
  unverifiedDate: string;
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
  unverifiedDate: "",
  verificationNotes: "",
};

function sp(t: string) {
  return t.split(",").map((s) => s.trim()).filter(Boolean);
}

const inputClass =
  "w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500";
const labelClass = "block text-gray-400 text-sm mb-1";
const sectionHeadClass =
  "text-yellow-500 font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-700 pb-2";

export default function VendorEditPage() {
  const params = useParams();
  const router = useRouter();
  const vid = params?.id as string;

  const [form, setForm] = useState<Vendor>(ev);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [at, setAt] = useState("");
  const [tt, setTt] = useState("");
  const [nt, setNt] = useState("");
  const [vt, setVt] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const created = new URLSearchParams(window.location.search).get("created");
      if (created === "1") setSuccess("✅ Vendor created successfully!");
    }
  }, []);

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
            unverifiedDate: d.vendor.unverifiedDate
              ? String(d.vendor.unverifiedDate).slice(0, 10)
              : "",
          });
          setAt((d.vendor.areasServed || []).join(", "));
          setTt((d.vendor.tags || []).join(", "));
          setNt((d.vendor.nowServing || []).join(", "));
          setVt((d.vendor.videoLanguages || []).join(", "));
        } else {
          setError("Vendor not found.");
        }
      })
      .catch(() => setError("Failed to load vendor."))
      .finally(() => setLoading(false));
  }, [vid]);

  function hc(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
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
      unverifiedDate: form.unverifiedDate?.trim() || undefined,
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
        unverifiedDate: d.vendor.unverifiedDate
          ? String(d.vendor.unverifiedDate).slice(0, 10)
          : "",
      });
      setAt((d.vendor.areasServed || []).join(", "));
      setTt((d.vendor.tags || []).join(", "));
      setNt((d.vendor.nowServing || []).join(", "));
      setVt((d.vendor.videoLanguages || []).join(", "));
      setSuccess("✅ Saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  }

  async function hd() {
    if (!confirm("Delete this vendor? This cannot be undone.")) return;
    await fetch(`/api/admin/vendors/${vid}`, { method: "DELETE" });
    router.push("/admin/vendors");
  }
  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading vendor...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {success && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg font-semibold animate-pulse">
          {success}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Vendor</h1>
            <p className="text-gray-400 text-sm mt-1">
              {form.businessName || "Loading..."}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/vendors")}
            className="text-gray-400 hover:text-white text-sm font-medium transition"
          >
            ← Back to Vendors
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={hs} className="space-y-6">

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className={sectionHeadClass}>Business Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Business Name</label>
                <input name="businessName" value={form.businessName} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact Name</label>
                <input name="contactName" value={form.contactName} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" value={form.email} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" value={form.phone} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website URL</label>
                <input name="websiteUrl" value={form.websiteUrl} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <input name="shortDescription" value={form.shortDescription} onChange={hc} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className={sectionHeadClass}>Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Street Address</label>
                <input name="address" value={form.address} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input name="city" value={form.city} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input name="state" value={form.state} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ZIP</label>
                <input name="zip" value={form.zip} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Areas Served (comma separated)</label>
                <input value={at} onChange={(e) => setAt(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className={sectionHeadClass}>Ad Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category ID</label>
                <input name="categoryId" value={form.categoryId} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tier</label>
                <select name="tier" value={form.tier} onChange={hc} className={inputClass}>
                  <option value="local">Local</option>
                  <option value="regional">Regional</option>
                  <option value="national">National</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Market ID</label>
                <input name="marketId" value={form.marketId} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={hc} className={inputClass}>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Logo URL</label>
                <input name="logoUrl" value={form.logoUrl} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ad Graphic URL</label>
                <input name="adGraphicUrl" value={form.adGraphicUrl} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>CTA Text</label>
                <input name="ctaText" value={form.ctaText} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Destination URL</label>
                <input name="destinationUrl" value={form.destinationUrl} onChange={hc} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className={sectionHeadClass}>Video</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Video URL</label>
                <input name="videoUrl" value={form.videoUrl} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Video Tier</label>
                <input name="videoTier" value={form.videoTier} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Video Languages (comma separated)</label>
                <input value={vt} onChange={(e) => setVt(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Vault URL</label>
                <input name="vaultUrl" value={form.vaultUrl} onChange={hc} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className={sectionHeadClass}>Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isVerified"
                  id="isVerified"
                  checked={form.isVerified}
                  onChange={hc}
                  className="w-4 h-4 accent-yellow-500"
                />
                <label htmlFor="isVerified" className="text-white text-sm font-medium">
                  Vendor is verified
                </label>
              </div>
              <div>
                <label className={labelClass}>Verification Status</label>
                <select name="verificationStatus" value={form.verificationStatus} onChange={hc} className={inputClass}>
                  <option value="not_verified">Not Verified</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Verified Date</label>
                <input type="date" name="verifiedDate" value={form.verifiedDate} onChange={hc} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unverified Date</label>
                <input type="date" name="unverifiedDate" value={form.unverifiedDate} onChange={hc} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Verification Notes</label>
                <textarea name="verificationNotes" value={form.verificationNotes} onChange={hc} rows={3} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className={sectionHeadClass}>Tags and Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input value={tt} onChange={(e) => setTt(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Now Serving (comma separated)</label>
                <input value={nt} onChange={(e) => setNt(e.target.value)} className={inputClass} />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isParent"
                  id="isParent"
                  checked={form.isParent}
                  onChange={hc}
                  className="w-4 h-4 accent-yellow-500"
                />
                <label htmlFor="isParent" className="text-white text-sm font-medium">
                  Is Parent Vendor
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className={sectionHeadClass}>Notes</h2>
            <textarea name="notes" value={form.notes} onChange={hc} rows={4} className={inputClass} />
          </div>

          <div className="flex items-center justify-between pt-2 pb-8">
            <button
              type="button"
              onClick={hd}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition"
            >
              Delete Vendor
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg text-sm transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Vendor"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
