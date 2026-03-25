"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vendor, VendorStatus } from "@/types/vendor";

export default function VendorListPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "all">("all");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vendors");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete vendor");
        return;
      }
      setVendors(vendors.filter((v) => v.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.categoryId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Vendors</h1>
            <p className="text-gray-400 text-sm mt-1">Manage all vendor records</p>
          </div>
          <button
            onClick={() => router.push("/admin/vendors/new")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg transition"
          >
            New Vendor
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Business name, email, or category..."
                className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as VendorStatus | "all")}
                className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="inactive">Inactive</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center text-gray-400">No vendors found.</div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="text-left text-white font-bold px-6 py-3">Business Name</th>
                  <th className="text-left text-white font-bold px-6 py-3">Contact</th>
                  <th className="text-left text-white font-bold px-6 py-3">Category</th>
                  <th className="text-left text-white font-bold px-6 py-3">Tier</th>
                  <th className="text-left text-white font-bold px-6 py-3">Status</th>
                  <th className="text-left text-white font-bold px-6 py-3">Verified</th>
                  <th className="text-left text-white font-bold px-6 py-3">Verified Date</th>
                  <th className="text-center text-white font-bold px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="text-white px-6 py-3">{vendor.businessName}</td>
                    <td className="text-gray-400 px-6 py-3">
                      {vendor.contactName}
                      <br />
                      <span className="text-sm">{vendor.email}</span>
                    </td>
                    <td className="text-gray-400 px-6 py-3">{vendor.categoryId}</td>
                    <td className="text-gray-400 px-6 py-3 capitalize">{vendor.tier}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
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
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          vendor.isVerified
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {vendor.isVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="text-gray-400 px-6 py-3 text-sm">
                      {vendor.verifiedDate
                        ? new Date(vendor.verifiedDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="text-center px-6 py-3 space-x-2">
                      <button
                        onClick={() => router.push(`/admin/vendors/${vendor.id}`)}
                        className="text-yellow-500 hover:text-yellow-400 text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="text-red-500 hover:text-red-400 text-sm font-bold"
                      >
                        Delete
                      </button>
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
