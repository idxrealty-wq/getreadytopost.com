'use client';

import React from 'react';
import type { ClosingCostsState } from '@/lib/closing-costs/calc';

type Props = {
  state: ClosingCostsState;
  onChange: (updates: Partial<ClosingCostsState>) => void;
};

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ClosingCostsInputs({ state, onChange }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <h2 className="text-lg font-bold mb-3">Inputs</h2>

      <label className="block text-xs font-semibold mb-1">Role</label>
      <select
        value={state.role}
        onChange={(e) => onChange({ role: e.target.value as any })}
        className="w-full border rounded px-2 py-1 mb-3"
      >
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
        <option value="both">Both</option>
      </select>

      <label className="block text-xs font-semibold mb-1">Closing Date</label>
      <input
        type="date"
        value={state.closingDate}
        onChange={(e) => onChange({ closingDate: e.target.value })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Purchase Price</label>
      <input
        type="number"
        value={state.purchasePrice}
        onChange={(e) => onChange({ purchasePrice: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Loan Amount</label>
      <input
        type="number"
        value={state.loanAmount}
        onChange={(e) => onChange({ loanAmount: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Appraisal Fee</label>
      <input
        type="number"
        value={state.appraisalFee}
        onChange={(e) => onChange({ appraisalFee: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Credit Report Fee</label>
      <input
        type="number"
        value={state.creditReportFee}
        onChange={(e) => onChange({ creditReportFee: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Settlement Fee</label>
      <input
        type="number"
        value={state.settlementFee}
        onChange={(e) => onChange({ settlementFee: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Title Search Fee</label>
      <input
        type="number"
        value={state.titleSearchFee}
        onChange={(e) => onChange({ titleSearchFee: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Seller Annual Tax</label>
      <input
        type="number"
        value={state.sellerCurrentAnnualTax || ''}
        onChange={(e) => onChange({ sellerCurrentAnnualTax: num(e.target.value) })}
        placeholder="Enter amount"
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Homeowners Annual Premium</label>
      <input
        type="number"
        value={state.homeownersAnnualPremium}
        onChange={(e) => onChange({ homeownersAnnualPremium: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">HOA Annual Dues</label>
      <input
        type="number"
        value={state.hoaAnnualDues}
        onChange={(e) => onChange({ hoaAnnualDues: num(e.target.value) })}
        className="w-full border rounded px-2 py-1 mb-3"
      />

      <label className="block text-xs font-semibold mb-1">Commission %</label>
      <input
        type="number"
        step="0.01"
        value={state.commissionPercent}
        onChange={(e) => onChange({ commissionPercent: num(e.target.value) })}
        className="w-full border rounded px-2 py-1"
      />
    </div>
  );
}
