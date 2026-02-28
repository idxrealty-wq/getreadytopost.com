"use client";

import { useState, useEffect } from "react";
import type { ClosingCostsState } from "@/lib/closing-costs/types";
import { calculateBuyerCosts, calculateSellerCosts } from "@/lib/closing-costs/calc";

export default function ClosingCostsPage() {
  const [state, setState] = useState<ClosingCostsState>({
    purchasePrice: 450000,
    loanAmount: 360000,
    downPaymentAmount: 90000,
    closingDate: "",
    commissionPercent: 5.5,
    sellerCurrentAnnualTax: 1800,
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
  const sellerCosts = calculateSellerCosts(state.purchasePrice, state.commissionPercent, state.sellerCurrentAnnualTax, state.closingDate);
  const buyerTotal = buyerCosts.reduce((sum, item) => sum + item.amount, 0);
  const sellerTotal = sellerCosts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8">Closing Costs Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Deal Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Purchase Price</label>
                <input type="number" value={state.purchasePrice} onChange={(e) => setState({...state, purchasePrice: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Loan Amount</label>
                <input type="number" value={state.loanAmount} onChange={(e) => setState({...state, loanAmount: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Down Payment</label>
                <input type="number" value={state.downPaymentAmount} onChange={(e) => setState({...state, downPaymentAmount: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Closing Date (MM/DD/YYYY)</label>
                <input type="text" value={state.closingDate} onChange={(e) => setState({...state, closingDate: e.target.value})} placeholder="02/27/2026" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Commission %</label>
                <input type="number" step="0.1" value={state.commissionPercent} onChange={(e) => setState({...state, commissionPercent: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Annual Property Tax</label>
                <input type="number" value={state.sellerCurrentAnnualTax} onChange={(e) => setState({...state, sellerCurrentAnnualTax: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Buyer Closing Costs</h3>
            <div className="space-y-2">
              {buyerCosts.map((item, i) => (
                <div key={i} className={`flex justify-between px-3 py-2 ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">${item.amount.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2 border-t-2 border-slate-300 bg-blue-50">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-blue-600">${buyerTotal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Seller Closing Costs</h3>
            <div className="space-y-2">
              {sellerCosts.map((item, i) => (
                <div key={i} className={`flex justify-between px-3 py-2 ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">${item.amount.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2 border-t-2 border-slate-300 bg-red-50">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-red-600">${sellerTotal.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
