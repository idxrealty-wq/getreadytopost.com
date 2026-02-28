export type ClosingCostsState = {
  purchasePrice: number;
  loanAmount: number;
  downPaymentAmount: number;
  closingDate: string;
  commissionPercent: number;
  sellerCurrentAnnualTax: number;
};

export type LineItem = {
  label: string;
  amount: number;
};
