import type { ClosingCostInputs, ClosingCostResults, LineItem } from './types';

// Florida Documentary Stamp Tax rates
const DOC_STAMP_DEED_RATE = 0.007; // $0.70 per $100 on deed
const DOC_STAMP_NOTE_RATE = 0.0035; // $0.35 per $100 on note
const INTANGIBLE_TAX_RATE = 0.002; // $0.20 per $100 on new mortgage

// Florida title insurance rates (promulgated)
function calculateTitleInsurance(price: number): number {
  if (price <= 0) return 0;
  if (price <= 100000) return Math.max(175, price * 0.00575);
  if (price <= 1000000) return 575 + (price - 100000) * 0.005;
  return 575 + 4500 + (price - 1000000) * 0.0025;
}

function calculateLendersTitleInsurance(loanAmount: number, ownersPremium: number): number {
  if (loanAmount <= 0) return 0;
  const standalone = calculateTitleInsurance(loanAmount);
  // Simultaneous issue discount - buyer pays difference + $25
  return Math.max(25, standalone - ownersPremium + 25);
}

function proratePropertyTax(annualTax: number, closingDate: string): { buyerCredit: number; sellerDebit: number } {
  if (!closingDate || annualTax <= 0) return { buyerCredit: 0, sellerDebit: 0 };
  const closing = new Date(closingDate);
  const dayOfYear = Math.floor((closing.getTime() - new Date(closing.getFullYear(), 0, 0).getTime()) / 86400000);
  const daysInYear = 365;
  const sellerDays = dayOfYear - 1;
  const sellerShare = (annualTax / daysInYear) * sellerDays;
  return { buyerCredit: sellerShare, sellerDebit: sellerShare };
}

