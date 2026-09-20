import { JewelryItem, MakingChargeType, MetalRates, MetalType, OldGoldExchange } from '../types';

export const STANDARD_PURITIES: Record<string, { label: string; percentage: number; metal: MetalType }> = {
  '24K': { label: '24K (99.9% Pure)', percentage: 99.9, metal: 'gold' },
  '22K': { label: '22K (91.6% 916 Hallmark)', percentage: 91.6, metal: 'gold' },
  '20K': { label: '20K (83.3%)', percentage: 83.3, metal: 'gold' },
  '18K': { label: '18K (75.0% 750 Hallmark)', percentage: 75.0, metal: 'gold' },
  '14K': { label: '14K (58.5% 585 Hallmark)', percentage: 58.5, metal: 'gold' },
  '10K': { label: '10K (41.7%)', percentage: 41.7, metal: 'gold' },
  'SILVER_999': { label: 'Silver 999 (Fine 99.9%)', percentage: 99.9, metal: 'silver' },
  'SILVER_925': { label: 'Silver 925 (Sterling 92.5%)', percentage: 92.5, metal: 'silver' },
  'PLATINUM_950': { label: 'Platinum 950 (95.0%)', percentage: 95.0, metal: 'platinum' },
};

/**
 * Calculates rate per gram for a specific metal and purity
 */
export function getRatePerGram(metal: MetalType, purityPercentage: number, rates: MetalRates): number {
  if (metal === 'gold') {
    // If standard 22K (91.6%) and jeweler has set a specific 22k rate, prefer that or compute from 24K
    if (Math.abs(purityPercentage - 91.6) < 0.2 && rates.gold22kPerGram > 0) {
      return rates.gold22kPerGram;
    }
    if (Math.abs(purityPercentage - 75.0) < 0.2 && rates.gold18kPerGram > 0) {
      return rates.gold18kPerGram;
    }
    if (Math.abs(purityPercentage - 58.5) < 0.2 && rates.gold14kPerGram > 0) {
      return rates.gold14kPerGram;
    }
    // Calculate proportionally based on 24K rate (99.9% pure)
    return Math.round((rates.gold24kPerGram * purityPercentage) / 99.9);
  } else if (metal === 'silver') {
    if (Math.abs(purityPercentage - 92.5) < 0.2 && rates.silver925PerGram > 0) {
      return rates.silver925PerGram;
    }
    return Math.round((rates.silver999PerGram * purityPercentage) / 99.9);
  } else {
    // Platinum
    return Math.round((rates.platinum950PerGram * purityPercentage) / 95.0);
  }
}

export interface CalculateItemParams {
  metal: MetalType;
  purityPercentage: number;
  grossWeight: number;
  stoneWeight: number;
  stoneValue: number;
  ratePerGram: number;
  wastagePercent: number;
  makingChargeType: MakingChargeType;
  makingChargeRate: number;
  hallmarkFee: number;
}

export function calculateJewelryItemCost(params: CalculateItemParams) {
  const grossWeight = Math.max(0, Number(params.grossWeight) || 0);
  const stoneWeight = Math.max(0, Number(params.stoneWeight) || 0);
  const netWeight = Math.max(0, Number((grossWeight - stoneWeight).toFixed(3)));
  
  const stoneValue = Math.max(0, Number(params.stoneValue) || 0);
  const ratePerGram = Math.max(0, Number(params.ratePerGram) || 0);
  const wastagePercent = Math.max(0, Number(params.wastagePercent) || 0);
  const hallmarkFee = Math.max(0, Number(params.hallmarkFee) || 0);
  const makingChargeRate = Math.max(0, Number(params.makingChargeRate) || 0);

  // Pure metal base cost
  const pureMetalCost = Math.round(netWeight * ratePerGram);

  // Wastage (melting / polish allowance)
  const wastageGrams = Number(((netWeight * wastagePercent) / 100).toFixed(3));
  const wastageCost = Math.round(wastageGrams * ratePerGram);

  // Making charges calculation
  let totalMakingCharge = 0;
  if (params.makingChargeType === 'per_gram') {
    totalMakingCharge = Math.round(netWeight * makingChargeRate);
  } else if (params.makingChargeType === 'percentage') {
    totalMakingCharge = Math.round((pureMetalCost * makingChargeRate) / 100);
  } else {
    // Flat
    totalMakingCharge = Math.round(makingChargeRate);
  }

  // Taxable subtotal for this item
  const itemTaxableAmount = pureMetalCost + wastageCost + totalMakingCharge + stoneValue + hallmarkFee;

  return {
    netWeight,
    pureMetalCost,
    wastageGrams,
    wastageCost,
    totalMakingCharge,
    stoneValue,
    hallmarkFee,
    itemTaxableAmount,
  };
}

export function calculateOldGoldValue(exchange: {
  weightGrams: number;
  purityPercentage: number;
  meltingDeductionPercent: number;
  ratePerGram: number;
}): number {
  const weight = Math.max(0, Number(exchange.weightGrams) || 0);
  const purity = Math.max(0, Number(exchange.purityPercentage) || 0);
  const deduction = Math.max(0, Number(exchange.meltingDeductionPercent) || 0);
  const rate = Math.max(0, Number(exchange.ratePerGram) || 0);

  const effectivePurity = (purity / 100) * (1 - deduction / 100);
  const netFineWeight = weight * effectivePurity;
  return Math.round(netFineWeight * rate);
}

export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatGrams(grams: number, decimals: number = 3): string {
  if (isNaN(grams)) return '0.000 g';
  return `${Number(grams).toFixed(decimals)} g`;
}

/**
 * Checks if the jeweler has entered/confirmed today's bullion rates for the current calendar date
 */
export function isTodayRateEntered(rates: MetalRates): boolean {
  if (!rates || !rates.lastUpdated) return false;
  try {
    const lastDate = new Date(rates.lastUpdated);
    const now = new Date();
    const isSameDay =
      lastDate.getFullYear() === now.getFullYear() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getDate() === now.getDate();
    return isSameDay && rates.gold24kPerGram > 0 && rates.silver999PerGram > 0;
  } catch {
    return false;
  }
}
