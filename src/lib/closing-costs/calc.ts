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

const DOC_STAMP_RATE = 0.0035;
const INTANGIBLE_TAX_RATE = 0.002;
const TITLE_INSURANCE_RATE = 0.0055;
const RECORDING_FEE_PER_PAGE = 10;

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

export function calculateBuyerCosts(state: ClosingCostsState): Record<string, number> {
  const items: Record<string, number> = {};
  items['Loan Origination'] = state.lenderOriginationFee;
  items['Loan Points'] = (state.loanAmount * state.points) / 100;
  items['Underwriting'] = state.lenderUnderwritingFee;
  items['Processing'] = state.processingFee;
  items['Appraisal'] = state.appraisalFee;
  items['Credit Report'] = state.creditReportFee;
  items['Flood Determination'] = state.floodDeterminationFee;
  items['Tax Service'] = state.taxServiceFee;
  items['Wire Fee'] = state.wireFee;
  items['Settlement'] = state.settlementFee;
  items['Title Search'] = state.titleSearchFee;
  items['Title Exam'] = state.titleExamFee;
  items['Title Binder'] = state.titleBinderFee;
  if (state.ownerTitleInsurance) items['Owner Title Insurance'] = calculateTitleInsurance(state.purchasePrice);
  items['Lender Title Insurance'] = calculateTitleInsurance(state.loanAmount);
  if (state.endorsementALTA81) items['ALTA 8.1'] = state.endorsementALTA81Amount;
  if (state.endorsementInflationGuard) items['Inflation Guard'] = state.endorsementInflationGuardAmount;
  items['Notary'] = state.notaryFee;
  items['Courier'] = state.courierFee;
  items['Recording Fees'] = calculateRecordingFees(state.recordingDocuments, state.recordingPagesPerDoc);
  items['Doc Stamps'] = calculateDocStamps(state.purchasePrice);
  items['Intangible Tax'] = state.intangibleTaxToggle ? state.intangibleTaxAmount : calculateIntangibleTax(state.loanAmount);
  if (state.homeownersAnnualPremium > 0 && state.homeownersEscrowMonths > 0) items['Homeowners Escrow'] = (state.homeownersAnnualPremium / 12) * state.homeownersEscrowMonths;
  if (state.floodAnnualPremium > 0 && state.floodEscrowMonths > 0) items['Flood Escrow'] = (state.floodAnnualPremium / 12) * state.floodEscrowMonths;
  if (state.hoaAnnualDues > 0 && state.hoaProrate) items['HOA Proration'] = calculateProration(state.hoaAnnualDues, state.closingDate);
  items['Survey'] = state.surveyFee;
  items['Home Inspection'] = state.homeInspectionFee;
  items['Wind Mitigation'] = state.windMitigationFee;
  items['4-Point Inspection'] = state.fourPointInspectionFee;
  items['Termite/WDO'] = state.termiteWDOFee;
  return Object.fromEntries(Object.entries(items).filter(([, v]) => v > 0));
}

export function calculateSellerCosts(state: ClosingCostsState): Record<string, number> {
  const items: Record<string, number> = {};
  items['Commission'] = (state.purchasePrice * state.commissionPercent) / 100;
  items['Doc Stamps'] = calculateDocStamps(state.purchasePrice);
  items['Title Insurance'] = calculateTitleInsurance(state.purchasePrice);
  items['Recording Fees'] = calculateRecordingFees(state.recordingDocuments, state.recordingPagesPerDoc);
  items['Settlement'] = state.settlementFee;
  items['Property Tax Proration'] = calculateProration(state.sellerCurrentAnnualTax, state.closingDate);
  if (state.loanPayoffAmount > 0) items['Loan Payoff'] = state.loanPayoffAmount;
  if (state.sellerConcessions > 0) items['Seller Concessions'] = state.sellerConcessions;
  return Object.fromEntries(Object.entries(items).filter(([, v]) => v > 0));
}

export function calculateTotalBuyerCosts(state: ClosingCostsState): number {
  return Object.values(calculateBuyerCosts(state)).reduce((a, b) => a + b, 0);
}

export function calculateTotalSellerCosts(state: ClosingCostsState): number {
  return Object.values(calculateSellerCosts(state)).reduce((a, b) => a + b, 0);
}

export function calculateBuyerCashToClose(state: ClosingCostsState): number {
  const downPayment = state.purchasePrice - state.loanAmount;
  return downPayment + calculateTotalBuyerCosts(state);
}

export function calculateSellerNetProceeds(state: ClosingCostsState): number {
  return state.purchasePrice - calculateTotalSellerCosts(state);
}
