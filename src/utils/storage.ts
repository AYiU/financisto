import type { Account, Transaction, Category, Budget, Settings } from '../types';

const KEYS = {
  ACCOUNTS:     'financisto_accounts',
  TRANSACTIONS: 'financisto_transactions',
  CATEGORIES:   'financisto_categories',
  BUDGETS:      'financisto_budgets',
  SETTINGS:     'financisto_settings',
} as const;

function load<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadAccounts(): Account[] {
  return load<Account[]>(KEYS.ACCOUNTS, [
    { id: 1, name: 'Cash',     type: 'CASH', currency: 'USD', balance: 0, note: '' },
    { id: 2, name: 'Checking', type: 'BANK', currency: 'USD', balance: 0, note: '' },
  ]);
}

export function saveAccounts(accounts: Account[]): void {
  save(KEYS.ACCOUNTS, accounts);
}

export function loadTransactions(): Transaction[] {
  return load<Transaction[]>(KEYS.TRANSACTIONS, []);
}

export function saveTransactions(transactions: Transaction[]): void {
  save(KEYS.TRANSACTIONS, transactions);
}

export function loadCategories(): Category[] {
  return load<Category[]>(KEYS.CATEGORIES, [
    { id: 1, name: 'Food & Dining',  type: 'EXPENSE', color: '#e74c3c', parentId: null },
    { id: 2, name: 'Shopping',       type: 'EXPENSE', color: '#e67e22', parentId: null },
    { id: 3, name: 'Transport',      type: 'EXPENSE', color: '#f39c12', parentId: null },
    { id: 4, name: 'Housing',        type: 'EXPENSE', color: '#8e44ad', parentId: null },
    { id: 5, name: 'Entertainment',  type: 'EXPENSE', color: '#2980b9', parentId: null },
    { id: 6, name: 'Health',         type: 'EXPENSE', color: '#27ae60', parentId: null },
    { id: 7, name: 'Salary',         type: 'INCOME',  color: '#2ecc71', parentId: null },
    { id: 8, name: 'Other Income',   type: 'INCOME',  color: '#1abc9c', parentId: null },
  ]);
}

export function saveCategories(categories: Category[]): void {
  save(KEYS.CATEGORIES, categories);
}

export function loadBudgets(): Budget[] {
  return load<Budget[]>(KEYS.BUDGETS, []);
}

export function saveBudgets(budgets: Budget[]): void {
  save(KEYS.BUDGETS, budgets);
}

export function loadSettings(): Settings {
  return load<Settings>(KEYS.SETTINGS, {
    currency:   'USD',
    dateFormat: 'MM/DD/YYYY',
    theme:      'light',
  });
}

export function saveSettings(settings: Settings): void {
  save(KEYS.SETTINGS, settings);
}
