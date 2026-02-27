export type ClosingCostsState = {
  role: 'buyer' | 'seller' | 'both';
  closingDate: string;
  purchasePrice: number;
  propertyAddress: string;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  points: number;
  lenderOriginationFee: number;
  lenderUnderwritingFee: number;
  processingFee: number;
  appraisalFee: number;
  creditReportFee: number;
  floodDeterminationFee: number;
  taxServiceFee: number;
  wireFee: number;
  sellerCurrentAnnualTax: number;
  buyerAssessedValueBasis: number;
  homesteadExemption: boolean;
  seniorExemption: boolean;
  disabledExemption: boolean;
  widowExemption: boolean;
  homeownersAnnualPremium: number;
  homeownersEscrowMonths: number;
  homeownersPayFirstYear: boolean;
  floodZone: 'A' | 'AE' | 'AO' | 'VE' | 'X' | 'Unknown';
  floodMortgage: boolean;
  floodCoverage: 'building' | 'building+contents';
  floodBuildingAmount: number;
  floodContentsAmount: number;
  floodElevationCert: boolean;
  floodPriorClaims: 'yes' | 'no' | 'unknown';
  floodAnnualPremium: number;
  floodEscrowMonths: number;
  floodPayFirstYear: boolean;
  hoaAnnualDues: number;
  hoaEscrowMonths: number;
  hoaProrate: boolean;
  settlementFee: number;
  titleSearchFee: number;
  titleExamFee: number;
  titleBinderFee: number;
  ownerTitleInsurance: boolean;
  endorsementALTA81: boolean;
  endorsementInflationGuard: boolean;
  endorsementALTA81Amount: number;
  endorsementInflationGuardAmount: number;
  notaryFee: number;
  courierFee: number;
  recordingDocuments: number;
  recordingPagesPerDoc: number;
  intangibleTaxToggle: boolean;
  intangibleTaxAmount: number;
  surveyFee: number;
  homeInspectionFee: number;
  windMitigationFee: number;
  fourPointInspectionFee: number;
  termiteWDOFee: number;
  earnestMoneyDeposit: number;
  sellerCredits: number;
  commissionPercent: number;
  sellerConcessions: number;
  loanPayoffAmount: number;
};

export type LineItem = {
  label: string;
  tridLine: string;
  description: string;
  amount: number;
};

const DOC_STAMP_RATE = 0.0035;
const INTANGIBLE_TAX_RATE = 0.002;
const TITLE_INSURANCE_RATE = 0.0055;
const RECORDING_FEE_PER_PAGE = 10;
const ORANGE_COUNTY_MILLAGE = 4.43;
const HOMESTEAD_EXEMPTION = 50000;
const SENIOR_EXEMPTION = 25000;
const DISABLED_EXEMPTION = 50000;
const WIDOW_EXEMPTION = 5000;

