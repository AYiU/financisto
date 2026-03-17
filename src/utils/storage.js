const KEYS = {
  ACCOUNTS: 'financisto_accounts',
  TRANSACTIONS: 'financisto_transactions',
  CATEGORIES: 'financisto_categories',
  BUDGETS: 'financisto_budgets',
  SETTINGS: 'financisto_settings',
};

function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadAccounts() {
  return load(KEYS.ACCOUNTS, [
    { id: 1, name: 'Cash', type: 'CASH', currency: 'USD', balance: 0, note: '' },
    { id: 2, name: 'Checking', type: 'BANK', currency: 'USD', balance: 0, note: '' },
  ]);
}

export function saveAccounts(accounts) {
  save(KEYS.ACCOUNTS, accounts);
}

export function loadTransactions() {
  return load(KEYS.TRANSACTIONS, []);
}

export function saveTransactions(transactions) {
  save(KEYS.TRANSACTIONS, transactions);
}

export function loadCategories() {
  return load(KEYS.CATEGORIES, [
    { id: 1, name: 'Food & Dining', type: 'EXPENSE', color: '#e74c3c', parentId: null },
    { id: 2, name: 'Shopping', type: 'EXPENSE', color: '#e67e22', parentId: null },
    { id: 3, name: 'Transport', type: 'EXPENSE', color: '#f39c12', parentId: null },
    { id: 4, name: 'Housing', type: 'EXPENSE', color: '#8e44ad', parentId: null },
    { id: 5, name: 'Entertainment', type: 'EXPENSE', color: '#2980b9', parentId: null },
    { id: 6, name: 'Health', type: 'EXPENSE', color: '#27ae60', parentId: null },
    { id: 7, name: 'Salary', type: 'INCOME', color: '#2ecc71', parentId: null },
    { id: 8, name: 'Other Income', type: 'INCOME', color: '#1abc9c', parentId: null },
  ]);
}

export function saveCategories(categories) {
  save(KEYS.CATEGORIES, categories);
}

export function loadBudgets() {
  return load(KEYS.BUDGETS, []);
}

export function saveBudgets(budgets) {
  save(KEYS.BUDGETS, budgets);
}

export function loadSettings() {
  return load(KEYS.SETTINGS, {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
  });
}

export function saveSettings(settings) {
  save(KEYS.SETTINGS, settings);
}
