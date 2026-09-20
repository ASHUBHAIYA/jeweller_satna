import React, { useState, useId } from 'react';
import { 
  Calculator, 
  PlusCircle, 
  Share2, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Scale, 
  Percent, 
  Gem, 
  BadgePercent,
  Check,
  ShieldCheck,
  RefreshCw,
  Coins,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { JewelryItem, MakingChargeType, MetalRates, MetalType, OldGoldExchange } from '../types';
import { 
  calculateJewelryItemCost, 
  calculateOldGoldValue, 
  formatGrams, 
  formatINR, 
  getRatePerGram, 
  STANDARD_PURITIES,
  isTodayRateEntered
} from '../utils/calculator';

interface JewelryCalculatorProps {
  rates: MetalRates;
  defaultGstPercent: number;
  defaultHallmarkFee: number;
  onAddItemToCart: (item: JewelryItem, oldGoldExchange?: OldGoldExchange) => void;
  onQuickWhatsAppEstimate: (item: JewelryItem, oldGoldExchange?: OldGoldExchange) => void;
  onOpenRatesModal?: () => void;
}

export const JewelryCalculator: React.FC<JewelryCalculatorProps> = ({
  rates,
  defaultGstPercent,
  defaultHallmarkFee,
  onAddItemToCart,
  onQuickWhatsAppEstimate,
  onOpenRatesModal,
}) => {
  // Form State
  const [metal, setMetal] = useState<MetalType>('gold');
  const [selectedPurityKey, setSelectedPurityKey] = useState<string>('22K');
  const [customPurityPercent, setCustomPurityPercent] = useState<number>(91.6);
  const [isCustomPurity, setIsCustomPurity] = useState<boolean>(false);

  const [itemName, setItemName] = useState<string>('Hallmarked Gold Necklace');
  const [category, setCategory] = useState<string>('Necklace');
  const [hsnCode, setHsnCode] = useState<string>('7113');

  // Weights (no predefined dummy values)
  const [grossWeight, setGrossWeight] = useState<number | ''>('');
  const [stoneWeight, setStoneWeight] = useState<number | ''>('');
  const [stoneValue, setStoneValue] = useState<number | ''>('');
  const [stoneDescription, setStoneDescription] = useState<string>('');

  // Wastage & Making (no predefined dummy values)
  const [wastagePercent, setWastagePercent] = useState<number | ''>('');
  const [makingChargeType, setMakingChargeType] = useState<MakingChargeType>('per_gram');
  const [makingChargeRate, setMakingChargeRate] = useState<number | ''>('');
  const [hallmarkFee, setHallmarkFee] = useState<number | ''>(defaultHallmarkFee);

  // Old Gold Exchange (no predefined dummy values)
  const [hasOldGold, setHasOldGold] = useState<boolean>(false);
  const [oldGoldWeight, setOldGoldWeight] = useState<number | ''>('');
  const [oldGoldPurity, setOldGoldPurity] = useState<number | ''>('');
  const [oldGoldDeduction, setOldGoldDeduction] = useState<number | ''>('');
  const [oldGoldDesc, setOldGoldDesc] = useState<string>('');

  // Success flash
  const [showAddedNotice, setShowAddedNotice] = useState<boolean>(false);

  // Active Purity Percentage
  const currentPurityPercent = isCustomPurity 
    ? Number(customPurityPercent) || 0 
    : STANDARD_PURITIES[selectedPurityKey]?.percentage || 91.6;

  // Rate Applied
  const appliedRatePerGram = getRatePerGram(metal, currentPurityPercent, rates);

  // Calculation
  const calculation = calculateJewelryItemCost({
    metal,
    purityPercentage: currentPurityPercent,
    grossWeight: Number(grossWeight) || 0,
    stoneWeight: Number(stoneWeight) || 0,
    stoneValue: Number(stoneValue) || 0,
    ratePerGram: appliedRatePerGram,
    wastagePercent: Number(wastagePercent) || 0,
    makingChargeType,
    makingChargeRate: Number(makingChargeRate) || 0,
    hallmarkFee: Number(hallmarkFee) || 0,
  });

  // Old Gold exchange value
  const oldGoldValue = hasOldGold
    ? calculateOldGoldValue({
        weightGrams: Number(oldGoldWeight) || 0,
        purityPercentage: Number(oldGoldPurity) || 0,
        meltingDeductionPercent: Number(oldGoldDeduction) || 0,
        ratePerGram: metal === 'silver' ? rates.silver999PerGram : rates.gold24kPerGram,
      })
    : 0;

  // Tax calculation
  const gstAmount = Math.round((calculation.itemTaxableAmount * defaultGstPercent) / 100);
  const grandTotalWithGst = calculation.itemTaxableAmount + gstAmount;
  const netPayable = Math.max(0, grandTotalWithGst - oldGoldValue);

  // Construct current JewelryItem
  const currentItem: JewelryItem = {
    id: `item_${Date.now()}`,
    name: itemName || `${currentPurityPercent}% ${metal} item`,
    category: category.trim() || 'Jewelry Article',
    metal,
    purityKarat: isCustomPurity ? `${currentPurityPercent}% Custom` : selectedPurityKey,
    purityPercentage: currentPurityPercent,
    hsnCode: hsnCode.trim() || (metal === 'silver' ? '7114' : '7113'),
    grossWeightGrams: Number(grossWeight) || 0,
    stoneWeightGrams: Number(stoneWeight) || 0,
    stoneValue: Number(stoneValue) || 0,
    stoneDescription: stoneDescription || undefined,
    netWeightGrams: calculation.netWeight,
    ratePerGramApplied: appliedRatePerGram,
    pureMetalCost: calculation.pureMetalCost,
    wastagePercent: Number(wastagePercent) || 0,
    wastageGrams: calculation.wastageGrams,
    wastageCost: calculation.wastageCost,
    makingChargeType,
    makingChargeRate: Number(makingChargeRate) || 0,
    totalMakingCharge: calculation.totalMakingCharge,
    hallmarkFee: Number(hallmarkFee) || 0,
    itemTaxableAmount: calculation.itemTaxableAmount,
  };

  const currentOldGold: OldGoldExchange | undefined = hasOldGold
    ? {
        enabled: true,
        description: oldGoldDesc || 'Customer Old Metal Exchange',
        metal,
        weightGrams: Number(oldGoldWeight) || 0,
        purityPercentage: Number(oldGoldPurity) || 0,
        meltingDeductionPercent: Number(oldGoldDeduction) || 0,
        ratePerGram: metal === 'silver' ? rates.silver999PerGram : rates.gold24kPerGram,
        totalExchangeValue: oldGoldValue,
      }
    : undefined;

  const handleMetalChange = (newMetal: MetalType) => {
    setMetal(newMetal);
    setIsCustomPurity(false);
    if (newMetal === 'gold') {
      setSelectedPurityKey('22K');
      setMakingChargeRate('');
      setMakingChargeType('per_gram');
      setItemName('Hallmarked Gold Necklace');
      setCategory('Necklace');
      setHsnCode('7113');
    } else if (newMetal === 'silver') {
      setSelectedPurityKey('SILVER_925');
      setMakingChargeRate('');
      setMakingChargeType('per_gram');
      setItemName('Silver Article');
      setCategory('Silver Article');
      setHsnCode('7114');
    } else {
      setSelectedPurityKey('PLATINUM_950');
      setMakingChargeRate('');
      setMakingChargeType('per_gram');
      setItemName('Platinum Article');
      setCategory('Ring');
      setHsnCode('7113');
    }
  };

  const handleAdd = () => {
    if (!isTodayRateEntered(rates)) {
      alert("⚠️ Today's Bullion Rate is required! Please enter or confirm today's gold and silver rates before creating an estimate or bill.");
      if (onOpenRatesModal) onOpenRatesModal();
      return;
    }
    if (calculation.netWeight <= 0) {
      alert('Please enter a valid gross weight greater than stone weight.');
      return;
    }
    onAddItemToCart(currentItem, currentOldGold);
    setShowAddedNotice(true);
    setTimeout(() => setShowAddedNotice(false), 2500);
  };

  const handleReset = () => {
    setGrossWeight('');
    setStoneWeight('');
    setStoneValue('');
    setStoneDescription('');
    setWastagePercent('');
    setMakingChargeRate('');
    setHasOldGold(false);
    setOldGoldWeight('');
    setOldGoldPurity('');
    setOldGoldDeduction('');
    setOldGoldDesc('');
  };

  const ratesConfiguredToday = isTodayRateEntered(rates);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Costing Inputs */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-6">
        {/* Today's Bullion Rates Alert / Status Banner (No scrollbar) */}
        {!ratesConfiguredToday ? (
          <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-amber-950 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  ⚠️ Action Required: Enter Today's Rates
                </p>
                <p className="text-xs text-amber-800">
                  Today's bullion rates have not been entered yet. You must fill today's rates before creating an estimate or bill.
                </p>
              </div>
            </div>
            {onOpenRatesModal && (
              <button
                type="button"
                onClick={onOpenRatesModal}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Fill Today's Rates Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono-num py-0.5">
              <span className="font-sans font-bold text-stone-900 text-xs flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Today's Bullion Rates (Locked):
              </span>
              <span className="shrink-0 text-stone-700">
                24K: <strong className="text-stone-900 font-bold">{formatINR(rates.gold24kPerGram)}/g</strong>
              </span>
              <span className="text-stone-300">•</span>
              <span className="shrink-0 text-stone-700">
                22K: <strong className="text-amber-900 font-bold">{formatINR(rates.gold22kPerGram)}/g</strong>
              </span>
              <span className="text-stone-300">•</span>
              <span className="shrink-0 text-stone-700">
                Silver: <strong className="text-stone-900 font-bold">{formatINR(rates.silver999PerGram)}/g</strong>
              </span>
            </div>

            {onOpenRatesModal && (
              <button
                type="button"
                onClick={onOpenRatesModal}
                className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Click to update today's rates"
              >
                Update Rates ✎
              </button>
            )}
          </div>
        )}

        {/* Metal & Purity Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              1. Select Metal & Karat Purity
            </label>
            <span className="text-xs font-mono-num font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Rate: {formatINR(appliedRatePerGram)}/g
            </span>
          </div>

          {/* Metal buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleMetalChange('gold')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                metal === 'gold'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>Gold (Au)</span>
            </button>
            <button
              type="button"
              onClick={() => handleMetalChange('silver')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                metal === 'silver'
                  ? 'bg-stone-700 text-white border-stone-800 shadow-xs ring-2 ring-stone-400/30'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>Silver (Ag)</span>
            </button>
            <button
              type="button"
              onClick={() => handleMetalChange('platinum')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                metal === 'platinum'
                  ? 'bg-slate-700 text-white border-slate-800 shadow-xs ring-2 ring-slate-400/30'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>Platinum (Pt)</span>
            </button>
          </div>

          {/* Karat buttons for selected metal */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {metal === 'gold' && (
              <>
                {['22K', '18K', '24K', '14K', '20K'].map((karat) => {
                  const pct = STANDARD_PURITIES[karat]?.percentage || 91.6;
                  const karatRate = getRatePerGram('gold', pct, rates);
                  const isSelected = !isCustomPurity && selectedPurityKey === karat;
                  return (
                    <button
                      key={karat}
                      type="button"
                      onClick={() => {
                        setSelectedPurityKey(karat);
                        setIsCustomPurity(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-900 text-amber-100 border-amber-950 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span>{karat} ({pct}%)</span>
                      <span className={`text-[10px] font-mono-num px-1 py-0.2 rounded ${
                        isSelected ? 'bg-amber-800/80 text-amber-200' : 'bg-stone-100 text-stone-600'
                      }`}>
                        ₹{karatRate}/g
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {metal === 'silver' && (
              <>
                {['SILVER_999', 'SILVER_925'].map((key) => {
                  const pct = STANDARD_PURITIES[key]?.percentage || 99.9;
                  const silverRate = getRatePerGram('silver', pct, rates);
                  const isSelected = !isCustomPurity && selectedPurityKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedPurityKey(key);
                        setIsCustomPurity(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-950 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span>{STANDARD_PURITIES[key]?.label}</span>
                      <span className={`text-[10px] font-mono-num px-1 py-0.2 rounded ${
                        isSelected ? 'bg-stone-800 text-cyan-200' : 'bg-stone-100 text-stone-600'
                      }`}>
                        ₹{silverRate}/g
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {metal === 'platinum' && (
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white"
              >
                950 Platinum (95.0%)
              </button>
            )}

            {/* Custom Purity Toggle */}
            <button
              type="button"
              onClick={() => setIsCustomPurity(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isCustomPurity
                  ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              Custom Purity %
            </button>
          </div>

          {/* Custom Purity Slider & Input if enabled */}
          {isCustomPurity && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                <span>Enter Custom Testing Purity (Tunch %):</span>
                <span className="font-mono-num font-bold text-amber-800 text-sm">
                  {customPurityPercent}% ({((customPurityPercent * 24) / 100).toFixed(2)}K equivalent)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="99.9"
                  step="0.1"
                  value={customPurityPercent}
                  onChange={(e) => setCustomPurityPercent(Number(e.target.value))}
                  className="flex-1 accent-amber-600 cursor-pointer"
                />
                <div className="relative w-24">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.01"
                    value={customPurityPercent}
                    onChange={(e) => setCustomPurityPercent(Number(e.target.value))}
                    className="w-full pl-2 pr-6 py-1 text-xs font-mono-num font-bold bg-white border border-amber-300 rounded-lg text-right"
                  />
                  <span className="absolute right-2 top-1 text-xs text-stone-500">%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-stone-100">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Jewelry Item Description
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Hallmarked Gold Necklace, Antique Kada, Solitaire Ring"
              className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Category
            </label>
            <input
              type="text"
              list="jewelry-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Necklace, Ring"
              className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
            <datalist id="jewelry-categories">
              <option value="Necklace" />
              <option value="Bangle / Kada" />
              <option value="Finger Ring" />
              <option value="Earrings / Jhumka" />
              <option value="Chain / Mangalsutra" />
              <option value="Bracelet" />
              <option value="Pendant / Locket" />
              <option value="Coins & Bullion Bar" />
              <option value="Silver Utensil / Article" />
              <option value="Pooja Article" />
            </datalist>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              HSN Code
            </label>
            <input
              type="text"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="e.g. 7113, 7114"
              className="w-full px-3 py-1.5 text-xs font-mono-num font-semibold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* 2. Weight & Stone Deductions */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              2. Weight & Stone Deductions
            </span>
            <span className="font-mono-num font-bold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Net Weight: {formatGrams(calculation.netWeight)}
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Gross Weight (g) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm font-mono-num font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-2 text-xs text-stone-400 font-mono-num">g</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Stone / Bead Wt (g)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                  value={stoneWeight}
                  onChange={(e) => setStoneWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm font-mono-num bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-2 text-xs text-stone-400 font-mono-num">g</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Stone / Diamond Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-stone-500">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={stoneValue}
                  onChange={(e) => setStoneValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 text-sm font-mono-num bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {Number(stoneValue) > 0 && (
            <div>
              <input
                type="text"
                placeholder="Optional stone description (e.g. 0.50ct Diamond VVS1, Kundan, Pearls)"
                value={stoneDescription}
                onChange={(e) => setStoneDescription(e.target.value)}
                className="w-full px-3 py-1 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* 3. Wastage & Making Charges */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BadgePercent className="w-3.5 h-3.5 text-amber-600" />
              3. Labor Charges & Wastage
            </span>
            <span className="text-xs font-mono-num font-semibold text-stone-600">
              Labor: {formatINR(calculation.totalMakingCharge)}
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Wastage */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Wastage % (Kadda/Melting)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={wastagePercent}
                  onChange={(e) => setWastagePercent(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono-num bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-1.5 text-xs text-stone-400">%</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                ={formatGrams(calculation.wastageGrams)} ({formatINR(calculation.wastageCost)})
              </p>
            </div>

            {/* Making Charge Type */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Making Calculation Mode
              </label>
              <select
                value={makingChargeType}
                onChange={(e) => setMakingChargeType(e.target.value as MakingChargeType)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="per_gram">Per Gram (₹/g)</option>
                <option value="percentage">% of Gold Value</option>
                <option value="flat">Fixed Flat Rate (₹)</option>
              </select>
            </div>

            {/* Making Charge Rate */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {makingChargeType === 'per_gram' 
                  ? 'Labor Rate (₹ / gram)' 
                  : makingChargeType === 'percentage' 
                  ? 'Labor % on Metal' 
                  : 'Lump Sum Labor (₹)'}
              </label>
              <div className="relative">
                {makingChargeType !== 'percentage' && (
                  <span className="absolute left-3 top-1.5 text-xs text-stone-500">₹</span>
                )}
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={makingChargeRate}
                  onChange={(e) => setMakingChargeRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full py-1.5 text-xs font-mono-num font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 ${
                    makingChargeType === 'percentage' ? 'px-3 pr-7' : 'pl-7 pr-3'
                  }`}
                />
                {makingChargeType === 'percentage' && (
                  <span className="absolute right-3 top-1.5 text-xs text-stone-500">%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Old Gold / Silver Exchange (Toggleable) */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOldGold}
                onChange={(e) => setHasOldGold(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="uppercase tracking-wider">Include Old Gold / Metal Trade-in</span>
            </label>
            {hasOldGold && (
              <span className="text-xs font-mono-num font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Exchange Credit: -{formatINR(oldGoldValue)}
              </span>
            )}
          </div>

          {hasOldGold && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Old Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={oldGoldWeight}
                    onChange={(e) => setOldGoldWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-mono-num bg-white border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Tested Purity %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 85.0"
                    value={oldGoldPurity}
                    onChange={(e) => setOldGoldPurity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-mono-num bg-white border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Melting Deduct %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={oldGoldDeduction}
                    onChange={(e) => setOldGoldDeduction(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs font-mono-num bg-white border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Rate / g applied
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formatINR(metal === 'silver' ? rates.silver999PerGram : rates.gold24kPerGram)}
                    className="w-full px-2.5 py-1 text-xs font-mono-num bg-stone-100 border border-stone-200 rounded-lg text-stone-600"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Description of old ornaments returned"
                value={oldGoldDesc}
                onChange={(e) => setOldGoldDesc(e.target.value)}
                className="w-full px-3 py-1 text-xs bg-white border border-stone-200 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isTodayRateEntered(rates)) {
                  alert("⚠️ Today's Bullion Rate is required! Please enter or confirm today's gold and silver rates before creating a customer estimate.");
                  if (onOpenRatesModal) onOpenRatesModal();
                  return;
                }
                onQuickWhatsAppEstimate(currentItem, currentOldGold);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Generate formal PDF estimate and share directly on WhatsApp"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share Estimate PDF</span>
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add to Invoice Bill</span>
            </button>
          </div>
        </div>

        {showAddedNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Item successfully added to invoice bill! Scroll down or view billing drawer.</span>
          </div>
        )}
      </div>

      {/* Right Column: Live Price Estimation & Cost Breakdown Card */}
      <div className="lg:col-span-5 bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-xl border border-stone-800 sticky top-24 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Live Costing Estimate
            </span>
            <h3 className="text-base font-bold text-white font-cinzel">
              {itemName || 'Custom Jewelry Item'}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {isCustomPurity ? `${currentPurityPercent}% Purity` : selectedPurityKey}
          </span>
        </div>

        {/* Big Final Net Amount */}
        <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700/60">
          <span className="text-xs text-stone-400 block mb-1">
            Customer Payable (Incl. {defaultGstPercent}% GST):
          </span>
          <div className="text-3xl font-extrabold text-amber-300 font-mono-num tracking-tight">
            {formatINR(netPayable)}
          </div>
          {hasOldGold && oldGoldValue > 0 && (
            <p className="text-[11px] text-stone-400 mt-1">
              (After deducting <strong className="text-amber-200">-{formatINR(oldGoldValue)}</strong> old metal exchange credit)
            </p>
          )}
        </div>

        {/* Step-by-Step Price Breakdown */}
        <div className="space-y-2.5 text-xs text-stone-300">
          <div className="flex justify-between py-1 border-b border-stone-800/80">
            <span className="text-stone-400">
              Pure Metal ({formatGrams(calculation.netWeight)} × {formatINR(appliedRatePerGram)}):
            </span>
            <span className="font-mono-num font-semibold text-white">
              {formatINR(calculation.pureMetalCost)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-stone-800/80">
            <span className="text-stone-400">
              Wastage / Melting Loss ({wastagePercent || 0}% = {formatGrams(calculation.wastageGrams)}):
            </span>
            <span className="font-mono-num font-semibold text-white">
              +{formatINR(calculation.wastageCost)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-stone-800/80">
            <span className="text-stone-400">
              Making / Labor Charges ({makingChargeType}):
            </span>
            <span className="font-mono-num font-semibold text-white">
              +{formatINR(calculation.totalMakingCharge)}
            </span>
          </div>

          {calculation.stoneValue > 0 && (
            <div className="flex justify-between py-1 border-b border-stone-800/80">
              <span className="text-stone-400">Stones / Gems Value:</span>
              <span className="font-mono-num font-semibold text-white">
                +{formatINR(calculation.stoneValue)}
              </span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-stone-800/80">
            <span className="text-stone-400">BIS Hallmark & HUID Fee:</span>
            <span className="font-mono-num font-semibold text-white">
              +{formatINR(calculation.hallmarkFee)}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-stone-700 font-semibold text-stone-200 bg-stone-800/40 px-2 rounded-lg">
            <span>Taxable Subtotal (Before GST):</span>
            <span className="font-mono-num text-amber-200">
              {formatINR(calculation.itemTaxableAmount)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-stone-800/80 text-stone-400">
            <span>
              GST ({defaultGstPercent}% = 1.5% CGST + 1.5% SGST):
            </span>
            <span className="font-mono-num font-semibold text-white">
              +{formatINR(gstAmount)}
            </span>
          </div>

          {hasOldGold && oldGoldValue > 0 && (
            <div className="flex justify-between py-1 border-b border-stone-800/80 text-amber-400 font-medium">
              <span>Less: Old Gold Exchange ({formatGrams(oldGoldWeight || 0)}):</span>
              <span className="font-mono-num">
                -{formatINR(oldGoldValue)}
              </span>
            </div>
          )}
        </div>

        {/* Hallmark & BIS Compliance Badge */}
        <div className="p-3 bg-stone-800/50 rounded-xl border border-stone-700/50 flex items-start gap-2.5 text-xs text-stone-400">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-stone-200 block">
              Govt. HUID & BIS Hallmark Compliant
            </span>
            <span>
              Calculated using standard Indian Bureau of Indian Standards (BIS) hallmark purity conversion.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
        >
          <span>Add to Bill & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
