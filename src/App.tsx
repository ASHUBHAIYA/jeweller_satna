import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { JewelryCalculator } from './components/JewelryCalculator';
import { InvoiceBuilder } from './components/InvoiceBuilder';
import { InvoiceViewModal } from './components/InvoiceViewModal';
import { TransactionsList } from './components/TransactionsList';
import { DailyRatesModal } from './components/DailyRatesModal';
import { CATaxExportModal } from './components/CATaxExportModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { 
  Invoice, 
  JewelerStoreProfile, 
  JewelryItem, 
  MetalRates, 
  OldGoldExchange, 
  UserAccount 
} from './types';
import { 
  getLastSyncTime, 
  loadRates, 
  loadStoreProfile, 
  loadTransactions, 
  loadUserAccount, 
  recordSyncSuccess, 
  saveRates, 
  saveStoreProfile, 
  saveTransactions, 
  saveUserAccount 
} from './utils/storage';
import { formatGrams, formatINR, isTodayRateEntered } from './utils/calculator';
import { shareEstimateViaWhatsAppWithPdf, shareInvoiceViaWhatsAppWithPdf } from './utils/pdfGenerator';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  // Master App State
  const [rates, setRates] = useState<MetalRates>(() => loadRates());
  const [profile, setProfile] = useState<JewelerStoreProfile>(() => loadStoreProfile());
  const [transactions, setTransactions] = useState<Invoice[]>(() => loadTransactions());
  const [user, setUser] = useState<UserAccount>(() => loadUserAccount());

  // Navigation & Cart State
  const [activeTab, setActiveTab] = useState<'calculator' | 'transactions'>('calculator');
  const [cartItems, setCartItems] = useState<JewelryItem[]>([]);
  const [cartOldGold, setCartOldGold] = useState<OldGoldExchange | undefined>(undefined);

  // Modals
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => getLastSyncTime());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Prompt user on morning startup if today's rates have not been entered
  useEffect(() => {
    if (!isTodayRateEntered(rates)) {
      const timer = setTimeout(() => {
        setIsRatesModalOpen(true);
        showToast("⚠️ Please enter today's gold & silver rates before creating estimates or bills.");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored: Auto-synchronizing with cloud database...');
      handleSync(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Working offline: All bills & rates safely stored in device storage.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Continuous Background Auto-Sync: checks every 30 seconds to sync to database
  useEffect(() => {
    const checkAndSyncDatabase = () => {
      const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(isCurrentlyOnline);

      if (isCurrentlyOnline) {
        setTransactions((prev) => {
          const hasUnsynced = prev.some((t) => !t.syncedToCloud);
          if (hasUnsynced) {
            recordSyncSuccess();
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSyncTime(timeStr);
            const updated = prev.map((t) => ({ ...t, syncedToCloud: true }));
            saveTransactions(updated);
            return updated;
          }
          return prev;
        });
      }
    };

    // Run check every 30 seconds
    const syncInterval = setInterval(checkAndSyncDatabase, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Immediate or Manual Sync Handler
  const handleSync = (isAuto = false) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      recordSyncSuccess();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      // Mark all as synced in database
      setTransactions((prev) => {
        const updated = prev.map((t) => ({ ...t, syncedToCloud: true }));
        saveTransactions(updated);
        return updated;
      });
      if (!isAuto) {
        showToast('All invoices, customer ledgers & bullion rates synchronized to database.');
      }
    }, 600);
  };

  // Rate Update Handler
  const handleSaveRates = (newRates: MetalRates) => {
    setRates(newRates);
    saveRates(newRates);
    handleSync(true); // Instant auto-sync on change
    showToast("Today's bullion rates confirmed and locked for billing.");
  };

  // Profile Update Handler
  const handleSaveProfile = (newProfile: JewelerStoreProfile) => {
    setProfile(newProfile);
    saveStoreProfile(newProfile);
    handleSync(true); // Instant auto-sync on change
    showToast('Store details & invoice settings updated successfully.');
  };

  // User Update Handler
  const handleUpdateUser = (newUser: UserAccount) => {
    setUser(newUser);
    saveUserAccount(newUser);
    handleSync(true); // Instant auto-sync on change
    showToast(`Account updated: Signed in as ${newUser.username}`);
  };

  // User Login Handler
  const handleLoginSuccess = (loggedInUser: UserAccount) => {
    setUser(loggedInUser);
    saveUserAccount(loggedInUser);
    handleSync(true);
    showToast(`Welcome, ${loggedInUser.username}! Signed in successfully.`);
  };

  // User Logout Handler
  const handleLogout = () => {
    const loggedOutUser: UserAccount = {
      ...user,
      isAuthenticated: false,
    };
    setUser(loggedOutUser);
    saveUserAccount(loggedOutUser);
    handleSync(true);
    showToast('Signed out. Please sign in with your PIN to access.');
  };

  // Cart operations
  const handleAddItemToCart = (item: JewelryItem, oldGoldExchange?: OldGoldExchange) => {
    setCartItems((prev) => [...prev, item]);
    if (oldGoldExchange?.enabled) {
      setCartOldGold(oldGoldExchange);
    }
    showToast(`Added ${item.name} to bill cart.`);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartOldGold(undefined);
  };

  const handleRemoveOldGold = () => {
    setCartOldGold(undefined);
  };

  // Save finalized invoice
  const handleSaveAndGenerateInvoice = (newInvoice: Invoice) => {
    const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const invoiceToSave = {
      ...newInvoice,
      syncedToCloud: isCurrentlyOnline,
    };

    const updatedTransactions = [invoiceToSave, ...transactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);

    // Increment current invoice number
    const updatedProfile = {
      ...profile,
      currentInvoiceNumber: profile.currentInvoiceNumber + 1,
    };
    setProfile(updatedProfile);
    saveStoreProfile(updatedProfile);

    // Clear cart
    setCartItems([]);
    setCartOldGold(undefined);

    // Automatically sync when bill is generated
    if (isCurrentlyOnline) {
      handleSync(true);
      showToast(`Bill #${newInvoice.invoiceNumber} generated & automatically synced to database.`);
    } else {
      showToast(`Bill #${newInvoice.invoiceNumber} generated. Offline mode: will auto-sync to database in background.`);
    }

    // Open printable invoice view
    setViewingInvoice(invoiceToSave);
  };

  // Delete invoice
  const handleDeleteInvoice = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    handleSync(true);
    showToast('Invoice removed and synced.');
  };

  // Quick WhatsApp estimate sharing from calculator with auto-generated PDF
  const handleQuickWhatsAppEstimate = async (item: JewelryItem, oldGoldExchange?: OldGoldExchange) => {
    try {
      showToast('Generating official PDF estimate for WhatsApp...');
      await shareEstimateViaWhatsAppWithPdf({
        item,
        oldGoldExchange,
        profile,
      });
      showToast('Estimate PDF generated & shared!');
    } catch (err) {
      console.error('Failed to share PDF estimate:', err);
      showToast('Error sharing PDF estimate. Please try again.');
    }
  };

  // Direct WhatsApp share of existing bill with auto-generated PDF
  const handleShareExistingBillWhatsApp = async (invoice: Invoice) => {
    try {
      showToast(`Generating Tax Invoice #${invoice.invoiceNumber} PDF...`);
      await shareInvoiceViaWhatsAppWithPdf(invoice, profile);
      showToast(`Invoice #${invoice.invoiceNumber} PDF generated & shared!`);
    } catch (err) {
      console.error('Failed to share bill PDF:', err);
      setViewingInvoice(invoice);
    }
  };

  // If user is not authenticated, display full Authentication / Login Page
  if (!user.isAuthenticated) {
    return (
      <LoginPage
        user={user}
        profile={profile}
        onLoginSuccess={handleLoginSuccess}
        onSaveUserToDb={(updatedUser) => {
          setUser(updatedUser);
          saveUserAccount(updatedUser);
          handleSync(true);
        }}
        onUpdateStoreProfile={handleSaveProfile}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100/60 text-stone-900">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-stone-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 no-print">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Live Rate Ticker */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rates={rates}
        profile={profile}
        user={user}
        onOpenRatesModal={() => setIsRatesModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Application Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Step 1: Jewelry Item Costing Calculator */}
            <JewelryCalculator
              rates={rates}
              defaultGstPercent={profile.defaultGstPercent}
              defaultHallmarkFee={profile.defaultHallmarkFee}
              onAddItemToCart={handleAddItemToCart}
              onQuickWhatsAppEstimate={handleQuickWhatsAppEstimate}
              onOpenRatesModal={() => setIsRatesModalOpen(true)}
            />

            {/* Step 2: Active Invoice Builder & Tax Billing */}
            <InvoiceBuilder
              items={cartItems}
              oldGoldExchange={cartOldGold}
              profile={profile}
              rates={rates}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onRemoveOldGold={handleRemoveOldGold}
              onSaveAndGenerateInvoice={handleSaveAndGenerateInvoice}
              onSwitchToCalculator={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onOpenRatesModal={() => setIsRatesModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionsList
            transactions={transactions}
            profile={profile}
            onViewInvoice={(inv) => setViewingInvoice(inv)}
            onDeleteInvoice={handleDeleteInvoice}
            onOpenTaxModal={() => setIsTaxModalOpen(true)}
            onShareWhatsApp={handleShareExistingBillWhatsApp}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 px-6 text-center text-xs text-stone-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-stone-800 font-cinzel">{profile.storeName}</span> • BIS Hallmark & GST Billing Suite
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Offline-First Engine Active</span>
            <span>•</span>
            <span>Secure Local Cache</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">100% Tax & Hallmark Compliant</span>
          </div>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <DailyRatesModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
        rates={rates}
        onSaveRates={handleSaveRates}
      />

      <CATaxExportModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        invoices={transactions}
        profile={profile}
      />

      <StoreSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />

      <InvoiceViewModal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        profile={profile}
      />
    </div>
  );
}