export const defaultClosingCostsState: ClosingCostsState = {
  role: 'both',
  closingDate: new Date().toISOString().split('T')[0],
  purchasePrice: 450000,
  propertyAddress: '',
  loanAmount: 360000,
  interestRate: 6.5,
  termMonths: 360,
  points: 0,
  lenderOriginationFee: 0,
  lenderUnderwritingFee: 0,
  processingFee: 0,
  appraisalFee: 600,
  creditReportFee: 50,
  floodDeterminationFee: 20,
  taxServiceFee: 75,
  wireFee: 25,
  sellerCurrentAnnualTax: 1800,
  buyerAssessedValueBasis: 450000,
  homesteadExemption: true,
  seniorExemption: false,
  disabledExemption: false,
  widowExemption: false,
  homeownersAnnualPremium: 1200,
  homeownersEscrowMonths: 12,
  homeownersPayFirstYear: false,
  floodZone: 'X',
  floodMortgage: false,
  floodCoverage: 'building',
  floodBuildingAmount: 450000,
  floodContentsAmount: 0,
  floodElevationCert: false,
  floodPriorClaims: 'no',
  floodAnnualPremium: 0,
  floodEscrowMonths: 0,
  floodPayFirstYear: false,
  hoaAnnualDues: 0,
  hoaEscrowMonths: 0,
  hoaProrate: false,
  settlementFee: 500,
  titleSearchFee: 150,
  titleExamFee: 100,
  titleBinderFee: 0,
  ownerTitleInsurance: true,
  endorsementALTA81: false,
  endorsementInflationGuard: false,
  endorsementALTA81Amount: 50,
  endorsementInflationGuardAmount: 100,
  notaryFee: 50,
  courierFee: 0,
  recordingDocuments: 2,
  recordingPagesPerDoc: 3,
  intangibleTaxToggle: false,
  intangibleTaxAmount: 0,
  surveyFee: 0,
  homeInspectionFee: 0,
  windMitigationFee: 0,
  fourPointInspectionFee: 0,
  termiteWDOFee: 0,
  earnestMoneyDeposit: 0,
  sellerCredits: 0,
  commissionPercent: 5.5,
  sellerConcessions: 0,
  loanPayoffAmount: 0,
};

