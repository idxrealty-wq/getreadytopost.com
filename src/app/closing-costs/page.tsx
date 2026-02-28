@'
"use client";

import { useState, useEffect } from "react";
import type { ClosingCostsState } from "@/lib/closing-costs/types";
import { calculateBuyerCosts, calculateSellerCosts } from "@/lib/closing-costs/calc";

function rowClass(i: number) {
  return i % 2 === 0
    ? "flex justify-between px-4 py-3 rounded-lg bg-slate-50"
    : "flex justify-between px-4 py-3 rounded-lg bg-white border border-slate-200";
}

export default function ClosingCostsPage() {
  const [state, setState] = useState<ClosingCostsState>({
    purchasePrice: 450000,
    loanAmount: 360000,
    downPaymentAmount: 90000,
    closingDate: "",
    commissionPercent: 5.5,
    sellerCurrentAnnualTax: 1800,
    hoaMonthly: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("closingCostsState");
    if (saved) setState(JSON.parse(saved));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("closingCostsState", JSON.stringify(state));
  }, [state, mounted]);

  if (!mounted) return null;

  const buyerCosts = calculateBuyerCosts(state.purchasePrice, state.loanAmount);
  const sellerCosts = calculateSellerCosts(
    state.purchasePrice,
    state.commissionPercent,
    state.sellerCurrentAnnualTax,
    state.closingDate
  );

  const buyerTotal = buyerCosts.reduce((sum, item) => sum + item.amount, 0);
  const sellerTotal = sellerCosts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-2">Closing Costs Calculator</h1>
        <p className="text-slate-300 mb-16">Orange County, Florida — Accurate Buyer & Seller Estimates</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-blue-600">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Deal Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Price</label>
                <input
                  type="number"
                  value={state.purchasePrice}
                  onChange={(e) => setState({ ...state, purchasePrice: Number(e.target.value) })}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Loan Amount</label>
                <input
                  type="number"
                  value={state.loanAmount}
                  onChange={(e) => setState({ ...state, loanAmount: Number(e.target.value) })}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Down Payment</label>
                <input
                  type="number"
                  value={state.downPaymentAmount}
                  onChange={(e) => setState({ ...state, downPaymentAmount: Number(e.target.value) })}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Closing Date (MM/DD/YYYY)</label>
                <input
                  type="text"
                  value={state.closingDate}
                  onChange={(e) => setState({ ...state, closingDate: e.target.value })}
                  placeholder="02/27/2026"
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Commission %</label>
                <input
                  type="number"
                  step="0.1"
                  value={state.commissionPercent}
                  onChange={(e) => setState({ ...state, commissionPercent: Number(e.target.value) })}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Property Tax</label>
                <input
                  type="number"
                  value={state.sellerCurrentAnnualTax}
                  onChange={(e) => setState({ ...state, sellerCurrentAnnualTax: Number(e.target.value) })}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">HOA Monthly</label>
                <input
                  type="number"
                  value={state.hoaMonthly}
                  onChange={(e) => setState({ ...state, hoaMonthly: Number(e.target.value) })}
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                onClick={() => localStorage.setItem("closingCostsState", JSON.stringify(state))}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-emerald-600">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Buyer Closing Costs
            </h2>

            <div className="space-y-3">
              {buyerCosts.map((item, i) => (
                <div key={i} className={rowClass(i)}>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">
                    ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}

              <div className="flex justify-between px-4 py-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 mt-4">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-lg text-blue-700">
                  ${buyerTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-600">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
              Seller Closing Costs
            </h2>

            <div className="space-y-3">
              {sellerCosts.map((item, i) => (
                <div key={i} className={rowClass(i)}>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">
                    ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}

              <div className="flex justify-between px-4 py-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 mt-4">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-lg text-red-700">
                  ${sellerTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-xs mt-8">
          Note: HOA is collected for data capture; we’ll add it into the cost math next (prepaids/escrow) once you confirm how many months you want.
        </p>
      </div>
    </div>
  );
}
'@ | Set-Content -Path src/app/closing-costs/page.tsx -Encoding UTF8
