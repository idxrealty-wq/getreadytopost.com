"use client";
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ClosingCostInputs } from '@/app/closing-costs/types';
import { calculateClosingCosts } from '@/app/closing-costs/calc';

const STEPS = ['Property Info', 'Loan Details', 'Title & Insurance', 'Taxes & HOA', 'Inspections', 'Results'];

interface Tab6Props {
  listingId: string | null;
  address: string;
  propertyData: {
    price: string; beds: string; baths: string; sqft: string;
    taxId: string; yearBuilt: string; lotSize: string; features: string;
    dateAdded: string; legalDescription: string;
  };
  savedEstimate?: any;
}

export default function Tab6ClosingCosts({ listingId, address, propertyData, savedEstimate }: Tab6Props) {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black bg-white";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-2";
  const cardClass = "bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20";

  const defaultInputs: ClosingCostInputs = {
    salePrice: parseFloat(propertyData.price?.replace(/[^0-9.]/g, '')) || 0,
    address: address || '',
    county: 'Orange',
    closingDate: '',
    isFinanced: true,
    loanAmount: Math.round((parseFloat(propertyData.price?.replace(/[^0-9.]/g, '')) || 0) * 0.8),
    interestRate: 7.0,
    loanType: 'Conventional',
    titleInsuranceProvider: 'Seller',
    ownersTitleInsurance: true,
    lendersTitleInsurance: true,
    surveyRequired: false,
    surveyAmount: 450,
    annualPropertyTax: 0,
    homesteadExemption: false,
    taxesPaidThrough: '',
    hasHOA: false,
    hoaMonthly: 0,
    hoaEstoppelFee: 250,
    homeownersInsuranceAnnual: 0,
    floodInsuranceAnnual: 0,
    listingAgentCommission: 3,
    buyerAgentCommission: 3,
    existingMortgagePayoff: 0,
    sellerConcessions: 0,
    earnestMoneyDeposit: 0,
    escrowMonths: 3,
    homeInspection: 400,
    pestInspection: 125,
    windMitigation: 100,
    fourPointInspection: 150,
  };

  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<ClosingCostInputs>(savedEstimate?.inputs || defaultInputs);
  const [results, setResults] = useState<ReturnType<typeof calculateClosingCosts> | null>(savedEstimate?.results || null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (savedEstimate?.results) { setResults(savedEstimate.results); setStep(5); }
  }, [savedEstimate]);

  const set = (field: keyof ClosingCostInputs, value: any) => setInputs(prev => ({ ...prev, [field]: value }));
  const num = (field: keyof ClosingCostInputs) => (e: React.ChangeEvent<HTMLInputElement>) => set(field, parseFloat(e.target.value) || 0);
  const txt = (field: keyof ClosingCostInputs) => (e: React.ChangeEvent<HTMLInputElement>) => set(field, e.target.value);

  const handleCalculate = async () => {
    const r = calculateClosingCosts(inputs);
    setResults(r);
    setStep(5);
    if (listingId) {
      setSaving(true);
      try {
        await updateDoc(doc(db, 'listings', listingId), {
          closingCostEstimate: { inputs, results: r, calculatedAt: new Date().toISOString() },
          updatedAt: new Date().toISOString(),
        });
        setSavedMsg('✅ Estimate saved to this listing!');
        setTimeout(() => setSavedMsg(''), 4000);
      } catch (e) { console.error(e); }
      setSaving(false);
    }
  };

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div>
      {/* Pre-fill notice */}
      {propertyData.price && (
        <div className="bg-green-600/20 border border-green-400/30 rounded-xl p-4 mb-6">
          <p className="text-green-300 text-sm">✅ Pre-filled from listing: <strong>{address}</strong> — Sale price: <strong>${parseFloat(propertyData.price?.replace(/[^0-9.]/g, '') || '0').toLocaleString()}</strong>, Loan: <strong>${inputs.loanAmount.toLocaleString()}</strong> (80% default)</p>
        </div>
      )}

      {/* Stepper */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => i < 5 && setStep(i)} className={`px-3 py-2 rounded-full text-xs font-bold transition ${step === i ? 'bg-[#c9a227] text-white' : i < step ? 'bg-green-600/30 text-green-300' : 'bg-white/10 text-gray-400'}`}>
            {i < step ? '✓' : i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Step 0: Property Info */}
      {step === 0 && (
        <div className={cardClass}>
          <h2 className="text-xl font-bold text-white mb-4">📍 Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Property Address</label><input type="text" value={inputs.address} onChange={txt('address')} className={inputClass} /></div>
            <div><label className={labelClass}>Sale Price ($)</label><input type="number" value={inputs.salePrice || ''} onChange={num('salePrice')} className={inputClass} /></div>
            <div><label className={labelClass}>Closing Date</label><input type="date" value={inputs.closingDate} onChange={txt('closingDate')} className={inputClass} /></div>
            <div><label className={labelClass}>County</label><input type="text" value={inputs.county} onChange={txt('county')} className={inputClass} /></div>
          </div>
        </div>
      )}

      {/* Step 1: Loan Details */}
      {step === 1 && (
        <div className={cardClass}>
          <h2 className="text-xl font-bold text-white mb-4">💰 Loan Details</h2>
          <div className="mb-4">
            <label className="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" checked={inputs.isFinanced} onChange={(e) => set('isFinanced', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
              Buyer is financing
            </label>
          </div>
          {inputs.isFinanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Loan Amount ($)</label><input type="number" value={inputs.loanAmount || ''} onChange={num('loanAmount')} className={inputClass} /></div>
              <div><label className={labelClass}>Interest Rate (%)</label><input type="number" step="0.125" value={inputs.interestRate || ''} onChange={num('interestRate')} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Loan Type</label>
                <select value={inputs.loanType} onChange={(e) => set('loanType', e.target.value)} className={inputClass}>
                  <option>Conventional</option><option>FHA</option><option>VA</option><option>USDA</option><option>Cash</option>
                </select>
              </div>
              <div><label className={labelClass}>Earnest Money Deposit ($)</label><input type="number" value={inputs.earnestMoneyDeposit || ''} onChange={num('earnestMoneyDeposit')} className={inputClass} /></div>
              <div><label className={labelClass}>Escrow Months</label><input type="number" value={inputs.escrowMonths || ''} onChange={num('escrowMonths')} className={inputClass} /></div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Title & Insurance */}
      {step === 2 && (
        <div className={cardClass}>
          <h2 className="text-xl font-bold text-white mb-4">📋 Title & Insurance</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" checked={inputs.ownersTitleInsurance} onChange={(e) => set('ownersTitleInsurance', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
              Owner&apos;s Title Insurance
            </label>
            {inputs.isFinanced && (
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <input type="checkbox" checked={inputs.lendersTitleInsurance} onChange={(e) => set('lendersTitleInsurance', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                Lender&apos;s Title Insurance
              </label>
            )}
            <label className="flex items-center gap-3 text-white cursor-pointer">
              <input type="checkbox" checked={inputs.surveyRequired} onChange={(e) => set('surveyRequired', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
              Survey Required
            </label>
            {inputs.surveyRequired && (
              <div><label className={labelClass}>Survey Amount ($)</label><input type="number" value={inputs.surveyAmount || ''} onChange={num('surveyAmount')} className={inputClass} /></div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div><label className={labelClass}>Homeowners Insurance (Annual $)</label><input type="number" value={inputs.homeownersInsuranceAnnual || ''} onChange={num('homeownersInsuranceAnnual')} className={inputClass} /></div>
              <div><label className={labelClass}>Flood Insurance (Annual $)</label><input type="number" value={inputs.floodInsuranceAnnual || ''} onChange={num('floodInsuranceAnnual')} className={inputClass} /></div>
              <div><label className={labelClass}>Listing Agent Commission (%)</label><input type="number" step="0.1" value={inputs.listingAgentCommission || ''} onChange={num('listingAgentCommission')} className={inputClass} /></div>
              <div><label className={labelClass}>Buyer Agent Commission (%)</label><input type="number" step="0.1" value={inputs.buyerAgentCommission || ''} onChange={num('buyerAgentCommission')} className={inputClass} /></div>
              <div><label className={labelClass}>Existing Mortgage Payoff ($)</label><input type="number" value={inputs.existingMortgagePayoff || ''} onChange={num('existingMortgagePayoff')} className={inputClass} /></div>
              <div><label className={labelClass}>Seller Concessions ($)</label><input type="number" value={inputs.sellerConcessions || ''} onChange={num('sellerConcessions')} className={inputClass} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Taxes & HOA */}
      {step === 3 && (
        <div className={cardClass}>
          <h2 className="text-xl font-bold text-white mb-4">🏛️ Taxes & HOA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Annual Property Tax ($)</label><input type="number" value={inputs.annualPropertyTax || ''} onChange={num('annualPropertyTax')} className={inputClass} /></div>
            <div><label className={labelClass}>Tax Paid Through</label><input type="date" value={inputs.taxesPaidThrough} onChange={txt('taxesPaidThrough')} className={inputClass} /></div>
            <div className="col-span-2">
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <input type="checkbox" checked={inputs.homesteadExemption} onChange={(e) => set('homesteadExemption', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                Homestead Exemption
              </label>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-3 text-white cursor-pointer mb-4">
                <input type="checkbox" checked={inputs.hasHOA} onChange={(e) => set('hasHOA', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                Property has HOA
              </label>
            </div>
            {inputs.hasHOA && (
              <>
                <div><label className={labelClass}>HOA Monthly ($)</label><input type="number" value={inputs.hoaMonthly || ''} onChange={num('hoaMonthly')} className={inputClass} /></div>
                <div><label className={labelClass}>HOA Estoppel Fee ($)</label><input type="number" value={inputs.hoaEstoppelFee || ''} onChange={num('hoaEstoppelFee')} className={inputClass} /></div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Step 4: Inspections */}
      {step === 4 && (
        <div className={cardClass}>
          <h2 className="text-xl font-bold text-white mb-4">🔍 Inspections & Other</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Home Inspection ($)</label><input type="number" value={inputs.homeInspection || ''} onChange={num('homeInspection')} className={inputClass} /></div>
            <div><label className={labelClass}>WDO/Pest Inspection ($)</label><input type="number" value={inputs.pestInspection || ''} onChange={num('pestInspection')} className={inputClass} /></div>
            <div><label className={labelClass}>Wind Mitigation ($)</label><input type="number" value={inputs.windMitigation || ''} onChange={num('windMitigation')} className={inputClass} /></div>
            <div><label className={labelClass}>4-Point Inspection ($)</label><input type="number" value={inputs.fourPointInspection || ''} onChange={num('fourPointInspection')} className={inputClass} /></div>
          </div>
          <div className="mt-6 p-5 bg-[#c9a227]/10 rounded-xl border border-[#c9a227]/30">
            <p className="text-[#c9a227] font-bold mb-1">Ready to Calculate</p>
            <p className="text-gray-300 text-sm">Click Calculate below to generate your full TRID-style breakdown. Results will auto-save to this listing.</p>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {step === 5 && results && (
        <div className="space-y-4">
          {savedMsg && <div className="bg-green-600/20 border border-green-400/30 rounded-xl p-4 text-green-300 font-semibold">{savedMsg}</div>}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-600/20 border border-blue-400/30 rounded-2xl p-6">
              <p className="text-blue-300 text-sm font-semibold mb-1">BUYER — Cash to Close</p>
              <p className="text-3xl font-bold text-white">{fmt(results.buyerCashToClose)}</p>
              <p className="text-blue-300 text-xs mt-1">Closing costs: {fmt(results.buyerTotal)}</p>
            </div>
            <div className="bg-green-600/20 border border-green-400/30 rounded-2xl p-6">
              <p className="text-green-300 text-sm font-semibold mb-1">SELLER — Net Proceeds</p>
              <p className="text-3xl font-bold text-white">{fmt(results.sellerNetProceeds)}</p>
              <p className="text-green-300 text-xs mt-1">Closing costs: {fmt(results.sellerTotal)}</p>
            </div>
          </div>

          {/* Line Items by Section */}
          {Array.from(new Set(results.lineItems.map(i => i.section))).map(section => (
            <div key={section} className={cardClass}>
              <h3 className="text-base font-bold text-[#c9a227] mb-3">{section}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-gray-400 pb-2 text-xs">#</th>
                      <th className="text-left text-gray-400 pb-2 text-xs">Description</th>
                      <th className="text-right text-blue-300 pb-2 text-xs">Buyer</th>
                      <th className="text-right text-green-300 pb-2 text-xs">Seller</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.lineItems.filter(i => i.section === section).map((item, idx) => (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-2 text-gray-500 pr-3 text-xs">{item.lineNumber}</td>
                        <td className="py-2 text-white text-xs">{item.label}</td>
                        <td className="py-2 text-right text-blue-200 text-xs">{item.buyerAmount !== 0 ? fmt(item.buyerAmount) : '—'}</td>
                        <td className="py-2 text-right text-green-200 text-xs">{item.sellerAmount !== 0 ? fmt(item.sellerAmount) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className={`${cardClass} border-[#c9a227]/50`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Total Buyer Costs</p>
                <p className="text-2xl font-bold text-blue-300">{fmt(results.buyerTotal)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Seller Costs</p>
                <p className="text-2xl font-bold text-green-300">{fmt(results.sellerTotal)}</p>
              </div>
            </div>
          </div>

          <button onClick={() => { setStep(0); setResults(null); setInputs(defaultInputs); }} className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">
            ← Recalculate
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 5 && (
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold disabled:opacity-30 hover:bg-white/20 transition">
            ← Back
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-6 py-3 rounded-xl bg-[#c9a227] text-white font-bold hover:bg-[#b8911f] transition">
              Next →
            </button>
          ) : (
            <button onClick={handleCalculate} disabled={saving} className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition">
              {saving ? 'Saving...' : 'Calculate & Save ✓'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
