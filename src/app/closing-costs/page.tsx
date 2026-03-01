"use client";
import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import type { ClosingCostInputs } from './types';
import { calculateClosingCosts } from './calc';

const STEPS = ['Property Info', 'Loan Details', 'Title & Insurance', 'Taxes & HOA', 'Inspections & Other', 'Results'];

const defaultInputs: ClosingCostInputs = {
  salePrice: 0, address: '', county: 'Orange', closingDate: '',
  isFinanced: true, loanAmount: 0, interestRate: 7.0, loanType: 'Conventional',
  titleInsuranceProvider: 'Seller', ownersTitleInsurance: true, lendersTitleInsurance: true,
  surveyRequired: false, surveyAmount: 450,
  annualPropertyTax: 0, homesteadExemption: false, taxesPaidThrough: '',
  hasHOA: false, hoaMonthly: 0, hoaEstoppelFee: 250,
  homeownersInsuranceAnnual: 0, floodInsuranceAnnual: 0,
  listingAgentCommission: 3, buyerAgentCommission: 3,
  existingMortgagePayoff: 0, sellerConcessions: 0,
  earnestMoneyDeposit: 0, escrowMonths: 3,
  homeInspection: 400, pestInspection: 125, windMitigation: 100, fourPointInspection: 150,
};

