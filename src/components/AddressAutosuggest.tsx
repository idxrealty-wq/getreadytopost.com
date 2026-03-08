"use client";

import { useState, useRef, useEffect } from "react";

interface ParcelResult {
  parcel_id: string;
  address: string;
  city: string;
  zip: string;
  county: string;
  year_built: string;
  sqft: string;
  beds: string;
  baths: string;
  just_value: string;
  sale_price: string;
  sale_year: string;
  land_sqft: string;
  dor_uc: string;
  property_type: string;
  zoning: string;
  homestead: string;
  acres: string;
  taxable_value: string;
  assessed_value: string;
  legal_description: string;
  property_link: string;
  land_value: string;
  building_value: string;
  feature_value: string;
  owner_name: string;
  taxing_jurisdiction: string;
  search_key: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (parcel: ParcelResult) => void;
  state?: string;
  city?: string;
}

export default function AddressAutosuggest({
  value,
  onChange,
  onSelect,
  state = "Florida",
  city = "",
}: Props) {
  const [results, setResults] = useState<ParcelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState<ParcelResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = (val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 5) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("q", val);
        if (state && state.trim()) params.set("state", state.trim());
        if (city && city.trim()) params.set("city", city.trim());

        const res = await fetch("/api/parcel-search?" + params.toString());
        const data = await res.json();

        setResults(data.results || []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 450);
  };

   const handleInputChange = (val: string) => {
    onChange(val);
    setSelected(null);
    setConfirmed(false);
  };

  const handleSearch = () => {
    if (value.length >= 5) doSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };
  const handlePick = (parcel: ParcelResult) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const fullAddressParts = [parcel.address, parcel.city, parcel.zip].filter(Boolean);
    const fullAddress = fullAddressParts.join(", ");

    onChange(fullAddress);
    setSelected(parcel);
    setShowResults(false);
    setResults([]);

    // Auto-confirm immediately (no extra click)
    onSelect(parcel);
    setConfirmed(true);
  };

  const handleClear = () => {
    onChange("");
    setSelected(null);
    setConfirmed(false);
    setResults([]);
    setShowResults(false);
  };

  const formatDetail = (parcel: ParcelResult) => {
    const parts: string[] = [];
    if (parcel.year_built) parts.push("Built " + parcel.year_built);
    if (parcel.sqft) parts.push(Number(parcel.sqft).toLocaleString() + " sqft");
    if (parcel.beds) parts.push(parcel.beds + " bed");
    if (parcel.baths) parts.push(parcel.baths + " bath");
    if (parcel.just_value) parts.push("Assessed $" + Number(parcel.just_value).toLocaleString());
    return parts.join(" | ");
  };

  const formatConfirmDetail = (parcel: ParcelResult) => {
    const parts: string[] = [];
    if (parcel.year_built) parts.push("Built " + parcel.year_built);
    if (parcel.sqft) parts.push(Number(parcel.sqft).toLocaleString() + " sqft");
    if (parcel.beds) parts.push(parcel.beds + " bed");
    if (parcel.baths) parts.push(parcel.baths + " bath");
    if (parcel.just_value) parts.push("Assessed $" + Number(parcel.just_value).toLocaleString());
    if (parcel.parcel_id) parts.push("Parcel: " + parcel.parcel_id);
    return parts.join(" | ");
  };

  return (
    <div ref={wrapperRef} className="relative">
      {!selected && (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type full address then press Enter or Search..."
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-lg text-gray-900"
        />
            )}
      {!selected && (
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || value.length < 5}
          className="mt-2 w-full bg-[#c9a227] hover:bg-[#b8911f] disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition"
        >
          {loading ? 'Searching...' : 'Search Property'}
        </button>
      )}
      {loading && !selected && (

        <div className="absolute right-4 top-4 text-gray-400 text-sm">Searching...</div>
      )}

      {showResults && results.length > 0 && !selected && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto"
          onMouseEnter={() => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
          }}
        >
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handlePick(r);
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#c9a227]/10 border-b border-gray-100 last:border-0 transition"
            >
              <div className="font-semibold text-gray-900">
                {r.address}, {r.city}, {r.zip}
              </div>
              <div className="text-sm text-gray-500">{formatDetail(r)}</div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !loading && value.length >= 5 && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-gray-500 text-sm">
          No matches found. Try a different address.
        </div>
      )}

      {confirmed && selected && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-green-800">
              {selected.address}, {selected.city}, {selected.zip}
            </div>
            <div className="text-sm text-green-600">{formatConfirmDetail(selected)}</div>
          </div>
          <button
            onClick={handleClear}
            className="text-gray-500 hover:text-red-500 text-sm font-bold transition"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
