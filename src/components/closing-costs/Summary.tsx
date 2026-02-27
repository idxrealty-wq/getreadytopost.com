"use client";

import { calculateDownPayment, calculateBuyerCosts, calculateSellerCosts } from "@/lib/closing-costs/calc";
import type { ClosingCostsState } from "@/lib/closing-costs/types";

interface SummaryProps {
  state: ClosingCostsState;
  onStateChange: (updates: Partial<ClosingCostsState>) => void;
}

export default function Summary({ state, onStateChange }: SummaryProps) {
  const dp = calculateDownPayment(state);
  const buyerCosts = calculateBuyerCosts(state);
  const sellerCosts = calculateSellerCosts(state);
  const buyerTotal = buyerCosts.reduce((sum, item) => sum + item.amount, 0);
  const sellerTotal = sellerCosts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-90">Purchase Price</p>
          <p className="text-2xl font-bold">${state.purchasePrice.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-90">Down Payment</p>
          <p className="text-2xl font-bold">${dp.downPaymentAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-sm opacity-90">Loan Amount</p>
          <p className="text-2xl font-bold">${dp.loanAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Buyer Closing Costs</h3>
          <p className="text-3xl font-bold text-blue-600">${buyerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Seller Closing Costs</h3>
          <p className="text-3xl font-bold text-red-600">${sellerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Deal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Purchase Price</label>
            <input
              type="number"
              value={state.purchasePrice}
              onChange={(e) => onStateChange({ purchasePrice: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Down Payment</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={state.downPaymentAmount}
                onChange={(e) => onStateChange({ downPaymentAmount: Number(e.target.value) })}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <select
                value={state.downPaymentType}
                onChange={(e) => onStateChange({ downPaymentType: e.target.value as any })}
                className="border rounded-lg px-3 py-2"
              >
                <option value="amount">$</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Closing Date</label>
            <input
              type="date"
              value={state.closingDate}
              onChange={(e) => onStateChange({ closingDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Property Address</label>
            <input
              type="text"
              value={state.propertyAddress}
              onChange={(e) => onStateChange({ propertyAddress: e.target.value })}
              placeholder="123 Main St, Orlando, FL"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
