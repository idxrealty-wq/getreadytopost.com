"use client";

import { calculateSellerCosts } from "@/lib/closing-costs/calc";
import type { ClosingCostsState } from "@/lib/closing-costs/types";

interface SellerFormProps {
  state: ClosingCostsState;
  onStateChange: (updates: Partial<ClosingCostsState>) => void;
}

export default function SellerForm({ state, onStateChange }: SellerFormProps) {
  const sellerCosts = calculateSellerCosts(state);
  const sellerTotal = sellerCosts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Seller Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Commission Percent (%)</label>
            <input
              type="number"
              step="0.1"
              value={state.commissionPercent}
              onChange={(e) => onStateChange({ commissionPercent: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Annual Property Tax</label>
            <input
              type="number"
              value={state.sellerCurrentAnnualTax}
              onChange={(e) => onStateChange({ sellerCurrentAnnualTax: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Settlement Fee</label>
            <input
              type="number"
              value={state.settlementFee}
              onChange={(e) => onStateChange({ settlementFee: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={state.homesteadExemption}
              onChange={(e) => onStateChange({ homesteadExemption: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="ml-2 text-sm font-semibold">Homestead Exemption</label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Seller Closing Costs Breakdown</h3>
        <div className="space-y-3">
          {sellerCosts.map((item, i) => (
            <div key={i} className="flex justify-between border-b pb-2">
              <span className="text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-900">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t-2 border-slate-300">
            <span className="font-bold text-slate-900">Total Seller Costs</span>
            <span className="font-bold text-lg text-red-600">${sellerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