function daysBetweenInclusive(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateDocStamps(price: number): number {
  return Math.round(price * DOC_STAMP_RATE * 100) / 100;
}

export function calculateIntangibleTax(loanAmount: number): number {
  return Math.round(loanAmount * INTANGIBLE_TAX_RATE * 100) / 100;
}

export function calculateTitleInsurance(amount: number): number {
  return Math.round(amount * TITLE_INSURANCE_RATE * 100) / 100;
}

export function calculateRecordingFees(documents: number, pagesPerDoc: number): number {
  return documents * pagesPerDoc * RECORDING_FEE_PER_PAGE;
}

export function calculateProration(annualAmount: number, closingDateISO: string): number {
  const closing = new Date(closingDateISO);
  const endOfYear = new Date(closing.getFullYear(), 11, 31);
  const daysRemaining = Math.ceil((endOfYear.getTime() - closing.getTime()) / (1000 * 60 * 60 * 24));
  return Math.round(((annualAmount / 365) * daysRemaining) * 100) / 100;
}

export function calculatePropertyTaxProration(state: ClosingCostsState): {
  sellerDays: number;
  buyerDays: number;
  sellerTaxProration: number;
  buyerTaxProration: number;
  buyerNewAnnualTax: number;
} {
  const result = {
    sellerDays: 0,
    buyerDays: 0,
    sellerTaxProration: 0,
    buyerTaxProration: 0,
    buyerNewAnnualTax: 0,
  };

  if (!state.closingDate) return result;

  const closing = new Date(state.closingDate);
  const year = closing.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  result.sellerDays = daysBetweenInclusive(jan1, closing);
  result.buyerDays = 365 - result.sellerDays;

  const sellerDaily = state.sellerCurrentAnnualTax / 365;
  result.sellerTaxProration = Math.round(sellerDaily * result.sellerDays * 100) / 100;

  let buyerExemptions = 0;
  if (state.homesteadExemption) buyerExemptions += HOMESTEAD_EXEMPTION;
  if (state.seniorExemption) buyerExemptions += SENIOR_EXEMPTION;
  if (state.disabledExemption) buyerExemptions += DISABLED_EXEMPTION;
  if (state.widowExemption) buyerExemptions += WIDOW_EXEMPTION;

  const buyerTaxableValue = Math.max(0, state.purchasePrice - buyerExemptions);
  result.buyerNewAnnualTax = Math.round((buyerTaxableValue / 1000) * ORANGE_COUNTY_MILLAGE * 100) / 100;

  const buyerDaily = result.buyerNewAnnualTax / 365;
  result.buyerTaxProration = Math.round(buyerDaily * result.buyerDays * 100) / 100;

  return result;
}

export function calculateBuyerCosts(state: ClosingCostsState): LineItem[] {
  const items: LineItem[] = [];
  const taxProration = calculatePropertyTaxProration(state);

  items.push({ label: 'Loan Origination', tridLine: '801', description: 'Lender origination fee', amount: state.lenderOriginationFee });
  items.push({ label: 'Loan Points', tridLine: '802', description: 'Discount points', amount: (state.loanAmount * state.points) / 100 });
  items.push({ label: 'Underwriting', tridLine: '803', description: 'Underwriting fee', amount: state.lenderUnderwritingFee });
  items.push({ label: 'Processing', tridLine: '804', description: 'Processing fee', amount: state.processingFee });
  items.push({ label: 'Appraisal', tridLine: '805', description: 'Property appraisal fee', amount: state.appraisalFee });
  items.push({ label: 'Credit Report', tridLine: '806', description: 'Credit report fee', amount: state.creditReportFee });
  items.push({ label: 'Flood Determination', tridLine: '807', description: 'Flood zone determination', amount: state.floodDeterminationFee });
  items.push({ label: 'Tax Service', tridLine: '808', description: 'Property tax monitoring', amount: state.taxServiceFee });
  items.push({ label: 'Wire Fee', tridLine: '809', description: 'Wire transfer fee', amount: state.wireFee });
  items.push({ label: 'Settlement', tridLine: '1100', description: 'Settlement/closing fee', amount: state.settlementFee });
  items.push({ label: 'Title Search', tridLine: '1101', description: 'Title search fee', amount: state.titleSearchFee });
  items.push({ label: 'Title Exam', tridLine: '1102', description: 'Title examination fee', amount: state.titleExamFee });
  items.push({ label: 'Title Binder', tridLine: '1103', description: 'Title binder fee', amount: state.titleBinderFee });

  if (state.ownerTitleInsurance) {
    items.push({
      label: 'Owner Title Insurance',
      tridLine: '1105',
      description: 'Owner title insurance premium',
      amount: calculateTitleInsurance(state.purchasePrice),
    });
  }

  items.push({
    label: 'Lender Title Insurance',
    tridLine: '1106',
    description: 'Lender title insurance premium',
    amount: calculateTitleInsurance(state.loanAmount),
  });

  if (state.endorsementALTA81) {
    items.push({ label: 'ALTA 8.1', tridLine: '1107', description: 'ALTA 8.1 endorsement', amount: state.endorsementALTA81Amount });
  }

  if (state.endorsementInflationGuard) {
    items.push({
      label: 'Inflation Guard',
      tridLine: '1108',
      description: 'Inflation guard endorsement',
      amount: state.endorsementInflationGuardAmount,
    });
  }

  items.push({ label: 'Notary', tridLine: '1109', description: 'Notary fees', amount: state.notaryFee });
  items.push({ label: 'Courier', tridLine: '1110', description: 'Courier/delivery fees', amount: state.courierFee });
  items.push({
    label: 'Recording Fees',
    tridLine: '1111',
    description: 'County recording fees',
    amount: calculateRecordingFees(state.recordingDocuments, state.recordingPagesPerDoc),
  });
  items.push({
    label: 'Doc Stamps',
    tridLine: '1113',
    description: 'Florida deed transfer tax',
    amount: calculateDocStamps(state.purchasePrice),
  });
  items.push({
    label: 'Intangible Tax',
    tridLine: '1112',
    description: 'Florida intangible tax on loan',
    amount: state.intangibleTaxToggle ? state.intangibleTaxAmount : calculateIntangibleTax(state.loanAmount),
  });

  if (state.homeownersAnnualPremium > 0 && state.homeownersEscrowMonths > 0) {
    items.push({
      label: 'Homeowners Escrow',
      tridLine: '1301',
      description: 'Homeowners insurance escrow',
      amount: (state.homeownersAnnualPremium / 12) * state.homeownersEscrowMonths,
    });
  }

  if (state.floodAnnualPremium > 0 && state.floodEscrowMonths > 0) {
    items.push({
      label: 'Flood Escrow',
      tridLine: '1601',
      description: 'Flood insurance escrow',
      amount: (state.floodAnnualPremium / 12) * state.floodEscrowMonths,
    });
  }

  if (state.hoaAnnualDues > 0 && state.hoaProrate) {
    items.push({
      label: 'HOA Proration',
      tridLine: '1401',
      description: 'HOA dues proration',
      amount: calculateProration(state.hoaAnnualDues, state.closingDate),
    });
  }

  items.push({
    label: 'Property Tax Proration (Buyer)',
    tridLine: '1502',
    description: 'Buyer portion of property tax (day after closing to Dec 31)',
    amount: taxProration.buyerTaxProration,
  });

  items.push({ label: 'Survey', tridLine: '1201', description: 'Property survey fee', amount: state.surveyFee });
  items.push({ label: 'Home Inspection', tridLine: '1202', description: 'Home inspection fee', amount: state.homeInspectionFee });
  items.push({ label: 'Wind Mitigation', tridLine: '1203', description: 'Wind mitigation inspection', amount: state.windMitigationFee });
  items.push({ label: '4-Point Inspection', tridLine: '1204', description: '4-point inspection', amount: state.fourPointInspectionFee });
  items.push({ label: 'Termite/WDO', tridLine: '1205', description: 'Termite inspection', amount: state.termiteWDOFee });

  return items.filter((item) => item.amount > 0);
}

export function calculateSellerCosts(state: ClosingCostsState): LineItem[] {
  const items: LineItem[] = [];
  const taxProration = calculatePropertyTaxProration(state);

  items.push({
    label: 'Commission',
    tridLine: '1301',
    description: 'Real estate commission (buyer + seller)',
    amount: (state.purchasePrice * state.commissionPercent) / 100,
  });
  items.push({
    label: 'Doc Stamps',
    tridLine: '1113',
    description: 'Florida deed transfer tax',
    amount: calculateDocStamps(state.purchasePrice),
  });
  items.push({
    label: 'Title Insurance',
    tridLine: '1105',
    description: 'Owner title insurance',
    amount: calculateTitleInsurance(state.purchasePrice),
  });
  items.push({
    label: 'Recording Fees',
    tridLine: '1111',
    description: 'County recording fees',
    amount: calculateRecordingFees(state.recordingDocuments, state.recordingPagesPerDoc),
  });
  items.push({
    label: 'Settlement',
    tridLine: '1100',
    description: 'Settlement/closing fee',
    amount: state.settlementFee,
  });
  items.push({
    label: 'Property Tax Proration (Seller)',
    tridLine: '1501',
    description: 'Seller portion of property tax (Jan 1 to closing date)',
    amount: taxProration.sellerTaxProration,
  });

  if (state.loanPayoffAmount > 0) {
    items.push({
      label: 'Loan Payoff',
      tridLine: '1303',
      description: 'Payoff of existing mortgage',
      amount: state.loanPayoffAmount,
    });
  }

  if (state.sellerConcessions > 0) {
    items.push({
      label: 'Seller Concessions',
      tridLine: '1302',
      description: 'Seller credits to buyer',
      amount: state.sellerConcessions,
    });
  }

  return items.filter((item) => item.amount > 0);
}

export function calculateTotalBuyerCosts(state: ClosingCostsState): number {
  return calculateBuyerCosts(state).reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTotalSellerCosts(state: ClosingCostsState): number {
  return calculateSellerCosts(state).reduce((sum, item) => sum + item.amount, 0);
}

export function calculateBuyerCashToClose(state: ClosingCostsState): number {
  const downPayment = state.purchasePrice - state.loanAmount;
  return downPayment + calculateTotalBuyerCosts(state);
}

export function calculateSellerNetProceeds(state: ClosingCostsState): number {
  return state.purchasePrice - calculateTotalSellerCosts(state);
}
