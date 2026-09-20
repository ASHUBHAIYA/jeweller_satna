import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, RotateCcw, Lock, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { MetalRates } from '../types';
import { formatINR, isTodayRateEntered } from '../utils/calculator';
import { INITIAL_RATES } from '../data/initialData';

interface DailyRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: MetalRates;
  onSaveRates: (rates: MetalRates) => void;
}

type UnitMode = '1g' | '10g' | 'tola';

export const DailyRatesModal: React.FC<DailyRatesModalProps> = ({
  isOpen,
  onClose,
  rates,
  onSaveRates,
}) => {
  const [unitMode, setUnitMode] = useState<UnitMode>('1g');
  const [autoDeriveMode, setAutoDeriveMode] = useState<boolean>(true);

  // Multiplier for input
  const multiplier = unitMode === '1g' ? 1 : unitMode === '10g' ? 10 : 11.6638;

  // Local state for editing
  const [g24k, setG24k] = useState(rates.gold24kPerGram * multiplier);
  const [g22k, setG22k] = useState(rates.gold22kPerGram * multiplier);
  const [g18k, setG18k] = useState(rates.gold18kPerGram * multiplier);
  const [g14k, setG14k] = useState(rates.gold14kPerGram * multiplier);
  const [s999, setS999] = useState(rates.silver999PerGram * multiplier);
  const [s925, setS925] = useState(rates.silver925PerGram * multiplier);
  const [pt950, setPt950] = useState(rates.platinum950PerGram * multiplier);

  // Sync state whenever modal opens or rates change
  useEffect(() => {
    if (isOpen) {
      const mult = unitMode === '1g' ? 1 : unitMode === '10g' ? 10 : 11.6638;
      setG24k(rates.gold24kPerGram * mult);
      setG22k(rates.gold22kPerGram * mult);
      setG18k(rates.gold18kPerGram * mult);
      setG14k(rates.gold14kPerGram * mult);
      setS999(rates.silver999PerGram * mult);
      setS925(rates.silver925PerGram * mult);
      setPt950(rates.platinum950PerGram * mult);
    }
  }, [isOpen, rates, unitMode]);

  if (!isOpen) return null;

  const handleUnitModeChange = (newMode: UnitMode) => {
    const current1g_24k = g24k / multiplier;
    const current1g_22k = g22k / multiplier;
    const current1g_18k = g18k / multiplier;
    const current1g_14k = g14k / multiplier;
    const current1g_s999 = s999 / multiplier;
    const current1g_s925 = s925 / multiplier;
    const current1g_pt950 = pt950 / multiplier;

    const newMult = newMode === '1g' ? 1 : newMode === '10g' ? 10 : 11.6638;
    setUnitMode(newMode);
    setG24k(Math.round(current1g_24k * newMult));
    setG22k(Math.round(current1g_22k * newMult));
    setG18k(Math.round(current1g_18k * newMult));
    setG14k(Math.round(current1g_14k * newMult));
    setS999(Math.round(current1g_s999 * newMult * 10) / 10);
    setS925(Math.round(current1g_s925 * newMult * 10) / 10);
    setPt950(Math.round(current1g_pt950 * newMult));
  };

  // Automatic calculation handler when 24K Gold changes
  const handleGold24kChange = (newVal: number) => {
    setG24k(newVal);
    if (autoDeriveMode && newVal > 0) {
      // Automatic mathematical derivation from 24K pure bullion base
      const derived22k = Math.round((newVal * 91.6) / 99.9);
      const derived18k = Math.round((newVal * 75.0) / 99.9);
      const derived14k = Math.round((newVal * 58.5) / 99.9);
      setG22k(derived22k);
      setG18k(derived18k);
      setG14k(derived14k);
    }
  };

  // Automatic calculation handler when Silver 999 changes
  const handleSilver999Change = (newVal: number) => {
    setS999(newVal);
    if (autoDeriveMode && newVal > 0) {
      // Automatic mathematical derivation for 925 sterling
      const derived925 = Math.round(((newVal * 92.5) / 99.9) * 10) / 10;
      setS925(derived925);
    }
  };

  // Quick reset to realistic standard market rates (IBJA benchmark)
  const handleResetToBenchmark = () => {
    const mult = multiplier;
    setG24k(INITIAL_RATES.gold24kPerGram * mult);
    setG22k(INITIAL_RATES.gold22kPerGram * mult);
    setG18k(INITIAL_RATES.gold18kPerGram * mult);
    setG14k(INITIAL_RATES.gold14kPerGram * mult);
    setS999(INITIAL_RATES.silver999PerGram * mult);
    setS925(INITIAL_RATES.silver925PerGram * mult);
    setPt950(INITIAL_RATES.platinum950PerGram * mult);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRates: MetalRates = {
      gold24kPerGram: Math.round(g24k / multiplier),
      gold22kPerGram: Math.round(g22k / multiplier),
      gold18kPerGram: Math.round(g18k / multiplier),
      gold14kPerGram: Math.round(g14k / multiplier),
      silver999PerGram: Number((s999 / multiplier).toFixed(2)),
      silver925PerGram: Number((s925 / multiplier).toFixed(2)),
      platinum950PerGram: Math.round(pt950 / multiplier),
      lastUpdated: new Date().toISOString(),
    };

    onSaveRates(newRates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold font-cinzel tracking-wide flex items-center gap-2">
              <span>Today's Bullion Rates & Karat Engine</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Stable daily rates: updates 22K, 18K, 14K & 925 automatically</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Notice when today's rates are not set */}
          {!isTodayRateEntered(rates) && (
            <div className="bg-amber-500/15 border-2 border-amber-500 rounded-xl p-3 flex items-start gap-2.5 text-amber-950">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold text-amber-900">Today's Bullion Rate is Required</strong>
                <span className="text-amber-800">Please enter or confirm today's gold and silver rates below and click &quot;Save &amp; Lock Today's Rates&quot; before creating estimates or bills.</span>
              </div>
            </div>
          )}

          {/* Display Unit Selector */}
          <div className="flex items-center justify-between bg-stone-100 p-1 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-700 px-3">Quotation Unit:</span>
            <div className="flex gap-1">
              {(['1g', '10g', 'tola'] as UnitMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleUnitModeChange(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    unitMode === mode
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {mode === '1g' ? 'Per 1 Gram' : mode === '10g' ? 'Per 10 Grams' : 'Per Tola (11.66g)'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Derivation Toggle (Standard Retail Workflow) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Auto-Calculate Sub-Purities from 24K & Silver 999</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                When active, enter your base 24K Gold & 999 Silver rates. 22K (916), 18K, 14K & Silver 925 calculate automatically in real time.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={autoDeriveMode}
                onChange={(e) => setAutoDeriveMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Rates Grid */}
          <div className="space-y-3">
            {/* Gold Section */}
            <div className="border border-stone-200 rounded-xl p-3.5 space-y-3 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span>Gold Rates</span>
                  <span className="text-[10px] font-normal text-stone-500 lowercase bg-stone-100 px-1.5 py-0.5 rounded-sm">
                    {unitMode === '1g' ? 'per gram' : unitMode === '10g' ? 'per 10 grams' : 'per tola'}
                  </span>
                </span>
                {autoDeriveMode && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Auto-Linked
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 24K Benchmark Input */}
                <div className="col-span-2 sm:col-span-1 bg-amber-100/50 border border-amber-300 rounded-lg p-2.5">
                  <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center justify-between">
                    <span>Gold 24K (Pure 99.9%)</span>
                    <span className="text-[10px] font-bold text-amber-800 uppercase">Master Rate</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-600">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={g24k || ''}
                      onChange={(e) => handleGold24kChange(Number(e.target.value))}
                      placeholder="e.g. 7450"
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-mono-num font-bold bg-white border border-amber-400 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
                    />
                  </div>
                  <p className="text-[10px] text-stone-600 mt-1 font-mono-num">
                    {unitMode === '1g' ? `10g = ${formatINR(g24k * 10)}` : `1g = ${formatINR(Math.round(g24k / multiplier))}`}
                  </p>
                </div>

                {/* 22K (916 Hallmark) */}
                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg border border-stone-200 bg-white">
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                    <span>Gold 22K (916 Hallmark)</span>
                    {autoDeriveMode && (
                      <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.5 rounded-sm">
                        91.6% Pure
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={g22k || ''}
                      onChange={(e) => {
                        setG22k(Number(e.target.value));
                      }}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-mono-num font-semibold rounded-md border bg-white border-stone-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 18K (750 Hallmark) */}
                <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                    <span>Gold 18K (750 Hallmark)</span>
                    {autoDeriveMode && (
                      <span className="text-[9px] font-semibold text-stone-600 bg-stone-100 px-1 py-0.5 rounded-sm">
                        75% Pure
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={g18k || ''}
                      onChange={(e) => {
                        setG18k(Number(e.target.value));
                      }}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-mono-num font-semibold rounded-md border bg-white border-stone-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 14K (585 Hallmark) */}
                <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                    <span>Gold 14K (585 Hallmark)</span>
                    {autoDeriveMode && (
                      <span className="text-[9px] font-semibold text-stone-600 bg-stone-100 px-1 py-0.5 rounded-sm">
                        58.5% Pure
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={g14k || ''}
                      onChange={(e) => {
                        setG14k(Number(e.target.value));
                      }}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-mono-num font-semibold rounded-md border bg-white border-stone-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Silver & Platinum Section */}
            <div className="border border-stone-200 rounded-xl p-3.5 space-y-3 bg-stone-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Silver & Platinum Rates
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Silver 999 Fine */}
                <div className="p-2.5 rounded-lg border border-stone-300 bg-white">
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                    <span>Silver 999 (Fine Chandi)</span>
                    <span className="text-[10px] font-bold text-cyan-800 uppercase">Master</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={s999 || ''}
                      onChange={(e) => handleSilver999Change(Number(e.target.value))}
                      placeholder="e.g. 92"
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-mono-num font-bold bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 font-mono-num">
                    1 Kg = {formatINR((s999 / multiplier) * 1000)}
                  </p>
                </div>

                {/* Silver 925 Sterling */}
                <div className="p-2.5 rounded-lg border border-stone-200 bg-white">
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                    <span>Silver 925 (Sterling)</span>
                    {autoDeriveMode && (
                      <span className="text-[9px] font-semibold text-stone-600 bg-stone-100 px-1 py-0.5 rounded-sm">
                        92.5% Pure
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={s925 || ''}
                      onChange={(e) => setS925(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-mono-num font-semibold rounded-md border bg-white border-stone-300 focus:ring-2 focus:ring-stone-500"
                    />
                  </div>
                </div>

                {/* Platinum 950 */}
                <div className="col-span-2 p-2.5 rounded-lg border border-stone-200 bg-white">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Platinum 950 (Per Gram)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-semibold text-stone-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={pt950 || ''}
                      onChange={(e) => setPt950(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-mono-num font-semibold bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Benchmark Reset */}
          <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              <span>Reset to Standard Indian Market Rates:</span>
            </span>
            <button
              type="button"
              onClick={handleResetToBenchmark}
              className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Standard Market Benchmark</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Saved rates stay locked for today's billing</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Save & Lock Today's Rates
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
