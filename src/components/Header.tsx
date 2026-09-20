import React from 'react';
import { 
  Gem, 
  Calculator, 
  History, 
  Settings, 
  Lock, 
  Coins,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { JewelerStoreProfile, MetalRates, UserAccount } from '../types';
import { formatINR, isTodayRateEntered } from '../utils/calculator';

interface HeaderProps {
  activeTab: 'calculator' | 'transactions';
  setActiveTab: (tab: 'calculator' | 'transactions') => void;
  rates: MetalRates;
  profile: JewelerStoreProfile;
  user: UserAccount;
  onOpenRatesModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  rates,
  profile,
  user,
  onOpenRatesModal,
  onOpenSettingsModal,
  onOpenAuthModal,
}) => {
  const ratesConfiguredToday = isTodayRateEntered(rates);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Main Clean Navigation Bar (No scrolling ticker or horizontal scrollbars) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-sm ring-2 ring-amber-400/30">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 font-cinzel leading-none">
                {profile.storeName}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-300">
                BIS 916
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              GST: <span className="font-mono-num font-semibold text-stone-700">{profile.gstin}</span> • {profile.cityState}
            </p>
          </div>
        </div>

        {/* Primary Section Tabs */}
        <nav className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>POS & Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-4 h-4 text-amber-600" />
            <span>Sales & Bills</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Today's Rates Button: Highlights if rates not entered for today */}
          {ratesConfiguredToday ? (
            <button
              onClick={onOpenRatesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-all cursor-pointer"
              title="Click to view or edit today's locked bullion rates"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline text-stone-600">Today's 24K:</span>
              <strong className="font-mono-num text-amber-900">{formatINR(rates.gold24kPerGram)}/g</strong>
            </button>
          ) : (
            <button
              onClick={onOpenRatesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs animate-pulse cursor-pointer border border-amber-700"
              title="Today's bullion rates not yet confirmed! Click to set rates."
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-200" />
              <span>Enter Today's Rates</span>
            </button>
          )}

          {/* User Account / Security Lock */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
            title="Account Security & Lock"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden lg:inline">{user.username}</span>
            <Lock className="w-3 h-3 text-stone-400" />
          </button>

          {/* Store Settings */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-colors cursor-pointer"
            title="Store Branding & Invoice Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
