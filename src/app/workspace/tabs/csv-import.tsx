"use client";
import { useState, useRef } from 'react';

interface ParsedProperty {
  parcelId: string;
  ownerName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dorDescription: string;
  taxableValue: string;
  assessedValue: string;
  justValue: string;
  landValue: string;
  buildingValue: string;
  streetNumber: string;
  streetDirection: string;
  streetName: string;
  streetType: string;
  unit: string;
  acres: string;
  heatedArea: string;
  bedrooms: string;
  bathrooms: string;
  homestead: string;
  zoningCode: string;
  link: string;
}

function parseCSV(text: string): ParsedProperty[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const sep = lines[0].startsWith('sep=') ? lines[0].replace('sep=', '').trim() : '$';
  const dataLines = lines[0].startsWith('sep=') ? lines.slice(2) : lines.slice(1);
  return dataLines.map(line => {
    const cols = line.split(sep);
    return {
      parcelId: cols[0]?.trim() || '',
      ownerName: cols[1]?.trim() || '',
      address: cols[2]?.trim() || '',
      city: cols[3]?.trim() || '',
      state: cols[4]?.trim() || '',
      zip: cols[5]?.trim() || '',
      dorDescription: cols[7]?.trim() || '',
      taxableValue: cols[9]?.trim() || '',
      assessedValue: cols[10]?.trim() || '',
      landValue: cols[11]?.trim() || '',
      buildingValue: cols[12]?.trim() || '',
      justValue: cols[13]?.trim() || '',
      streetNumber: cols[15]?.trim() || '',
      streetDirection: cols[16]?.trim() || '',
      streetName: cols[17]?.trim() || '',
      streetType: cols[18]?.trim() || '',
      unit: cols[19]?.trim() || '',
      acres: cols[20]?.trim() || '',
      heatedArea: cols[21]?.trim() || '',
      bedrooms: cols[22]?.trim() || '',
      bathrooms: cols[23]?.trim() || '',
      link: cols[24]?.trim() || '',
      homestead: cols[32]?.trim() || '',
      zoningCode: cols[33]?.trim() || '',
    };
  }).filter(p => p.parcelId);
}

interface Props {
  onImport: (data: {
    address: string;
    propertyData: {
      taxId: string;
      beds: string;
      baths: string;
      sqft: string;
      lotSize: string;
      price: string;
      propertyType: string;
      legalDescription: string;
      yearBuilt: string;
      features: string;
      dateAdded: string;
      zoning: string;
      homestead: string;
      assessedValue: string;
      lastSalePrice: string;
      lastSaleYear: string;
      ownerName?: string;
      justValue?: string;
      landValue?: string;
      buildingValue?: string;
      taxableValue?: string;
    };
  }) => void;
}

export default function CSVImport({ onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState<ParsedProperty[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError('No properties found. Make sure this is an Orange County appraiser export.');
          return;
        }
        setProperties(parsed);
        setError('');
      } catch (err) {
        setError('Failed to parse file. Please use the Orange County CSV export.');
      }
    };
    reader.readAsText(file);
  };

  const handleSelect = (p: ParsedProperty) => {
    const fullAddress = `${p.streetNumber} ${p.streetDirection} ${p.streetName} ${p.streetType} ${p.unit}`.replace(/\s+/g, ' ').trim() + `, ${p.city}, ${p.state} ${p.zip}`;
    onImport({
      address: fullAddress,
      propertyData: {
        taxId: p.parcelId,
        beds: p.bedrooms,
        baths: p.bathrooms,
        sqft: p.heatedArea,
        lotSize: p.acres,
        price: '',
        propertyType: p.dorDescription,
        legalDescription: '',
        yearBuilt: '',
        features: '',
        dateAdded: new Date().toLocaleDateString(),
        zoning: p.zoningCode,
        homestead: p.homestead,
        assessedValue: p.assessedValue.replace(/[^0-9.]/g, ''),
        lastSalePrice: '',
        lastSaleYear: '',
        ownerName: p.ownerName,
        justValue: p.justValue !== 'working...' ? p.justValue.replace(/[^0-9.]/g, '') : '',
        landValue: p.landValue !== 'working...' ? p.landValue.replace(/[^0-9.]/g, '') : '',
        buildingValue: p.buildingValue !== 'working...' ? p.buildingValue.replace(/[^0-9.]/g, '') : '',
        taxableValue: p.taxableValue !== 'working...' ? p.taxableValue.replace(/[^0-9.]/g, '') : '',
        lastSaleYear: '',
      },
    });
    setOpen(false);
    setProperties([]);
    setSearch('');
  };

  const filtered = properties.filter(p =>
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.parcelId.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-5 py-3 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 rounded-xl text-blue-200 font-bold transition"
      >
        📂 Import from Orange County Appraiser CSV
      </button>
      {open && (
        <div className="mt-4 bg-white/10 border border-white/20 rounded-2xl p-6">
          {properties.length === 0 ? (
            <div>
              <p className="text-gray-300 text-sm mb-3">
                Download your property export from{' '}
                <a href="https://ocpaweb.ocpafl.org" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">
                  ocpaweb.ocpafl.org
                </a>{' '}
                and upload it here.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#c9a227] file:text-white file:font-bold hover:file:bg-[#b8911f] cursor-pointer"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-green-300 font-bold">{properties.length} properties loaded</p>
                <button onClick={() => setProperties([])} className="text-gray-400 hover:text-white text-sm">← Upload different file</button>
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by address, parcel ID, or owner name..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black mb-4"
              />
              <div className="max-h-72 overflow-y-auto space-y-2">
                {filtered.slice(0, 50).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(p)}
                    className="w-full text-left bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl p-4 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-bold text-sm">{p.address}, {p.city} {p.zip}</p>
                        <p className="text-gray-400 text-xs mt-1">Parcel: {p.parcelId} | {p.dorDescription} | {p.bedrooms} bed / {p.bathrooms} bath | {p.heatedArea} sqft</p>
                        <p className="text-gray-500 text-xs">Owner: {p.ownerName} | Homestead: {p.homestead} | Zoning: {p.zoningCode}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#c9a227] font-bold text-sm">{p.justValue !== 'working...' ? '$' + parseInt(p.justValue || '0').toLocaleString() : 'N/A'}</p>
                        <p className="text-gray-500 text-xs">Just Value</p>
                      </div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No matching properties</p>}
                {filtered.length > 50 && <p className="text-gray-400 text-sm text-center py-2">Showing first 50 — refine your search</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
