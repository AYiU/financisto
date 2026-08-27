// ── Domain types ─────────────────────────────────────────────────────────────

export type AccountType = 'CASH' | 'BANK' | 'CREDIT_CARD' | 'SAVINGS' | 'INVESTMENT';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  note: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER_OUT' | 'TRANSFER_IN';

export interface Transaction {
  id: number;
  type: TransactionType;
  date: string;
  amount: number;
  accountId: number;
  toAccountId: number | null;
  categoryId: number | null;
  note: string;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string;
  parentId: number | null;
}

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Budget {
  id: number;
  name: string;
  amount: number;
  period: BudgetPeriod;
  categoryIds: number[];
}

export type Theme = 'light' | 'dark';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface Settings {
  currency: string;
  dateFormat: DateFormat;
  theme: Theme;
}

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: Settings;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// ── Reducer action types ──────────────────────────────────────────────────────

export type AppAction =
  | { type: 'ADD_ACCOUNT';       payload: Omit<Account, 'id'> }
  | { type: 'UPDATE_ACCOUNT';    payload: Account }
  | { type: 'DELETE_ACCOUNT';    payload: number }
  | { type: 'ADD_TRANSACTION';   payload: Omit<Transaction, 'id'> }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: number }
  | { type: 'ADD_CATEGORY';      payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY';   payload: Category }
  | { type: 'DELETE_CATEGORY';   payload: number }
  | { type: 'ADD_BUDGET';        payload: Omit<Budget, 'id'> }
  | { type: 'UPDATE_BUDGET';     payload: Budget }
  | { type: 'DELETE_BUDGET';     payload: number }
  | { type: 'UPDATE_SETTINGS';   payload: Partial<Settings> };
