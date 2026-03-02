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
  dor_uc: string;
  baths: string;
  property_type: string;
  zoning: string;
  homestead: string;
  acres: string;
  taxable_value: string;
  assessed_value: string;legal_description: string;
  property_link: string;
  land_value: string;
  building_value: string;
  feature_value: string;
  owner_name: string;
  taxing_jurisdiction: string;
  property_link: string;
  search_key: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (parcel: ParcelResult) => void;
}

export default function AddressAutosuggest({ value, onChange, onSelect }: Props) {
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = (val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setResults([]); setShowResults(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/parcel-search?q=' + encodeURIComponent(val.toLowerCase()));
        const data = await res.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleInputChange = (val: string) => {
    onChange(val);
    setSelected(null);
    setConfirmed(false);
    doSearch(val);
  };

  const handlePick = (parcel: ParcelResult) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const fullAddress = parcel.address + ', ' + parcel.city + ', FL ' + parcel.zip;
    onChange(fullAddress);
    setSelected(parcel);
    setConfirmed(false);
    setShowResults(false);
    setResults([]);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      setConfirmed(true);
    }
  };

  const handleClear = () => {
    onChange('');
    setSelected(null);
    setConfirmed(false);
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {!selected && (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Start typing an address... (Orange County FL)"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-lg text-gray-900"
        />
      )}

      {loading && !selected && (
        <div className="absolute right-4 top-4 text-gray-400 text-sm">Searching...</div>
      )}

      {showResults && results.length > 0 && !selected && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto"
          onMouseEnter={() => { if (debounceRef.current) clearTimeout(debounceRef.current); }}
        >
          {results.map((r, i) => (
            <button
              key={i}
              onMouseDown={(e) => { e.preventDefault(); handlePick(r); }}
              className="w-full text-left px-4 py-3 hover:bg-[#c9a227]/10 border-b border-gray-100 last:border-0 transition"
            >
              <div className="font-semibold text-gray-900">{r.address}, {r.city}, FL {r.zip}</div>
              <div className="text-sm text-gray-500">
                {r.year_built ? 'Built ' + r.year_built : ''}
                {r.sqft ? ' · ' + Number(r.sqft).toLocaleString() + ' sqft' : ''}
                {r.beds ? ' · ' + r.beds + ' bed' : ''}
                {r.just_value ? ' · Assessed $' + Number(r.just_value).toLocaleString() : ''}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !loading && value.length >= 3 && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-gray-500 text-sm">
          No matches found. Try a different address.
        </div>
      )}

      {selected && !confirmed && (
        <div className="bg-white border-2 border-[#c9a227] rounded-xl p-5 shadow-lg">
          <div className="text-lg font-bold text-gray-900 mb-1">{selected.address}, {selected.city}, FL {selected.zip}</div>
          <div className="text-sm text-gray-600 mb-4">
            {selected.year_built ? 'Built ' + selected.year_built : ''}
            {selected.sqft ? ' · ' + Number(selected.sqft).toLocaleString() + ' sqft' : ''}
            {selected.beds ? ' · ' + selected.beds + ' bed' : ''}
            {selected.just_value ? ' · Assessed $' + Number(selected.just_value).toLocaleString() : ''}
            {selected.parcel_id ? ' · Parcel: ' + selected.parcel_id : ''}
          </div>
          <p className="text-gray-700 font-semibold mb-3">Is this your property?</p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition"
            >
              ✅ Yes, this is it
            </button>
            <button
              onClick={handleClear}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold transition"
            >
              ❌ No, search again
            </button>
          </div>
        </div>
      )}

      {confirmed && selected && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-green-800">{selected.address}, {selected.city}, FL {selected.zip}</div>
            <div className="text-sm text-green-600">✅ Property confirmed — details auto-filled below</div>
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
