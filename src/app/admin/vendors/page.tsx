"use client";
import { useEffect, useState } from "react";
import { Vendor, VendorStatus, VendorTier } from "@/types/vendor";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<VendorStatus | "all">("all");
  const [filterTier, setFilterTier] = useState<VendorTier | "all">("all");

  useEffect(() => {
    fetchVendors();
  }, [filterStatus, filterTier]);

  const fetchVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterTier !== "all") params.append("tier", filterTier);

      const res = await fetch(`/api/admin/vendors?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to fetch vendors");
        return;
      }

      setVendors(json.vendors || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Vendors</h1>
            <p className="mt-1 text-sm text-gray-400">Manage ad system vendors</p>
          </div>

          <a
            href="/admin/vendors/new"
            className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black transition hover:bg-yellow-600"
          >
            + New Vendor
          </a>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-900 p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-2 block text-xs text-gray-400">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as VendorStatus | "all")}
                className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="inactive">Inactive</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs text-gray-400">Tier</label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value as VendorTier | "all")}
                className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="local">Local</option>
                <option value="state">State</option>
                <option value="national">National</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchVendors}
                className="rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black transition hover:bg-yellow-600"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading && <p className="text-gray-400">Loading vendors...</p>}

        {error && <p className="mb-4 text-red-400">{error}</p>}

        {!loading && vendors.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">No vendors found.</p>
          </div>
        )}

        {!loading && vendors.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-4 py-3 text-xs text-gray-400">#</th>
                  <th className="px-4 py-3 text-xs text-gray-400">Business Name</th>
                  <th className="px-4 py-3 text-xs text-gray-400">Contact</th>
                  <th className="px-4 py-3 text-xs text-gray-400">Email</th>
                  <th className="px-4 py-3 text-xs text-gray-400">Tier</th>
                  <th className="px-4 py-3 text-xs text-gray-400">Status</th>
                  <th className="px-4 py-3 text-xs text-gray-400">Created</th>
                  <th className="px-4 py-3 text-xs text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor, i) => (
                  <tr key={vendor.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-white">{vendor.businessName}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{vendor.contactName}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{vendor.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs capitalize text-blue-400">
                        {vendor.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${
                          vendor.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : vendor.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : vendor.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : ""}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/vendors/${vendor.id}`}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Edit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
