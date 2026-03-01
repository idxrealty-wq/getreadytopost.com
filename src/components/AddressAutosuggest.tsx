"use client";
import { useState, useRef, useEffect } from 'react';

interface ParcelResult {
  parcel_id: string;
  address: string;
  city: string;
  zip: string;
  county: string;
  year_built: string;
  sqft: string;
  beds: string;
  just_value: string;
  sale_price: string;
  sale_year: string;
  land_sqft: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (parcel: ParcelResult) => void;
}

export default function AddressAutosuggest({ value, onChange, onSelect }: Props) {
  const [results, setResults] = useState<ParcelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/parcel-search?q=' + encodeURIComponent(val.toLowerCase()));
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (parcel: ParcelResult) => {
    onChange(parcel.address + ', ' + parcel.city + ', FL ' + parcel.zip);
    onSelect(parcel);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start typing an address... (Orange County FL)"
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-lg text-gray-900"
      />
      {loading && (
        <div className="absolute right-4 top-4 text-gray-400 text-sm">Searching...</div>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-[#c9a227]/10 border-b border-gray-100 last:border-0 transition"
            >
              <div className="font-semibold text-gray-900">{r.address}, {r.city}, FL {r.zip}</div>
              <div className="text-sm text-gray-500">
                {r.year_built ? 'Built ' + r.year_built : ''}
                {r.sqft ? ' · ' + Number(r.sqft).toLocaleString() + ' sqft' : ''}
                {r.just_value ? ' · Assessed $' + Number(r.just_value).toLocaleString() : ''}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && !loading && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-gray-500 text-sm">
          No matches found. Try a different address.
        </div>
      )}
    </div>
  );
}