function prorateHOA(monthly: number, closingDate: string): { buyerCredit: number; sellerDebit: number } {
  if (!closingDate || monthly <= 0) return { buyerCredit: 0, sellerDebit: 0 };
  const closing = new Date(closingDate);
  const daysInMonth = new Date(closing.getFullYear(), closing.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - closing.getDate();
  const dailyRate = monthly / daysInMonth;
  const amount = dailyRate * remainingDays;
  return { buyerCredit: amount, sellerDebit: amount };
}

export function calculateClosingCosts(inputs: ClosingCostInputs): ClosingCostResults {
  const items: LineItem[] = [];
  let lineNum = 100;
  const next = () => lineNum += 1;

  const {
    salePrice, loanAmount, isFinanced, loanType,
    annualPropertyTax, closingDate, homesteadExemption,
    hasHOA, hoaMonthly, hoaEstoppelFee,
    homeownersInsuranceAnnual, floodInsuranceAnnual,
    listingAgentCommission, buyerAgentCommission,
    existingMortgagePayoff, sellerConcessions,
    earnestMoneyDeposit, escrowMonths,
    surveyRequired, surveyAmount,
    homeInspection, pestInspection, windMitigation, fourPointInspection,
    ownersTitleInsurance, lendersTitleInsurance,
    interestRate,
  } = inputs;

  const add = (label: string, buyer: number, seller: number, section: string) => {
    items.push({ lineNumber: next(), label, buyerAmount: buyer, sellerAmount: seller, section });
  };

  // === SECTION A: ORIGINATION CHARGES ===
  if (isFinanced && loanType !== 'Cash') {
    add('Loan Origination Fee (est. 1%)', loanAmount * 0.01, 0, 'A. Origination Charges');
    add('Appraisal Fee', 550, 0, 'A. Origination Charges');
    add('Credit Report', 35, 0, 'A. Origination Charges');
    add('Flood Determination Fee', 20, 0, 'A. Origination Charges');
    if (loanType === 'FHA') add('FHA Upfront MIP (1.75%)', loanAmount * 0.0175, 0, 'A. Origination Charges');
    if (loanType === 'VA') add('VA Funding Fee (2.15%)', loanAmount * 0.0215, 0, 'A. Origination Charges');
  }

  // === SECTION B: SERVICES BORROWER DID NOT SHOP FOR ===
  add('Settlement/Closing Fee', 595, 0, 'B. Services (Fixed)');
  if (loanType !== 'Cash') add('Tax Service Fee', 85, 0, 'B. Services (Fixed)');

  // === SECTION C: SERVICES BORROWER DID SHOP FOR ===
  const ownersPremium = ownersTitleInsurance ? calculateTitleInsurance(salePrice) : 0;
  const lendersPremium = (lendersTitleInsurance && isFinanced) ? calculateLendersTitleInsurance(loanAmount, ownersPremium) : 0;

  if (ownersTitleInsurance) add("Owner's Title Insurance", 0, ownersPremium, 'C. Services (Shopped)');
  if (lendersTitleInsurance && isFinanced) add("Lender's Title Insurance", lendersPremium, 0, 'C. Services (Shopped)');
  add('Title Search', 0, 150, 'C. Services (Shopped)');
  add('Title Exam', 0, 200, 'C. Services (Shopped)');
  if (surveyRequired) add('Survey', surveyAmount || 450, 0, 'C. Services (Shopped)');

  // === SECTION E: TAXES AND GOVERNMENT FEES ===
  const docStampDeed = salePrice * DOC_STAMP_DEED_RATE;
  add('Doc Stamps on Deed ($0.70/$100)', 0, docStampDeed, 'E. Taxes & Govt Fees');

  if (isFinanced && loanType !== 'Cash') {
    const docStampNote = loanAmount * DOC_STAMP_NOTE_RATE;
    const intangibleTax = loanAmount * INTANGIBLE_TAX_RATE;
    add('Doc Stamps on Note ($0.35/$100)', docStampNote, 0, 'E. Taxes & Govt Fees');
    add('Intangible Tax on Mortgage ($0.20/$100)', intangibleTax, 0, 'E. Taxes & Govt Fees');
  }

  add('Recording Fee - Deed', 0, 10 + Math.ceil(1) * 8.50, 'E. Taxes & Govt Fees');
  if (isFinanced) add('Recording Fee - Mortgage', 10 + Math.ceil(loanAmount / 100000) * 8.50, 0, 'E. Taxes & Govt Fees');

  // === SECTION F: PREPAIDS ===
  if (isFinanced && loanType !== 'Cash') {
    const dailyInterest = (loanAmount * (interestRate / 100)) / 365;
    const prepaidInterestDays = closingDate ? (30 - new Date(closingDate).getDate()) : 15;
    add(`Prepaid Interest (${prepaidInterestDays} days @ ${interestRate}%)`, dailyInterest * prepaidInterestDays, 0, 'F. Prepaids');
  }
  if (homeownersInsuranceAnnual > 0) add('Homeowners Insurance Premium (1 year)', homeownersInsuranceAnnual, 0, 'F. Prepaids');
  if (floodInsuranceAnnual > 0) add('Flood Insurance Premium (1 year)', floodInsuranceAnnual, 0, 'F. Prepaids');

  // === SECTION G: INITIAL ESCROW ===
  if (isFinanced && escrowMonths > 0) {
    const monthlyTax = (annualPropertyTax * (homesteadExemption ? 0.85 : 1)) / 12;
    const monthlyHOI = homeownersInsuranceAnnual / 12;
    if (monthlyTax > 0) add(`Property Tax Escrow (${escrowMonths} months)`, monthlyTax * escrowMonths, 0, 'G. Initial Escrow');
    if (monthlyHOI > 0) add(`Homeowners Insurance Escrow (${escrowMonths} months)`, monthlyHOI * escrowMonths, 0, 'G. Initial Escrow');
  }

  // === SECTION H: OTHER ===
  if (homeInspection > 0) add('Home Inspection', homeInspection, 0, 'H. Other');
  if (pestInspection > 0) add('WDO/Pest Inspection', pestInspection, 0, 'H. Other');
  if (windMitigation > 0) add('Wind Mitigation Inspection', windMitigation, 0, 'H. Other');
  if (fourPointInspection > 0) add('4-Point Inspection', fourPointInspection, 0, 'H. Other');
  if (hasHOA && hoaEstoppelFee > 0) add('HOA Estoppel Fee', 0, hoaEstoppelFee, 'H. Other');

  // === PRORATIONS ===
  const taxProration = proratePropertyTax(annualPropertyTax, closingDate);
  if (taxProration.sellerDebit > 0) {
    add('Property Tax Proration (Seller credit to Buyer)', -taxProration.buyerCredit, taxProration.sellerDebit, 'Prorations');
  }
  if (hasHOA && hoaMonthly > 0) {
    const hoaProration = prorateHOA(hoaMonthly, closingDate);
    if (hoaProration.sellerDebit > 0) add('HOA Proration (Seller credit to Buyer)', -hoaProration.buyerCredit, hoaProration.sellerDebit, 'Prorations');
  }

  // === COMMISSIONS ===
  const listingCommission = salePrice * (listingAgentCommission / 100);
  const buyerCommission = salePrice * (buyerAgentCommission / 100);
  if (listingCommission > 0) add(`Listing Agent Commission (${listingAgentCommission}%)`, 0, listingCommission, 'Commissions');
  if (buyerCommission > 0) add(`Buyer Agent Commission (${buyerAgentCommission}%)`, 0, buyerCommission, 'Commissions');

  // === SELLER PAYOFFS & CONCESSIONS ===
  if (existingMortgagePayoff > 0) add('Existing Mortgage Payoff', 0, existingMortgagePayoff, 'Payoffs');
  if (sellerConcessions > 0) add('Seller Concessions to Buyer', -sellerConcessions, sellerConcessions, 'Concessions');

  // === TOTALS ===
  const buyerTotal = items.reduce((s, i) => s + i.buyerAmount, 0);
  const sellerTotal = items.reduce((s, i) => s + i.sellerAmount, 0);
  const buyerCashToClose = buyerTotal + (salePrice - loanAmount) - earnestMoneyDeposit + (sellerConcessions > 0 ? -sellerConcessions : 0);
  const sellerNetProceeds = salePrice - sellerTotal;

  return { lineItems: items, buyerTotal, sellerTotal, buyerCashToClose, sellerNetProceeds };
}
