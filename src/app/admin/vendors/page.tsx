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
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">🏢 Vendors</h1>
            <p className="text-gray-400 text-sm mt-1">Manage ad system vendors</p>
          </div>

          <a
            href="/admin/vendors/new"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg transition"
          >
            + New Vendor
          </a>
        </div>

        {/* FILTERS */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-gray-400 text-xs block mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as VendorStatus | "all")}
                className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="inactive">Inactive</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-xs block mb-2">Tier</label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value as VendorTier | "all")}
                className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
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
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* VENDOR LIST */}
        {loading && <p className="text-gray-400">Loading vendors...</p>}

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!loading && vendors.length === 0 && (
          <p className="text-gray-400">No vendors found.</p>
        )}

        {!loading && vendors.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-4 py-3 text-gray-400 text-xs">#</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">Business Name</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">Contact</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">Email</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">Tier</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">Status</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">Created</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor, i) => (
                  <tr key={vendor.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{vendor.businessName}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{vendor.contactName}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{vendor.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 capitalize">
                        {vendor.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold capitalize ${
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
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {vendor.createdAt instanceof Date
                        ? vendor.createdAt.toLocaleDateString()
                        : new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/vendors/${vendor.id}`}
                        className="text-blue-400 text-xs hover:underline"
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
    </div>
  );
}
