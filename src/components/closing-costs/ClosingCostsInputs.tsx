"use client";

import type { ClosingCostsState } from "@/lib/closing-costs/types";

interface ClosingCostsInputsProps {
  state: ClosingCostsState;
  onStateChange: (updates: Partial<ClosingCostsState>) => void;
}

export default function ClosingCostsInputs({ state, onStateChange }: ClosingCostsInputsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Deal Details</h2>

      <label className="block text-sm font-semibold mb-1">Purchase Price</label>
      <input
        type="number"
        value={state.purchasePrice}
        onChange={(e) => onStateChange({ purchasePrice: Number(e.target.value) })}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <label className="block text-sm font-semibold mb-1">Down Payment</label>
      <div className="flex gap-2 mb-4">
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

      <label className="block text-sm font-semibold mb-1">Closing Date</label>
      <input
        type="date"
        value={state.closingDate}
        onChange={(e) => onStateChange({ closingDate: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <label className="block text-sm font-semibold mb-1">Property Address</label>
      <input
        type="text"
        value={state.propertyAddress}
        onChange={(e) => onStateChange({ propertyAddress: e.target.value })}
        placeholder="123 Main St, Orlando, FL"
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <label className="block text-sm font-semibold mb-1">Buyer Name</label>
      <input
        type="text"
        value={state.buyerName}
        onChange={(e) => onStateChange({ buyerName: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <label className="block text-sm font-semibold mb-1">Seller Name</label>
      <input
        type="text"
        value={state.sellerName}
        onChange={(e) => onStateChange({ sellerName: e.target.value })}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}
