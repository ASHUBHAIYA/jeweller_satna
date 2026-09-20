export type MetalType = 'gold' | 'silver' | 'platinum';

export type MakingChargeType = 'per_gram' | 'percentage' | 'flat';

export interface MetalRates {
  gold24kPerGram: number; // 24K 99.9%
  gold22kPerGram: number; // 22K 91.6%
  gold18kPerGram: number; // 18K 75.0%
  gold14kPerGram: number; // 14K 58.5%
  silver999PerGram: number; // Fine Silver
  silver925PerGram: number; // Sterling Silver
  platinum950PerGram: number; // Platinum 950
  lastUpdated: string;
}

export interface JewelryItem {
  id: string;
  name: string;
  category: string;
  metal: MetalType;
  purityKarat: string; // e.g. "22K", "18K", "24K", "Custom"
  purityPercentage: number; // e.g. 91.6, 75.0, 99.9, or custom like 84.5%
  hsnCode: string; // e.g. "7113" for gold, "7114" for silver articles
  grossWeightGrams: number;
  stoneWeightGrams: number;
  stoneValue: number;
  stoneDescription?: string;
  netWeightGrams: number;
  ratePerGramApplied: number;
  pureMetalCost: number;
  wastagePercent: number; // e.g. 2%
  wastageGrams: number;
  wastageCost: number;
  makingChargeType: MakingChargeType;
  makingChargeRate: number; // e.g. 450 (per gram) or 12 (%) or 2500 (flat)
  totalMakingCharge: number;
  hallmarkFee: number; // e.g. 45
  itemTaxableAmount: number;
}

export interface OldGoldExchange {
  enabled: boolean;
  description: string;
  metal: MetalType;
  weightGrams: number;
  purityPercentage: number; // e.g. 85%
  meltingDeductionPercent: number; // e.g. 3%
  ratePerGram: number;
  totalExchangeValue: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  panOrAadhaar?: string;
  gstin?: string;
}

export interface PaymentDetails {
  method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'split';
  cashAmount?: number;
  digitalAmount?: number;
  status: 'paid' | 'partial' | 'pending';
  paidAmount: number;
  balanceAmount: number;
  dueDate?: string;
  settledDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  items: JewelryItem[];
  subtotalTaxable: number;
  gstRate: number; // e.g. 3%
  cgstAmount: number; // 1.5%
  sgstAmount: number; // 1.5%
  igstAmount: number; // 0 or 3%
  totalGst: number;
  oldGoldExchange?: OldGoldExchange;
  discount: number;
  roundOff: number;
  finalTotal: number;
  payment: PaymentDetails;
  notes?: string;
  syncedToCloud: boolean;
  createdAt: string;
  estimatedProfit: number;
}

export interface JewelerStoreProfile {
  storeName: string;
  tagline: string;
  proprietorName: string;
  address: string;
  cityState: string;
  phone: string;
  email: string;
  gstin: string;
  bisHallmarkLicense: string;
  invoicePrefix: string;
  currentInvoiceNumber: number;
  defaultGstPercent: number;
  defaultHallmarkFee: number;
  termsAndConditions: string[];
}

export interface UserAccount {
  id: string;
  username: string;
  storeName: string;
  pin: string;
  backupPin?: string;
  securityQuestion: string;
  securityAnswer: string;
  role: 'owner' | 'manager' | 'staff';
  isAuthenticated: boolean;
}

export interface CATaxExportSummary {
  exportDate: string;
  financialPeriod: string;
  storeInfo: {
    storeName: string;
    gstin: string;
    bisLicense: string;
  };
  totalInvoicesCount: number;
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGSTCollected: number;
  totalRevenue: number;
  totalGoldWeightSoldGrams: number;
  totalSilverWeightSoldGrams: number;
  hsnSummary: {
    hsnCode: string;
    description: string;
    uqc: string;
    totalQuantityGrams: number;
    totalTaxableValue: number;
    integratedTaxAmount: number;
    centralTaxAmount: number;
    stateTaxAmount: number;
  }[];
  transactions: Invoice[];
}
