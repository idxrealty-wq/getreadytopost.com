'use client';

import { useMemo, useState } from 'react';
import ShareButtons from '@/components/ShareButtons';

type UserType = 'buyer' | 'seller' | 'both';

const ORANGE_COUNTY_MILLAGE = 4.43; // per $1,000 taxable value
const HOMESTEAD_EXEMPTION = 50000;
const SENIOR_EXEMPTION = 25000;
const DISABLED_EXEMPTION = 50000;
const WIDOW_EXEMPTION = 5000;

function daysBetweenInclusive(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export default function ClosingCostsPage() {
  const [userType, setUserType] = useState<UserType>('both');
  const [closingDate, setClosingDate] = useState<string>('');

  // Shared
  const [purchasePrice, setPurchasePrice] = useState<number>(450000);

  // Property tax (seller “today”)
  const [sellerCurrentAnnualTax, setSellerCurrentAnnualTax] = useState<number>(4200);

  // Buyer exemptions
  const [homestead, setHomestead] = useState<boolean>(true);
  const [senior, setSenior] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [widow, setWidow] = useState<boolean>(false);

  // Simple placeholders for now (we’ll add full line items next commits)
  const [earnestMoney, setEarnestMoney] = useState<number>(0);
  const [sellerCredits, setSellerCredits] = useState<number>(0);
  const [commissionPercent, setCommissionPercent] = useState<number>(6);
  const [loanPayoff, setLoanPayoff] = useState<number>(0);

  const calc = useMemo(() => {
    const result = {
      buyerTaxableValue: 0,
      buyerAnnualTax: 0,
      sellerDays: 0,
      buyerDays: 0,
      sellerTaxProration: 0,
      buyerTaxProration: 0,
      buyerCashToClose_taxOnly: 0,
      sellerNet_taxOnly: 0,
      notes: [] as string[],
    };

    // Buyer new anticipated tax (auto-calc)
    let exemptions = 0;
    if (homestead) exemptions += HOMESTEAD_EXEMPTION;
    if (senior) exemptions += SENIOR_EXEMPTION;
    if (disabled) exemptions += DISABLED_EXEMPTION;
    if (widow) exemptions += WIDOW_EXEMPTION;

    result.buyerTaxableValue = Math.max(0, purchasePrice - exemptions);
    result.buyerAnnualTax = (result.buyerTaxableValue / 1000) * ORANGE_COUNTY_MILLAGE;

    if (!closingDate) {
      result.notes.push('Enter a closing date to calculate proration.');
      return result;
    }

    const cd = new Date(closingDate + 'T00:00:00');
    const year = cd.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const dec31 = new Date(year, 11, 31);

    // Closing date belongs to seller (seller pays through closing day)
    result.sellerDays = daysBetweenInclusive(jan1, cd);
    result.buyerDays = 365 - result.sellerDays;

    const sellerDaily = sellerCurrentAnnualTax / 365;
    const buyerDaily = result.buyerAnnualTax / 365;

    result.sellerTaxProration = sellerDaily * result.sellerDays;
    result.buyerTaxProration = buyerDaily * result.buyerDays;

    // For now: show tax-only impact on cash-to-close and seller net
    // Buyer typically receives a credit for seller’s portion if taxes are paid in arrears.
    // We’ll present both numbers clearly.
    //
    // Buyer cash-to-close (tax-only) = + buyer future portion (escrow/prepaid later) - seller credit (seller portion)
    // Seller net (tax-only) = - seller portion (through closing date)
    result.buyerCashToClose_taxOnly = Math.max(0, result.buyerTaxProration - result.sellerTaxProration) - earnestMoney - sellerCredits;
    result.sellerNet_taxOnly =
      purchasePrice
      - (purchasePrice * (commissionPercent / 100))
      - loanPayoff
      - result.sellerTaxProration;

    return result;
  }, [closingDate, purchasePrice, sellerCurrentAnnualTax, homestead, senior, disabled, widow, earnestMoney, sellerCredits, commissionPercent, loanPayoff]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <ShareButtons url="https://getreadytopost.com/closing-costs" title="Closing Cost Calculator - GetReadyToPost" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Closing Cost Calculator</h1>
          <p className="text-xl text-gray-200">Orange County, Florida</p>
          <p className="text-sm text-gray-300 mt-2">This version starts with property tax (today vs new) + proration. We’ll add the rest next.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 md:p-12">
          {/* Who are you */}
          <div className="mb-8">
            <label className="block text-white font-bold mb-3">I am a:</label>
            <div className="flex flex-wrap gap-3">
              {(['buyer', 'seller', 'both'] as UserType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setUserType(t)}
                  className={`px-5 py-3 rounded-lg font-bold transition ${
                    userType === t ? 'bg-[#c9a227] text-[#1a2b4a]' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {t === 'both' ? 'Both' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Closing date + purchase price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-white font-bold mb-2">Closing Date (seller pays through this day)</label>
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#c9a227]"
              />
            </div>
            <div>
              <label className="block text-white font-bold mb-2">Purchase Price</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#c9a227]"
              />
            </div>
          </div>

          {/* Property Tax Module */}
          <div className="bg-white/5 border border-white/20 rounded-2xl p-6 md:p-8 mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Property Tax (Today vs New) + Proration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white font-bold mb-2">Seller Current Annual Property Tax (exact bill)</label>
                <input
                  type="number"
                  value={sellerCurrentAnnualTax}
                  onChange={(e) => setSellerCurrentAnnualTax(Number(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#c9a227]"
                />
                <p className="text-xs text-gray-300 mt-2">
                  This is the seller’s current tax bill (often capped by Save Our Homes). We use it for the seller proration.
                </p>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Buyer New Anticipated Annual Property Tax (auto)</label>
                <div className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-gray-100 font-semibold">
                  ${calc.buyerAnnualTax.toFixed(2)} / year
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  Calculated from purchase price using Orange County millage ({ORANGE_COUNTY_MILLAGE} per $1,000) minus exemptions.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white font-bold mb-3">Buyer exemptions (reduce taxable value):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 text-gray-200">
                  <input type="checkbox" checked={homestead} onChange={(e) => setHomestead(e.target.checked)} />
                  Homestead (-$50,000)
                </label>
                <label className="flex items-center gap-3 text-gray-200">
                  <input type="checkbox" checked={senior} onChange={(e) => setSenior(e.target.checked)} />
                  Senior 65+ (-$25,000)
                </label>
                <label className="flex items-center gap-3 text-gray-200">
                  <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
                  Disabled (-$50,000)
                </label>
                <label className="flex items-center gap-3 text-gray-200">
                  <input type="checkbox" checked={widow} onChange={(e) => setWidow(e.target.checked)} />
                  Widow/Widower (-$5,000)
                </label>
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-5">
              <p className="text-white font-bold mb-2">Proration math (escrowed / paid in arrears)</p>
              <ul className="text-gray-200 text-sm space-y-1">
                <li>Seller days (Jan 1 → closing day): <strong>{calc.sellerDays || 0}</strong></li>
                <li>Buyer days (day after closing → Dec 31): <strong>{calc.buyerDays || 0}</strong></li>
                <li>Seller tax proration (seller owes through closing): <strong>${calc.sellerTaxProration.toFixed(2)}</strong></li>
                <li>Buyer tax proration (buyer portion after closing): <strong>${calc.buyerTaxProration.toFixed(2)}</strong></li>
              </ul>
            </div>
          </div>

          {/* Minimal totals (tax-only for now) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(userType === 'buyer' || userType === 'both') && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-black mb-3">Buyer (Tax-only preview)</h3>
                <p className="text-gray-700 mb-4">This is not final cash-to-close yet — it’s the property tax proration impact only.</p>
                <div className="text-3xl font-extrabold text-[#1a2b4a]">
                  ${calc.buyerCashToClose_taxOnly.toFixed(2)}
                </div>
              </div>
            )}

            {(userType === 'seller' || userType === 'both') && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-black mb-3">Seller (Net preview)</h3>
                <p className="text-gray-700 mb-4">This includes commission + loan payoff + seller tax proration (we’ll add the rest next).</p>
                <div className="text-3xl font-extrabold text-[#1a2b4a]">
                  ${calc.sellerNet_taxOnly.toFixed(2)}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">Commission %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">Loan Payoff</label>
                    <input
                      type="number"
                      value={loanPayoff}
                      onChange={(e) => setLoanPayoff(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buyer credits (optional) */}
          {(userType === 'buyer' || userType === 'both') && (
            <div className="mt-10 bg-white/5 border border-white/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-4">Buyer Credits (optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-bold mb-2">Earnest Money Deposit (credit)</label>
                  <input
                    type="number"
                    value={earnestMoney}
                    onChange={(e) => setEarnestMoney(Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block text-white font-bold mb-2">Seller Credits (credit)</label>
                  <input
                    type="number"
                    value={sellerCredits}
                    onChange={(e) => setSellerCredits(Number(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
