"use client";
import { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { ClosingCostInputs } from '@/app/closing-costs/types';
import { calculateClosingCosts } from '@/app/closing-costs/calc';

const STEPS = ['Property Info', 'Loan Details', 'Title & Insurance', 'Taxes & HOA', 'Inspections', 'Results'];

interface Tab6Props {
  listingId: string | null;
  address: string;
  propertyData: any;
  savedEstimate?: any;
}

export default function Tab6ClosingCosts({ listingId, address, propertyData, savedEstimate }: Tab6Props) {
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black bg-white";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-2";

  const defaultInputs: ClosingCostInputs = {
    salePrice: parseFloat(String(propertyData.price || '').replace(/[^0-9.]/g, '')) || 0,
    address: address || '',
    county: propertyData.county || 'Orange',
    closingDate: '',
    isFinanced: true,
    loanAmount: 0,
    interestRate: 7.25,
    loanType: 'Conventional',
    titleInsuranceProvider: 'Seller',
    ownersTitleInsurance: true,
    lendersTitleInsurance: true,
    surveyRequired: true,
    surveyAmount: 500,
    annualPropertyTax: parseFloat(String(propertyData.assessedValue || '').replace(/[^0-9.]/g, '')) * 0.015 || 0,
    homesteadExemption: false,
    taxesPaidThrough: '',
    hasHOA: false,
    hoaMonthly: parseFloat(String(propertyData.hoaAmount || '').replace(/[^0-9.]/g, '')) || 0,
    hoaEstoppelFee: 250,
    homeownersInsuranceAnnual: 2400,
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
  const chk = (field: keyof ClosingCostInputs) => (e: React.ChangeEvent<HTMLInputElement>) => set(field, e.target.checked);

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
        const user = auth.currentUser;
        if (user) {
          const estimateId = listingId + '_estimate';
          await setDoc(doc(db, 'users', user.uid, 'closingCostEstimates', estimateId), {
            id: estimateId,
            listingId,
            address: inputs.address || address || '',
            inputs,
            results: r,
            savedAt: new Date().toISOString(),
          });
        }
        setSavedMsg('Estimate saved!');
        setTimeout(() => setSavedMsg(''), 4000);
      } catch (e) { console.error(e); }
      setSaving(false);
    }
  };

  const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} className={'px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ' + (step === i ? 'bg-[#c9a227] text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20')}>
              {i + 1}. {s}
            </button>
          ))}
        </div>
      </div>

      {/* Step 0: Property Info */}
      {step === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Property Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Property Address</label><input type="text" value={inputs.address} onChange={txt('address')} className={inputClass} /></div>
            <div><label className={labelClass}>Sale Price ($)</label><input type="number" value={inputs.salePrice} onChange={num('salePrice')} className={inputClass} /></div>
            <div><label className={labelClass}>County</label><input type="text" value={inputs.county} onChange={txt('county')} className={inputClass} /></div>
            <div><label className={labelClass}>Closing Date</label><input type="date" value={inputs.closingDate} onChange={txt('closingDate')} className={inputClass} /></div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setStep(1)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">Next</button>
          </div>
        </div>
      )}

      {/* Step 1: Loan Details */}
      {step === 1 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Loan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 col-span-2">
              <input type="checkbox" id="isFinanced" checked={inputs.isFinanced} onChange={chk('isFinanced')} className="w-5 h-5 accent-[#c9a227]" />
              <label htmlFor="isFinanced" className="text-gray-300 font-semibold">Financed Purchase</label>
            </div>
            {inputs.isFinanced && (<>
              <div><label className={labelClass}>Loan Amount ($)</label><input type="number" value={inputs.loanAmount} onChange={num('loanAmount')} className={inputClass} /></div>
              <div><label className={labelClass}>Interest Rate (%)</label><input type="number" step="0.01" value={inputs.interestRate} onChange={num('interestRate')} className={inputClass} /></div>
              <div><label className={labelClass}>Loan Type</label>
                <select value={inputs.loanType} onChange={(e) => set('loanType', e.target.value)} className={inputClass}>
                  <option value="Conventional">Conventional</option>
                  <option value="FHA">FHA</option>
                  <option value="VA">VA</option>
                  <option value="USDA">USDA</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </>)}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(0)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition">Back</button>
            <button onClick={() => setStep(2)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">Next</button>
          </div>
        </div>
      )}

      {/* Step 2: Title & Insurance */}
      {step === 2 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Title & Insurance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Title Insurance Provider</label>
              <select value={inputs.titleInsuranceProvider} onChange={(e) => set('titleInsuranceProvider', e.target.value)} className={inputClass}>
                <option value="Seller">Seller</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="ownersTI" checked={inputs.ownersTitleInsurance} onChange={chk('ownersTitleInsurance')} className="w-5 h-5 accent-[#c9a227]" />
              <label htmlFor="ownersTI" className="text-gray-300 font-semibold">Owner's Title Insurance</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="lendersTI" checked={inputs.lendersTitleInsurance} onChange={chk('lendersTitleInsurance')} className="w-5 h-5 accent-[#c9a227]" />
              <label htmlFor="lendersTI" className="text-gray-300 font-semibold">Lender's Title Insurance</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="survey" checked={inputs.surveyRequired} onChange={chk('surveyRequired')} className="w-5 h-5 accent-[#c9a227]" />
              <label htmlFor="survey" className="text-gray-300 font-semibold">Survey Required</label>
            </div>
            {inputs.surveyRequired && (
              <div><label className={labelClass}>Survey Amount ($)</label><input type="number" value={inputs.surveyAmount} onChange={num('surveyAmount')} className={inputClass} /></div>
            )}
            <div><label className={labelClass}>Homeowners Insurance Annual ($)</label><input type="number" value={inputs.homeownersInsuranceAnnual} onChange={num('homeownersInsuranceAnnual')} className={inputClass} /></div>
            <div><label className={labelClass}>Flood Insurance Annual ($)</label><input type="number" value={inputs.floodInsuranceAnnual} onChange={num('floodInsuranceAnnual')} className={inputClass} /></div>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition">Back</button>
            <button onClick={() => setStep(3)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Taxes & HOA */}
      {step === 3 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Taxes, HOA & Commission</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Annual Property Tax ($)</label><input type="number" value={inputs.annualPropertyTax} onChange={num('annualPropertyTax')} className={inputClass} /></div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="homestead" checked={inputs.homesteadExemption} onChange={chk('homesteadExemption')} className="w-5 h-5 accent-[#c9a227]" />
              <label htmlFor="homestead" className="text-gray-300 font-semibold">Homestead Exemption</label>
            </div>
            <div><label className={labelClass}>Taxes Paid Through</label><input type="text" value={inputs.taxesPaidThrough} onChange={txt('taxesPaidThrough')} placeholder="e.g. December 2024" className={inputClass} /></div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="hasHOA" checked={inputs.hasHOA} onChange={chk('hasHOA')} className="w-5 h-5 accent-[#c9a227]" />
              <label htmlFor="hasHOA" className="text-gray-300 font-semibold">Has HOA</label>
            </div>
            {inputs.hasHOA && (<>
              <div><label className={labelClass}>HOA Monthly ($)</label><input type="number" value={inputs.hoaMonthly} onChange={num('hoaMonthly')} className={inputClass} /></div>
              <div><label className={labelClass}>HOA Estoppel Fee ($)</label><input type="number" value={inputs.hoaEstoppelFee} onChange={num('hoaEstoppelFee')} className={inputClass} /></div>
            </>)}
            <div><label className={labelClass}>Listing Agent Commission (%)</label><input type="number" step="0.1" value={inputs.listingAgentCommission} onChange={num('listingAgentCommission')} className={inputClass} /></div>
            <div><label className={labelClass}>Buyer Agent Commission (%)</label><input type="number" step="0.1" value={inputs.buyerAgentCommission} onChange={num('buyerAgentCommission')} className={inputClass} /></div>
            <div><label className={labelClass}>Existing Mortgage Payoff ($)</label><input type="number" value={inputs.existingMortgagePayoff} onChange={num('existingMortgagePayoff')} className={inputClass} /></div>
            <div><label className={labelClass}>Seller Concessions ($)</label><input type="number" value={inputs.sellerConcessions} onChange={num('sellerConcessions')} className={inputClass} /></div>
            <div><label className={labelClass}>Earnest Money Deposit ($)</label><input type="number" value={inputs.earnestMoneyDeposit} onChange={num('earnestMoneyDeposit')} className={inputClass} /></div>
            <div><label className={labelClass}>Escrow Months</label><input type="number" value={inputs.escrowMonths} onChange={num('escrowMonths')} className={inputClass} /></div>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition">Back</button>
            <button onClick={() => setStep(4)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">Next</button>
          </div>
        </div>
      )}

      {/* Step 4: Inspections */}
      {step === 4 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Inspections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Home Inspection ($)</label><input type="number" value={inputs.homeInspection} onChange={num('homeInspection')} className={inputClass} /></div>
            <div><label className={labelClass}>Pest/WDO Inspection ($)</label><input type="number" value={inputs.pestInspection} onChange={num('pestInspection')} className={inputClass} /></div>
            <div><label className={labelClass}>Wind Mitigation ($)</label><input type="number" value={inputs.windMitigation} onChange={num('windMitigation')} className={inputClass} /></div>
            <div><label className={labelClass}>4-Point Inspection ($)</label><input type="number" value={inputs.fourPointInspection} onChange={num('fourPointInspection')} className={inputClass} /></div>
          </div>
          <div className="bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl p-4 mt-4">
            <p className="text-[#c9a227] font-bold mb-1">Ready to Calculate</p>
            <p className="text-gray-300 text-sm">Click Calculate to generate your full TRID-style breakdown. Results auto-save to this listing and your vault.</p>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(3)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition">Back</button>
            <button onClick={handleCalculate} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Calculate & Save'}
            </button>
          </div>
        </div>
      )}
      {/* Step 5: Results */}
      {step === 5 && results && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-2">Closing Cost Estimate</h2>
          <p className="text-gray-400 text-sm mb-6">{inputs.address}</p>

          {savedMsg && (
            <div className="bg-green-600/20 border border-green-400/30 rounded-xl p-4 text-green-300 font-semibold mb-4">
              {savedMsg}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#c9a227]/20 border border-[#c9a227]/40 rounded-xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-1">Buyer Total</p>
              <p className="text-2xl font-bold text-[#c9a227]">{fmt(results.buyerTotal)}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-1">Seller Total</p>
              <p className="text-2xl font-bold text-white">{fmt(results.sellerTotal)}</p>
            </div>
            <div className="bg-green-600/20 border border-green-400/30 rounded-xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-1">Buyer Cash to Close</p>
              <p className="text-2xl font-bold text-green-300">{fmt(results.buyerCashToClose)}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-1">Seller Net Proceeds</p>
              <p className="text-2xl font-bold text-white">{fmt(results.sellerNetProceeds)}</p>
            </div>
          </div>

          {/* TRID Line Items */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#c9a227] mb-3 border-b border-white/10 pb-2">TRID Line Item Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-gray-400 py-2 pr-4">#</th>
                    <th className="text-left text-gray-400 py-2 pr-4">Section</th>
                    <th className="text-left text-gray-400 py-2 pr-4">Description</th>
                    <th className="text-right text-gray-400 py-2 pr-4">Buyer</th>
                    <th className="text-right text-gray-400 py-2">Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {results.lineItems.map((line, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="text-gray-500 py-2 pr-4">{line.lineNumber}</td>
                      <td className="text-gray-400 py-2 pr-4 text-xs">{line.section}</td>
                      <td className="text-gray-300 py-2 pr-4">{line.label}</td>
                      <td className="text-white py-2 pr-4 text-right font-mono">{line.buyerAmount ? fmt(line.buyerAmount) : '-'}</td>
                      <td className="text-white py-2 text-right font-mono">{line.sellerAmount ? fmt(line.sellerAmount) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#c9a227]/40">
                    <td colSpan={3} className="text-white font-bold py-3">TOTALS</td>
                    <td className="text-[#c9a227] font-bold py-3 text-right font-mono">{fmt(results.buyerTotal)}</td>
                    <td className="text-[#c9a227] font-bold py-3 text-right font-mono">{fmt(results.sellerTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => setStep(0)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition">
              Edit Inputs
            </button>
            <button onClick={handleCalculate} disabled={saving} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Recalculate & Save'}
            </button>
          </div>
        </div>
      )}

      {step === 5 && !results && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <p className="text-gray-300 mb-4">No results yet. Complete the form and click Calculate.</p>
          <button onClick={() => setStep(0)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">Start Over</button>
        </div>
      )}

    </div>
  );
}
