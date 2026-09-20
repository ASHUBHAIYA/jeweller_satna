import { Invoice, JewelerStoreProfile, MetalRates, UserAccount } from '../types';
import { INITIAL_RATES, INITIAL_STORE_PROFILE, INITIAL_TRANSACTIONS, INITIAL_USER_ACCOUNT } from '../data/initialData';

const KEYS = {
  RATES: 'swarna_jeweler_rates_v1',
  PROFILE: 'swarna_jeweler_profile_v1',
  TRANSACTIONS: 'swarna_jeweler_transactions_v1',
  USER: 'swarna_jeweler_user_v1',
  SYNC_QUEUE: 'swarna_jeweler_sync_queue_v1',
  LAST_SYNC: 'swarna_jeweler_last_sync_v1',
};

export function loadRates(): MetalRates {
  try {
    const raw = localStorage.getItem(KEYS.RATES);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-correct unrealistic test numbers (e.g. ₹15,000/g gold or ₹261/g silver)
      if (parsed.gold24kPerGram >= 12000 || parsed.silver999PerGram >= 200 || !parsed.gold24kPerGram) {
        saveRates(INITIAL_RATES);
        return INITIAL_RATES;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading rates from storage', e);
  }
  return INITIAL_RATES;
}

export function saveRates(rates: MetalRates): void {
  try {
    localStorage.setItem(KEYS.RATES, JSON.stringify(rates));
  } catch (e) {
    console.error('Error saving rates to storage', e);
  }
}

export function loadStoreProfile(): JewelerStoreProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading profile from storage', e);
  }
  return INITIAL_STORE_PROFILE;
}

export function saveStoreProfile(profile: JewelerStoreProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to storage', e);
  }
}

export function loadTransactions(): Invoice[] {
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading transactions from storage', e);
  }
  return INITIAL_TRANSACTIONS;
}

export function saveTransactions(transactions: Invoice[]): void {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions to storage', e);
  }
}

export function loadUserAccount(): UserAccount {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_USER_ACCOUNT,
        ...parsed,
        securityQuestion: parsed.securityQuestion || INITIAL_USER_ACCOUNT.securityQuestion,
        securityAnswer: parsed.securityAnswer || INITIAL_USER_ACCOUNT.securityAnswer,
        backupPin: parsed.backupPin || INITIAL_USER_ACCOUNT.backupPin,
      };
    }
  } catch (e) {
    console.error('Error loading user account from storage', e);
  }
  return INITIAL_USER_ACCOUNT;
}

export function saveUserAccount(account: UserAccount): void {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(account));
  } catch (e) {
    console.error('Error saving user account to storage', e);
  }
}

export function getLastSyncTime(): string {
  try {
    return localStorage.getItem(KEYS.LAST_SYNC) || 'Just now';
  } catch {
    return 'Offline cache active';
  }
}

export function recordSyncSuccess(): void {
  try {
    localStorage.setItem(KEYS.LAST_SYNC, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  } catch (e) {
    console.error(e);
  }
}
