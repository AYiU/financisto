import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { AppState, AppAction, Account, Transaction, Category, Budget } from '../types';
import {
  loadAccounts,    saveAccounts,
  loadTransactions, saveTransactions,
  loadCategories,  saveCategories,
  loadBudgets,     saveBudgets,
  loadSettings,    saveSettings,
} from '../utils/storage';
import { generateId } from '../utils/helpers';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = {
  accounts:     loadAccounts(),
  transactions: loadTransactions(),
  categories:   loadCategories(),
  budgets:      loadBudgets(),
  settings:     loadSettings(),
};

function txDelta(type: Transaction['type'], amount: number): number {
  if (type === 'INCOME'      ) return  amount;
  if (type === 'EXPENSE'     ) return -amount;
  if (type === 'TRANSFER_OUT') return -amount;
  if (type === 'TRANSFER_IN' ) return  amount;
  return 0;
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ── Accounts ──────────────────────────────────────────────────────────────
    case 'ADD_ACCOUNT': {
      const account: Account = { ...action.payload, id: generateId() };
      const accounts = [...state.accounts, account];
      saveAccounts(accounts);
      return { ...state, accounts };
    }
    case 'UPDATE_ACCOUNT': {
      const accounts = state.accounts.map((a) =>
        a.id === action.payload.id ? { ...a, ...action.payload } : a
      );
      saveAccounts(accounts);
      return { ...state, accounts };
    }
    case 'DELETE_ACCOUNT': {
      const accounts = state.accounts.filter((a) => a.id !== action.payload);
      saveAccounts(accounts);
      return { ...state, accounts };
    }

    // ── Transactions ──────────────────────────────────────────────────────────
    case 'ADD_TRANSACTION': {
      const tx: Transaction = { ...action.payload, id: generateId() };
      const transactions = [tx, ...state.transactions];
      saveTransactions(transactions);

      const accounts = state.accounts.map((acc) => {
        if (acc.id === tx.accountId) {
          return { ...acc, balance: acc.balance + txDelta(tx.type, tx.amount) };
        }
        if (tx.type === 'TRANSFER_OUT' && acc.id === tx.toAccountId) {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        return acc;
      });
      saveAccounts(accounts);
      return { ...state, transactions, accounts };
    }
    case 'UPDATE_TRANSACTION': {
      const oldTx = state.transactions.find((t) => t.id === action.payload.id);
      const newTx: Transaction = { ...action.payload };
      const transactions = state.transactions.map((t) =>
        t.id === newTx.id ? newTx : t
      );
      saveTransactions(transactions);

      const accounts = state.accounts.map((acc) => {
        let balance = acc.balance;
        if (oldTx) {
          if (acc.id === oldTx.accountId) balance -= txDelta(oldTx.type, oldTx.amount);
          if (oldTx.type === 'TRANSFER_OUT' && acc.id === oldTx.toAccountId) balance -= oldTx.amount;
        }
        if (acc.id === newTx.accountId) balance += txDelta(newTx.type, newTx.amount);
        if (newTx.type === 'TRANSFER_OUT' && acc.id === newTx.toAccountId) balance += newTx.amount;
        return { ...acc, balance };
      });
      saveAccounts(accounts);
      return { ...state, transactions, accounts };
    }
    case 'DELETE_TRANSACTION': {
      const tx = state.transactions.find((t) => t.id === action.payload);
      const transactions = state.transactions.filter((t) => t.id !== action.payload);
      saveTransactions(transactions);

      const accounts = state.accounts.map((acc) => {
        if (!tx) return acc;
        let balance = acc.balance;
        if (acc.id === tx.accountId) balance -= txDelta(tx.type, tx.amount);
        if (tx.type === 'TRANSFER_OUT' && acc.id === tx.toAccountId) balance -= tx.amount;
        return { ...acc, balance };
      });
      saveAccounts(accounts);
      return { ...state, transactions, accounts };
    }

    // ── Categories ────────────────────────────────────────────────────────────
    case 'ADD_CATEGORY': {
      const category: Category = { ...action.payload, id: generateId() };
      const categories = [...state.categories, category];
      saveCategories(categories);
      return { ...state, categories };
    }
    case 'UPDATE_CATEGORY': {
      const categories = state.categories.map((c) =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      saveCategories(categories);
      return { ...state, categories };
    }
    case 'DELETE_CATEGORY': {
      const categories = state.categories.filter(
        (c) => c.id !== action.payload && c.parentId !== action.payload
      );
      saveCategories(categories);
      return { ...state, categories };
    }

    // ── Budgets ───────────────────────────────────────────────────────────────
    case 'ADD_BUDGET': {
      const budget: Budget = { ...action.payload, id: generateId() };
      const budgets = [...state.budgets, budget];
      saveBudgets(budgets);
      return { ...state, budgets };
    }
    case 'UPDATE_BUDGET': {
      const budgets = state.budgets.map((b) =>
        b.id === action.payload.id ? { ...b, ...action.payload } : b
      );
      saveBudgets(budgets);
      return { ...state, budgets };
    }
    case 'DELETE_BUDGET': {
      const budgets = state.budgets.filter((b) => b.id !== action.payload);
      saveBudgets(budgets);
      return { ...state, budgets };
    }

    // ── Settings ──────────────────────────────────────────────────────────────
    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.payload };
      saveSettings(settings);
      return { ...state, settings };
    }
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  }, [state.settings.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