function ClosingCostsContent() {
  const [step, setStep] = useState(0);
  const searchParams = useSearchParams();
  const [inputs, setInputs] = useState<ClosingCostInputs>(() => {
    let saved: Record<string, string> = {};
    try { const s = localStorage.getItem('grtp_property'); if (s) saved = JSON.parse(s); } catch(e) {}
    return {
      ...defaultInputs,
      address: searchParams.get('address') || saved.fullAddress || '',
      salePrice: parseFloat(searchParams.get('price') || saved.price || '0') || 0,
      annualPropertyTax: parseFloat(searchParams.get('tax') || '0') || 0,
    };
  });
  const [results, setResults] = useState<ReturnType<typeof calculateClosingCosts> | null>(null);

  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (field: keyof ClosingCostInputs, value: any) => setInputs(prev => ({ ...prev, [field]: value }));
  const num = (field: keyof ClosingCostInputs) => (e: React.ChangeEvent<HTMLInputElement>) => set(field, parseFloat(e.target.value) || 0);
  const txt = (field: keyof ClosingCostInputs) => (e: React.ChangeEvent<HTMLInputElement>) => set(field, e.target.value);

  const handleCalculate = () => {
    const r = calculateClosingCosts(inputs);
    setResults(r);
    setStep(5);
  };

  const handleSaveToVault = async () => {
    if (!user || !results) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'closingCostEstimates'), {
        address: inputs.address,
        salePrice: inputs.salePrice,
        inputs,
        results: {
          buyerTotal: results.buyerTotal,
          buyerCashToClose: results.buyerCashToClose,
          sellerTotal: results.sellerTotal,
          sellerNetProceeds: results.sellerNetProceeds,
        },
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
    } catch (e) {
      console.error('Save error:', e);
      alert('Error saving to vault');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-2";
  const cardClass = "bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20";

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {!user && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-yellow-200 text-sm">⚠️ <strong>Sign in</strong> to save your estimates to the Vault for later reference.</p>
            <a href="/signin" className="text-yellow-300 font-bold text-sm underline hover:text-yellow-100 whitespace-nowrap">Sign In →</a>
          </div>
        )}
        {!user && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-yellow-200 text-sm">⚠️ <strong>Sign in</strong> to save your estimates to the Vault for later reference.</p>
            <a href="/signin" className="text-yellow-300 font-bold text-sm underline hover:text-yellow-100 whitespace-nowrap">Sign In →</a>
          </div>
        )}
        {!user && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-yellow-200 text-sm">⚠️ <strong>Sign in</strong> to save your estimates to the Vault for later reference.</p>
            <a href="/signin" className="text-yellow-300 font-bold text-sm underline hover:text-yellow-100 whitespace-nowrap">Sign In →</a>
          </div>
        )}
        {!user && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-yellow-200 text-sm"><strong>Sign in</strong> to save your estimates to the Vault for later reference.</p>
            <a href="/signin" className="text-yellow-300 font-bold text-sm underline hover:text-yellow-100 whitespace-nowrap">Sign In</a>
          </div>
        )}
        <h1 className="text-4xl font-bold text-white mb-2 text-center">🏠 Closing Cost Calculator</h1>
        <p className="text-gray-300 text-center mb-8">Florida / Orange County — TRID Format</p>

        {/* Stepper */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => i < 5 && setStep(i)} className={`px-4 py-2 rounded-full text-sm font-bold transition ${step === i ? 'bg-[#c9a227] text-white' : i < step ? 'bg-green-600/30 text-green-300' : 'bg-white/10 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}. {s}
            </button>
          ))}
        </div>

        {/* Step 0: Property Info */}
        {step === 0 && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-white mb-6">📍 Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Property Address</label><input type="text" value={inputs.address} onChange={txt('address')} placeholder="123 Main St, Orlando, FL" className={inputClass} /></div>
              <div><label className={labelClass}>Sale Price ($)</label><input type="number" value={inputs.salePrice || ''} onChange={num('salePrice')} placeholder="350000" className={inputClass} /></div>
              <div><label className={labelClass}>Closing Date</label><input type="date" value={inputs.closingDate} onChange={txt('closingDate')} className={inputClass} /></div>
              <div><label className={labelClass}>County</label><input type="text" value={inputs.county} onChange={txt('county')} className={inputClass} /></div>
            </div>
          </div>
        )}

        {/* Step 1: Loan Details */}
        {step === 1 && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-white mb-6">💰 Loan Details</h2>
            <div className="mb-4">
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <input type="checkbox" checked={inputs.isFinanced} onChange={(e) => set('isFinanced', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                Buyer is financing (not cash purchase)
              </label>
            </div>
            {inputs.isFinanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Loan Amount ($)</label><input type="number" value={inputs.loanAmount || ''} onChange={num('loanAmount')} placeholder="280000" className={inputClass} /></div>
                <div><label className={labelClass}>Interest Rate (%)</label><input type="number" step="0.125" value={inputs.interestRate || ''} onChange={num('interestRate')} className={inputClass} /></div>
                <div>
                  <label className={labelClass}>Loan Type</label>
                  <select value={inputs.loanType} onChange={(e) => set('loanType', e.target.value)} className={inputClass}>
                    <option>Conventional</option><option>FHA</option><option>VA</option><option>USDA</option><option>Cash</option>
                  </select>
                </div>
                <div><label className={labelClass}>Earnest Money Deposit ($)</label><input type="number" value={inputs.earnestMoneyDeposit || ''} onChange={num('earnestMoneyDeposit')} placeholder="5000" className={inputClass} /></div>
                <div><label className={labelClass}>Escrow Months (Tax & Insurance)</label><input type="number" value={inputs.escrowMonths || ''} onChange={num('escrowMonths')} className={inputClass} /></div>
              </div>
            )}
          </div>
        )}
        {/* Step 2: Title & Insurance */}
        {step === 2 && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-white mb-6">📋 Title & Insurance</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <input type="checkbox" checked={inputs.ownersTitleInsurance} onChange={(e) => set('ownersTitleInsurance', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                Owner's Title Insurance (Seller typically pays in FL)
              </label>
              {inputs.isFinanced && (
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input type="checkbox" checked={inputs.lendersTitleInsurance} onChange={(e) => set('lendersTitleInsurance', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                  Lender's Title Insurance (Required if financed)
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
                <div><label className={labelClass}>Homeowners Insurance (Annual $)</label><input type="number" value={inputs.homeownersInsuranceAnnual || ''} onChange={num('homeownersInsuranceAnnual')} placeholder="2400" className={inputClass} /></div>
                <div><label className={labelClass}>Flood Insurance (Annual $)</label><input type="number" value={inputs.floodInsuranceAnnual || ''} onChange={num('floodInsuranceAnnual')} placeholder="0" className={inputClass} /></div>
                <div><label className={labelClass}>Listing Agent Commission (%)</label><input type="number" step="0.1" value={inputs.listingAgentCommission || ''} onChange={num('listingAgentCommission')} className={inputClass} /></div>
                <div><label className={labelClass}>Buyer Agent Commission (%)</label><input type="number" step="0.1" value={inputs.buyerAgentCommission || ''} onChange={num('buyerAgentCommission')} className={inputClass} /></div>
                <div><label className={labelClass}>Existing Mortgage Payoff ($)</label><input type="number" value={inputs.existingMortgagePayoff || ''} onChange={num('existingMortgagePayoff')} placeholder="0" className={inputClass} /></div>
                <div><label className={labelClass}>Seller Concessions ($)</label><input type="number" value={inputs.sellerConcessions || ''} onChange={num('sellerConcessions')} placeholder="0" className={inputClass} /></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Taxes & HOA */}
        {step === 3 && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-white mb-6">🏛️ Taxes & HOA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Annual Property Tax ($)</label><input type="number" value={inputs.annualPropertyTax || ''} onChange={num('annualPropertyTax')} placeholder="4200" className={inputClass} /></div>
              <div><label className={labelClass}>Tax Paid Through Date</label><input type="date" value={inputs.taxesPaidThrough} onChange={txt('taxesPaidThrough')} className={inputClass} /></div>
              <div className="col-span-2">
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input type="checkbox" checked={inputs.homesteadExemption} onChange={(e) => set('homesteadExemption', e.target.checked)} className="w-5 h-5 accent-[#c9a227]" />
                  Homestead Exemption (reduces escrow estimate ~15%)
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
                  <div><label className={labelClass}>HOA Monthly Fee ($)</label><input type="number" value={inputs.hoaMonthly || ''} onChange={num('hoaMonthly')} placeholder="250" className={inputClass} /></div>
                  <div><label className={labelClass}>HOA Estoppel Fee ($)</label><input type="number" value={inputs.hoaEstoppelFee || ''} onChange={num('hoaEstoppelFee')} placeholder="250" className={inputClass} /></div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Inspections */}
        {step === 4 && (
          <div className={cardClass}>
            <h2 className="text-2xl font-bold text-white mb-6">🔍 Inspections & Other</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Home Inspection ($)</label><input type="number" value={inputs.homeInspection || ''} onChange={num('homeInspection')} className={inputClass} /></div>
              <div><label className={labelClass}>WDO/Pest Inspection ($)</label><input type="number" value={inputs.pestInspection || ''} onChange={num('pestInspection')} className={inputClass} /></div>
              <div><label className={labelClass}>Wind Mitigation ($)</label><input type="number" value={inputs.windMitigation || ''} onChange={num('windMitigation')} className={inputClass} /></div>
              <div><label className={labelClass}>4-Point Inspection ($)</label><input type="number" value={inputs.fourPointInspection || ''} onChange={num('fourPointInspection')} className={inputClass} /></div>
            </div>
            <div className="mt-8 p-6 bg-[#c9a227]/10 rounded-xl border border-[#c9a227]/30">
              <p className="text-[#c9a227] font-bold text-lg mb-1">Ready to Calculate</p>
              <p className="text-gray-300 text-sm">Click Calculate below to generate your full TRID-style closing cost breakdown.</p>
            </div>
          </div>
        )}
        {/* Step 5: Results */}
        {step === 5 && results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-600/20 border border-blue-400/30 rounded-2xl p-6">
                <p className="text-blue-300 text-sm font-semibold mb-1">BUYER — Cash to Close</p>
                <p className="text-4xl font-bold text-white">${results.buyerCashToClose.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-blue-300 text-xs mt-1">Total closing costs: ${results.buyerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-green-600/20 border border-green-400/30 rounded-2xl p-6">
                <p className="text-green-300 text-sm font-semibold mb-1">SELLER — Net Proceeds</p>
                <p className="text-4xl font-bold text-white">${results.sellerNetProceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-green-300 text-xs mt-1">Total closing costs: ${results.sellerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Line Items by Section */}
            {Array.from(new Set(results.lineItems.map(i => i.section))).map(section => (
              <div key={section} className={cardClass}>
                <h3 className="text-lg font-bold text-[#c9a227] mb-4">{section}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left text-gray-400 pb-2 font-semibold">Line</th>
                        <th className="text-left text-gray-400 pb-2 font-semibold">Description</th>
                        <th className="text-right text-blue-300 pb-2 font-semibold">Buyer</th>
                        <th className="text-right text-green-300 pb-2 font-semibold">Seller</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.lineItems.filter(i => i.section === section).map((item, idx) => (
                        <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-2 text-gray-500 pr-4">{item.lineNumber}</td>
                          <td className="py-2 text-white">{item.label}</td>
                          <td className="py-2 text-right text-blue-200">
                            {item.buyerAmount !== 0 ? `$${Math.abs(item.buyerAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="py-2 text-right text-green-200">
                            {item.sellerAmount !== 0 ? `$${Math.abs(item.sellerAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className={`${cardClass} border-[#c9a227]/50`}>
              <h3 className="text-lg font-bold text-[#c9a227] mb-4">Totals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Buyer Closing Costs</p>
                  <p className="text-2xl font-bold text-blue-300">${results.buyerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Seller Closing Costs</p>
                  <p className="text-2xl font-bold text-green-300">${results.sellerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {user && (
              <button
                onClick={handleSaveToVault}
                disabled={saving || saved}
                className={`w-full py-4 rounded-xl font-bold transition ${saved ? 'bg-green-600 text-white cursor-default' : 'bg-[#c9a227] hover:bg-[#b8911f] text-white'}`}
              >
                {saving ? '💾 Saving...' : saved ? '✓ Saved to Vault!' : '💾 Save to Vault'}
              </button>
            )}
            {!user && (
              <div className="w-full py-4 rounded-xl bg-yellow-500/20 border border-yellow-400/40 text-center text-yellow-200 text-sm">
                ⚠️ <a href="/signin" className="underline font-bold hover:text-yellow-100">Sign in</a> to save this estimate to your Vault
              </div>
            )}
            <button onClick={() => { setStep(0); setResults(null); setInputs(defaultInputs); setSaved(false); }} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">
              ← Start New Calculation
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-8 py-3 rounded-xl bg-white/10 text-white font-bold disabled:opacity-30 hover:bg-white/20 transition">
              ← Back
            </button>
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-8 py-3 rounded-xl bg-[#c9a227] text-white font-bold hover:bg-[#b8911f] transition">
                Next →
              </button>
            ) : (
              <button onClick={handleCalculate} className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition">
                Calculate Closing Costs ✓
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ClosingCostsPage() {
  return (
    <Suspense fallback={
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </main>
    }>
      <ClosingCostsContent />
    </Suspense>
  );
}