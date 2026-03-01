"use client";
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const MILLAGE_RATES = [
{ label: 'General County', mills: 4.4347 },
  { label: 'Unincorporated County Fire', mills: 2.8437 },
  { label: 'Unincorporated Taxing District', mills: 1.8043 },
  { label: 'Library — Operating Budget', mills: 0.3748 },
  { label: 'St Johns Water Management District', mills: 0.1793 },
  { label: 'Public Schools — By State Law (RLE)', mills: 3.2010 },
  { label: 'Public Schools — By Local Board', mills: 3.2480 },
];

const HOMESTEAD_EXEMPTION = 50000;
const ADDITIONAL_EXEMPTION = 25000;

function PropertyTaxContent() {
  const searchParams = useSearchParams();
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [marketValue, setMarketValue] = useState(parseFloat(searchParams.get('price') || '') || 0);
  const [assessedValue, setAssessedValue] = useState(parseFloat(searchParams.get('price') || '') || 0);
  const [customAssessed, setCustomAssessed] = useState(false);
  const [hasHomestead, setHasHomestead] = useState(false);
  const [hasAdditional, setHasAdditional] = useState(false);
  const [inCity, setInCity] = useState(false);
  const [nonAdValorem1, setNonAdValorem1] = useState(800);
  const [nonAdValorem2, setNonAdValorem2] = useState(0);
  const [navLabel1, setNavLabel1] = useState('Waste/Garbage Collection');
  const [navLabel2, setNavLabel2] = useState('Stormwater/Other Assessment');
  const [cityMillage, setCityMillage] = useState(6.75);
  const [calculated, setCalculated] = useState(false);

  const exemptions = hasHomestead ? HOMESTEAD_EXEMPTION + (hasAdditional ? ADDITIONAL_EXEMPTION : 0) : 0;
  const taxableValue = Math.max(0, assessedValue - exemptions);
  const allMillage = [...MILLAGE_RATES, ...(inCity ? [{ label: 'City Millage', mills: cityMillage }] : [])];
  const totalMillage = allMillage.reduce((s, l) => s + l.mills, 0);
  const annualTax = (taxableValue * totalMillage) / 1000;
  const monthlyTax = annualTax / 12;const totalNonAdValorem = nonAdValorem1 + nonAdValorem2;
  const grandTotal = annualTax + totalNonAdValorem;

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black bg-white";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-2";
  const cardClass = "bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20";

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🏛️ Property Tax Estimator</h1>
            <p className="text-gray-300">Orange County, FL — 2024 Millage Rates</p>
          </div>
          <Link href="/closing-costs" className="bg-green-600/30 hover:bg-green-600/50 text-green-300 px-5 py-3 rounded-xl font-bold transition border border-green-500/40">
            🧮 Closing Costs →
          </Link>
        </div>

        {/* Inputs */}
        <div className={`${cardClass} mb-6`}>
          <h2 className="text-xl font-bold text-white mb-6">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Property Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Orlando, FL" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Market / Sale Price ($)</label>
              <input type="number" value={marketValue || ''} onChange={e => { const v = parseFloat(e.target.value) || 0; setMarketValue(v); if (!customAssessed) setAssessedValue(v); }} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>County Assessed Value ($) <span className="text-gray-400 font-normal text-xs">(if different from price)</span></label>
              <input type="number" value={assessedValue || ''} onChange={e => { setAssessedValue(parseFloat(e.target.value) || 0); setCustomAssessed(true); }} className={inputClass} />
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <label className="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" checked={hasHomestead} onChange={e => setHasHomestead(e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
              Homestead Exemption ($50,000 off assessed value)
            </label>
            {hasHomestead && (
              <label className="flex items-center gap-3 text-white cursor-pointer ml-8">
                <input type="checkbox" checked={hasAdditional} onChange={e => setHasAdditional(e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                Additional Low-Income Senior Exemption (+$25,000)
              </label>
            )}
            <label className="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" checked={inCity} onChange={e => setInCity(e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
              Property is within a City limits
            </label>
            {inCity && (
              <div className="ml-8 max-w-xs">
                <label className={labelClass}>City Millage Rate</label>
                <input type="number" step="0.001" value={cityMillage} onChange={e => setCityMillage(parseFloat(e.target.value) || 0)} className={inputClass} />
                <p className="text-gray-400 text-xs mt-1">Orlando: 6.75 · Winter Park: 3.8 · Kissimmee: 6.5</p>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-white/20 pt-6">
            <h3 className="text-white font-bold mb-4">🧾 Non-Ad Valorem Assessments <span className="text-gray-400 font-normal text-sm">(flat fees — garbage, stormwater, etc.)</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Assessment 1 Description</label>
                <input type="text" value={navLabel1} onChange={e => setNavLabel1(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Assessment 1 Amount ($)</label>
                <input type="number" value={nonAdValorem1 || ''} onChange={e => setNonAdValorem1(parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Assessment 2 Description</label>
                <input type="text" value={navLabel2} onChange={e => setNavLabel2(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Assessment 2 Amount ($)</label>
                <input type="number" value={nonAdValorem2 || ''} onChange={e => setNonAdValorem2(parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
            </div>
          </div>

          <button onClick={() => setCalculated(true)} className="mt-6 w-full py-4 rounded-xl bg-[#c9a227] text-white font-bold text-lg hover:bg-[#b8911f] transition">
            Calculate Property Tax Estimate
          </button>
        </div>

        {/* Results */}
        {calculated && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-600/20 border border-blue-400/30 rounded-2xl p-6 text-center">
                <p className="text-blue-300 text-sm font-semibold mb-1">Taxable Value</p>
                <p className="text-3xl font-bold text-white">{fmt(taxableValue)}</p>
                <p className="text-blue-300 text-xs mt-1">After {fmt(exemptions)} in exemptions</p>
              </div>
              <div className="bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-2xl p-6 text-center">
                <p className="text-yellow-300 text-sm font-semibold mb-1">Est. Annual Tax</p>
                <p className="text-3xl font-bold text-white">{fmt(annualTax)}</p>
                <p className="text-yellow-300 text-xs mt-1">Total millage: {totalMillage.toFixed(4)}</p>
              </div>
              <div className="bg-green-600/20 border border-green-400/30 rounded-2xl p-6 text-center">
                <p className="text-green-300 text-sm font-semibold mb-1">Monthly Escrow</p>
                <p className="text-3xl font-bold text-white">{fmt(monthlyTax)}</p>
                <p className="text-green-300 text-xs mt-1">Annual ÷ 12</p>
              </div>            </div>              <div className="bg-red-600/20 border border-red-400/30 rounded-2xl p-6 text-center md:col-span-3">
                <p className="text-red-300 text-sm font-semibold mb-1">🧾 Gross Tax Total (Ad Valorem + Non-Ad Valorem)</p>
                <p className="text-4xl font-bold text-white">{fmt(grandTotal)}</p>
                <p className="text-red-300 text-xs mt-1">Ad Valorem {fmt(annualTax)} + Non-Ad Valorem {fmt(totalNonAdValorem)}</p>
              </div>


            <div className={cardClass}>
              <h2 className="text-xl font-bold text-[#c9a227] mb-6">📐 How We Arrived at This Figure</h2>

              <div className="mb-6">
                <h3 className="text-white font-bold mb-3">Step 1 — Assessed Value</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white"><span>Market / Sale Price</span><span>{fmt(marketValue)}</span></div>
                  <div className="flex justify-between text-gray-400 text-xs"><span className="italic">County may assess below market. Verify at ocpafl.org</span></div>
                  <div className="flex justify-between text-white font-bold border-t border-white/20 pt-2"><span>Assessed Value Used</span><span>{fmt(assessedValue)}</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-bold mb-3">Step 2 — Exemptions</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white"><span>Assessed Value</span><span>{fmt(assessedValue)}</span></div>
                  {hasHomestead && <div className="flex justify-between text-red-300"><span>— Homestead Exemption</span><span>({fmt(HOMESTEAD_EXEMPTION)})</span></div>}
                  {hasAdditional && <div className="flex justify-between text-red-300"><span>— Additional Senior Exemption</span><span>({fmt(ADDITIONAL_EXEMPTION)})</span></div>}
                  {!hasHomestead && <div className="flex justify-between text-gray-400"><span>No exemptions applied</span><span>$0.00</span></div>}
                  <div className="flex justify-between text-white font-bold border-t border-white/20 pt-2"><span>Taxable Value</span><span>{fmt(taxableValue)}</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-bold mb-3">Step 3 — Millage Rate Breakdown</h3>
                <div className="bg-white/5 rounded-xl p-4 text-sm">
                  <div className="grid grid-cols-3 gap-2 text-gray-400 text-xs mb-2 font-semibold">
                    <span>Taxing Authority</span><span className="text-right">Mills</span><span className="text-right">Tax</span>
                  </div>
                  {allMillage.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 py-2 border-b border-white/10">
                      <span className="text-white text-xs">{line.label}</span>
                      <span className="text-right text-gray-300 text-xs">{line.mills.toFixed(4)}</span>
                      <span className="text-right text-yellow-200 text-xs">{fmt((taxableValue * line.mills) / 1000)}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2 pt-3 font-bold">
                    <span className="text-white">TOTAL</span>
                    <span className="text-right text-white">{totalMillage.toFixed(4)}</span>
                    <span className="text-right text-[#c9a227]">{fmt(annualTax)}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-3">Formula: (Taxable Value ÷ 1,000) × Total Millage = Annual Tax</p>
                <p className="text-gray-400 text-xs">({fmt(taxableValue)} ÷ 1,000) × {totalMillage.toFixed(4)} = <strong className="text-white">{fmt(annualTax)}</strong></p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-300 text-xs font-semibold mb-1">⚠️ Estimate Only</p>
                <p className="text-gray-400 text-xs">Based on 2024 Orange County millage rates. Actual taxes may vary. Verify at <a href="https://www.ocpafl.org" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">ocpafl.org</a>.</p>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-green-300 font-bold">Ready to plug this into closing costs?</p>
                <p className="text-gray-300 text-sm">Use <strong className="text-white">{fmt(annualTax)}/year</strong> as the Annual Property Tax in the calculator.</p>
              </div>
              <Link href="/closing-costs" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition whitespace-nowrap">
                Open Calculator →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PropertyTaxPage() {
  return (
    <Suspense fallback={
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </main>
    }>
      <PropertyTaxContent />
    </Suspense>
  );
}
