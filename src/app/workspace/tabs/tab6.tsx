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
    salePrice: parseFloat(propertyData.price?.replace(/[^0-9.]/g, '')) || 0,
    address: address || '',
    loanType: 'Conventional',
    downPaymentPct: 20,
    interestRate: 7.25,
    loanTermYears: 30,
    closingDate: '',
    titleInsuranceOwner: 0,
    titleInsuranceLender: 0,
    titleSearch: 350,
    titleExam: 150,
    settlement: 595,
    docStamps: 0,
    intangibleTax: 0,
    annualTaxes: parseFloat(propertyData.assessedValue?.replace(/[^0-9.]/g, '')) * 0.015 || 0,
    hoaMonthly: parseFloat(propertyData.hoaAmount?.replace(/[^0-9.]/g, '')) || 0,
    hoaTransferFee: 0,
    hoaCapitalContribution: 0,
    homeInspection: 400,
    wdoInspection: 125,
    windMitigation: 100,
    fourPointInspection: 150,
    surveyFee: 500,
    appraisalFee: 550,
    homeWarranty: 0,
    miscFees: 0,
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
            <div><label className={labelClass}>Closing Date</label><input type="date" value={inputs.closingDate} onChange={txt('closingDate')} className={inputClass} /></div>
            <div><label className={labelClass}>Loan Type</label>
              <select value={inputs.loanType} onChange={(e) => set('loanType', e.target.value)} className={inputClass}>
                <option value="conventional">Conventional</option>
                <option value="fha">FHA</option>
                <option value="va">VA</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-6"><button onClick={() => setStep(1)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">Next</button></div>
        </div>
      )}

      {/* Step 1: Loan Details */}
      {step === 1 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Loan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Down Payment (%)</label><input type="number" value={inputs.downPaymentPct} onChange={num('downPaymentPct')} className={inputClass} /></div>
            <div><label className={labelClass}>Interest Rate (%)</label><input type="number" step="0.01" value={inputs.interestRate} onChange={num('interestRate')} className={inputClass} /></div>
            <div><label className={labelClass}>Loan Term (Years)</label><input type="number" value={inputs.loanTermYears} onChange={num('loanTermYears')} className={inputClass} /></div>
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
            <div><label className={labelClass}>Owner's Title Insurance ($)</label><input type="number" value={inputs.titleInsuranceOwner} onChange={num('titleInsuranceOwner')} className={inputClass} /></div>
            <div><label className={labelClass}>Lender's Title Insurance ($)</label><input type="number" value={inputs.titleInsuranceLender} onChange={num('titleInsuranceLender')} className={inputClass} /></div>
            <div><label className={labelClass}>Title Search ($)</label><input type="number" value={inputs.titleSearch} onChange={num('titleSearch')} className={inputClass} /></div>
            <div><label className={labelClass}>Title Exam ($)</label><input type="number" value={inputs.titleExam} onChange={num('titleExam')} className={inputClass} /></div>
            <div><label className={labelClass}>Settlement Fee ($)</label><input type="number" value={inputs.settlement} onChange={num('settlement')} className={inputClass} /></div>
            <div><label className={labelClass}>Doc Stamps ($)</label><input type="number" value={inputs.docStamps} onChange={num('docStamps')} className={inputClass} /></div>
            <div><label className={labelClass}>Intangible Tax ($)</label><input type="number" value={inputs.intangibleTax} onChange={num('intangibleTax')} className={inputClass} /></div>
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
          <h2 className="text-2xl font-bold text-white mb-6">Taxes & HOA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Annual Property Taxes ($)</label><input type="number" value={inputs.annualTaxes} onChange={num('annualTaxes')} className={inputClass} /></div>
            <div><label className={labelClass}>HOA Monthly ($)</label><input type="number" value={inputs.hoaMonthly} onChange={num('hoaMonthly')} className={inputClass} /></div>
            <div><label className={labelClass}>HOA Transfer Fee ($)</label><input type="number" value={inputs.hoaTransferFee} onChange={num('hoaTransferFee')} className={inputClass} /></div>
            <div><label className={labelClass}>HOA Capital Contribution ($)</label><input type="number" value={inputs.hoaCapitalContribution} onChange={num('hoaCapitalContribution')} className={inputClass} /></div>
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
          <h2 className="text-2xl font-bold text-white mb-6">Inspections & Other</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Home Inspection ($)</label><input type="number" value={inputs.homeInspection} onChange={num('homeInspection')} className={inputClass} /></div>
            <div><label className={labelClass}>WDO/Pest Inspection ($)</label><input type="number" value={inputs.wdoInspection} onChange={num('wdoInspection')} className={inputClass} /></div>
            <div><label className={labelClass}>Wind Mitigation ($)</label><input type="number" value={inputs.windMitigation} onChange={num('windMitigation')} className={inputClass} /></div>
            <div><label className={labelClass}>4-Point Inspection ($)</label><input type="number" value={inputs.fourPointInspection} onChange={num('fourPointInspection')} className={inputClass} /></div>
            <div><label className={labelClass}>Survey Fee ($)</label><input type="number" value={inputs.surveyFee} onChange={num('surveyFee')} className={inputClass} /></div>
            <div><label className={labelClass}>Appraisal Fee ($)</label><input type="number" value={inputs.appraisalFee} onChange={num('appraisalFee')} className={inputClass} /></div>
            <div><label className={labelClass}>Home Warranty ($)</label><input type="number" value={inputs.homeWarranty} onChange={num('homeWarranty')} className={inputClass} /></div>
            <div><label className={labelClass}>Misc Fees ($)</label><input type="number" value={inputs.miscFees} onChange={num('miscFees')} className={inputClass} /></div>
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
              âœ… {savedMsg}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#c9a227]/20 border border-[#c9a227]/40 rounded-xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-1">Total Buyer Closing Costs</p>
              <p className="text-3xl font-bold text-[#c9a227]">{fmt(results.buyerTotal)}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-1">Total Seller Closing Costs</p>
              <p className="text-3xl font-bold text-white">{fmt(results.sellerTotal)}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-5 text-center">
              <p className="text-gray-300 text-sm mb-1">Est. Monthly Payment</p>
              <p className="text-3xl font-bold text-white">{fmt(results.monthlyPayment)}</p>
            </div>
          </div>

          {/* Buyer Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#c9a227] mb-3 border-b border-white/10 pb-2">Buyer Cost Breakdown</h3>
            <div className="space-y-2">
              {results.buyerLines.map((line: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300 text-sm">{line.label}</span>
                  <span className="text-white font-semibold">{fmt(line.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 mt-2">
                <span className="text-white font-bold text-lg">Total Buyer Costs</span>
                <span className="text-[#c9a227] font-bold text-lg">{fmt(results.buyerTotal)}</span>
              </div>
            </div>
          </div>

          {/* Seller Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#c9a227] mb-3 border-b border-white/10 pb-2">Seller Cost Breakdown</h3>
            <div className="space-y-2">
              {results.sellerLines.map((line: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300 text-sm">{line.label}</span>
                  <span className="text-white font-semibold">{fmt(line.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 mt-2">
                <span className="text-white font-bold text-lg">Total Seller Costs</span>
                <span className="text-[#c9a227] font-bold text-lg">{fmt(results.sellerTotal)}</span>
              </div>
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

      {/* No results yet on step 5 */}
      {step === 5 && !results && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <p className="text-gray-300 mb-4">No results yet. Complete the form and click Calculate.</p>
          <button onClick={() => setStep(0)} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">Start Over</button>
        </div>
      )}

    </div>
  );
}

