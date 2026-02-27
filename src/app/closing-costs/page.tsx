"use client";

import { useState } from "react";
import { defaultClosingCostsState, calculateDownPayment, calculateBuyerCosts, calculateSellerCosts } from "@/lib/closing-costs/calc";
import type { ClosingCostsState } from "@/lib/closing-costs/calc";

export default function ClosingCostsPage() {
  const [state, setState] = useState<ClosingCostsState>(defaultClosingCostsState);

  const handleChange = (updates: Partial<ClosingCostsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const dp = calculateDownPayment(state);
  const buyerCosts = calculateBuyerCosts(state);
  const sellerCosts = calculateSellerCosts(state);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-2">Closing Costs Calculator</h1>
        <p className="text-slate-300 mb-8">Orange County, Florida — Buyer & Seller Estimates</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Deal Details</h2>

              <label className="block text-sm font-semibold mb-1">Purchase Price</label>
              <input
                type="number"
                value={state.purchasePrice}
                onChange={(e) => handleChange({ purchasePrice: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />

              <label className="block text-sm font-semibold mb-1">Down Payment</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  value={state.downPaymentAmount}
                  onChange={(e) => handleChange({ downPaymentAmount: Number(e.target.value) })}
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <select
                  value={state.downPaymentType}
                  onChange={(e) => handleChange({ downPaymentType: e.target.value as any })}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="amount">$</option>
                  <option value="percent">%</option>
                </select>
              </div>

              <label className="block text-sm font-semibold mb-1">Closing Date</label>
              <input
                type="date"
                value={state.closingDate}
                onChange={(e) => handleChange({ closingDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />

              <label className="block text-sm font-semibold mb-1">Property Address</label>
              <input
                type="text"
                value={state.propertyAddress}
                onChange={(e) => handleChange({ propertyAddress: e.target.value })}
                placeholder="123 Main St, Orlando, FL"
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />

              <label className="block text-sm font-semibold mb-1">Buyer Name</label>
              <input
                type="text"
                value={state.buyerName}
                onChange={(e) => handleChange({ buyerName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />

              <label className="block text-sm font-semibold mb-1">Seller Name</label>
              <input
                type="text"
                value={state.sellerName}
                onChange={(e) => handleChange({ sellerName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Loan Amount</p>
                <p className="text-2xl font-bold">${dp.loanAmount.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Down Payment</p>
                <p className="text-2xl font-bold">${dp.downPaymentAmount.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">LTV</p>
                <p className="text-2xl font-bold">{(dp.ltv * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Buyer Costs */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Buyer Closing Costs</h3>
              <div className="space-y-3">
                {buyerCosts.map((item, i) => (
                  <div key={i} className="flex justify-between border-b pb-2">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-900">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t-2 border-slate-300">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${buyerCosts.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Costs */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Seller Closing Costs</h3>
              <div className="space-y-3">
                {sellerCosts.map((item, i) => (
                  <div key={i} className="flex justify-between border-b pb-2">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-semibold text-slate-900">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t-2 border-slate-300">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-lg text-red-600">
                    ${sellerCosts.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
