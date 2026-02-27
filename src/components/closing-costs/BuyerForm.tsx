"use client";

import { calculateBuyerCosts } from "@/lib/closing-costs/calc";
import type { ClosingCostsState } from "@/lib/closing-costs/types";

interface BuyerFormProps {
  state: ClosingCostsState;
  onStateChange: (updates: Partial<ClosingCostsState>) => void;
}

export default function BuyerForm({ state, onStateChange }: BuyerFormProps) {
  const buyerCosts = calculateBuyerCosts(state);
  const buyerTotal = buyerCosts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Buyer Loan Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Loan Amount</label>
            <input
              type="number"
              value={state.loanAmount}
              onChange={(e) => onStateChange({ loanAmount: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={state.interestRate}
              onChange={(e) => onStateChange({ interestRate: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Loan Origination Fee</label>
            <input
              type="number"
              value={state.lenderOriginationFee}
              onChange={(e) => onStateChange({ lenderOriginationFee: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Appraisal Fee</label>
            <input
              type="number"
              value={state.appraisalFee}
              onChange={(e) => onStateChange({ appraisalFee: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Credit Report Fee</label>
            <input
              type="number"
              value={state.creditReportFee}
              onChange={(e) => onStateChange({ creditReportFee: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Title Search Fee</label>
            <input
              type="number"
              value={state.titleSearchFee}
              onChange={(e) => onStateChange({ titleSearchFee: Number(e.target.value) })}
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
          <div>
            <label className="block text-sm font-semibold mb-1">Mortgage Insurance Amount</label>
            <input
              type="number"
              value={state.mortgageInsuranceAmount}
              onChange={(e) => onStateChange({ mortgageInsuranceAmount: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={state.ownerTitleInsurance}
              onChange={(e) => onStateChange({ ownerTitleInsurance: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="ml-2 text-sm font-semibold">Owner Title Insurance</label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Buyer Closing Costs Breakdown</h3>
        <div className="space-y-3">
          {buyerCosts.map((item, i) => (
            <div key={i} className="flex justify-between border-b pb-2">
              <span className="text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-900">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t-2 border-slate-300">
            <span className="font-bold text-slate-900">Total Buyer Costs</span>
            <span className="font-bold text-lg text-blue-600">${buyerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
