// src/components/maps/MapFilters.tsx
"use client";

import { MapFiltersState, PropertyStatus } from "@/lib/maps/mapTypes";

interface MapFiltersProps {
  filters: MapFiltersState;
  onChange: (updated: MapFiltersState) => void;
  totalCount: number;
  filteredCount: number;
}

const STATUS_OPTIONS: { value: PropertyStatus | "all"; label: string }[] = [
  { value: "all", label: "All Listings" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "poi", label: "Point of Interest" },
];

const PRICE_OPTIONS = [
  { value: 0, label: "No Min" },
  { value: 100000, label: "$100K" },
  { value: 200000, label: "$200K" },
  { value: 300000, label: "$300K" },
  { value: 400000, label: "$400K" },
  { value: 500000, label: "$500K" },
  { value: 750000, label: "$750K" },
  { value: 1000000, label: "$1M" },
];

const MAX_PRICE_OPTIONS = [
  { value: 5000000, label: "No Max" },
  { value: 300000, label: "$300K" },
  { value: 400000, label: "$400K" },
  { value: 500000, label: "$500K" },
  { value: 750000, label: "$750K" },
  { value: 1000000, label: "$1M" },
  { value: 1500000, label: "$1.5M" },
  { value: 2000000, label: "$2M" },
];

export default function MapFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: MapFiltersProps) {
  function update(partial: Partial<MapFiltersState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">

        {/* Status */}
        <div className="flex items-center gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              update({ status: e.target.value as PropertyStatus | "all" })
            }
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0a2342]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div className="flex items-center gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Min
          </label>
          <select
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: Number(e.target.value) })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0a2342]"
          >
            {PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price */}
        <div className="flex items-center gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Max
          </label>
          <select
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0a2342]"
          >
            {MAX_PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Beds */}
        <div className="flex items-center gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Beds
          </label>
          <select
            value={filters.minBeds}
            onChange={(e) => update({ minBeds: Number(e.target.value) })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0a2342]"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Any" : `${n}+`}
              </option>
            ))}
          </select>
        </div>

        {/* Min Baths */}
        <div className="flex items-center gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Baths
          </label>
          <select
            value={filters.minBaths}
            onChange={(e) => update({ minBaths: Number(e.target.value) })}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0a2342]"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Any" : `${n}+`}
              </option>
            ))}
          </select>
        </div>

        {/* Videos Only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showVideosOnly}
            onChange={(e) => update({ showVideosOnly: e.target.checked })}
            className="w-4 h-4 accent-[#0a2342]"
          />
          <span className="text-sm text-gray-700 font-medium">Videos Only</span>
        </label>

        {/* Count */}
        <div className="ml-auto text-xs text-gray-500">
          Showing{" "}
          <span className="font-semibold text-[#0a2342]">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold">{totalCount}</span> listings
        </div>
      </div>
    </div>
  );
}
