import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  loadAccounts, saveAccounts,
  loadTransactions, saveTransactions,
  loadCategories, saveCategories,
  loadBudgets, saveBudgets,
  loadSettings, saveSettings,
} from '../utils/storage';
import { generateId } from '../utils/helpers';

const AppContext = createContext(null);

const initialState = {
  accounts: loadAccounts(),
  transactions: loadTransactions(),
  categories: loadCategories(),
  budgets: loadBudgets(),
  settings: loadSettings(),
};

function reducer(state, action) {
  switch (action.type) {
    // ── Accounts ──────────────────────────────────────────────────────────────
    case 'ADD_ACCOUNT': {
      const account = { ...action.payload, id: generateId() };
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
      const tx = { ...action.payload, id: generateId() };
      const transactions = [tx, ...state.transactions];
      saveTransactions(transactions);

      // Update account balance
      const accounts = state.accounts.map((acc) => {
        if (acc.id === tx.accountId) {
          const delta =
            tx.type === 'INCOME' ? tx.amount :
            tx.type === 'EXPENSE' ? -tx.amount :
            tx.type === 'TRANSFER_OUT' ? -tx.amount :
            tx.type === 'TRANSFER_IN' ? tx.amount : 0;
          return { ...acc, balance: (acc.balance || 0) + delta };
        }
        if (tx.type === 'TRANSFER_OUT' && acc.id === tx.toAccountId) {
          return { ...acc, balance: (acc.balance || 0) + tx.amount };
        }
        return acc;
      });
      saveAccounts(accounts);
      return { ...state, transactions, accounts };
    }
    case 'UPDATE_TRANSACTION': {
      const oldTx = state.transactions.find((t) => t.id === action.payload.id);
      const newTx = { ...action.payload };
      const transactions = state.transactions.map((t) =>
        t.id === newTx.id ? newTx : t
      );
      saveTransactions(transactions);

      // Revert old balance effect, apply new
      const accounts = state.accounts.map((acc) => {
        let balance = acc.balance || 0;
        if (oldTx) {
          if (acc.id === oldTx.accountId) {
            const oldDelta =
              oldTx.type === 'INCOME' ? oldTx.amount :
              oldTx.type === 'EXPENSE' ? -oldTx.amount :
              oldTx.type === 'TRANSFER_OUT' ? -oldTx.amount :
              oldTx.type === 'TRANSFER_IN' ? oldTx.amount : 0;
            balance -= oldDelta;
          }
          if (oldTx.type === 'TRANSFER_OUT' && acc.id === oldTx.toAccountId) {
            balance -= oldTx.amount;
          }
        }
        if (acc.id === newTx.accountId) {
          const newDelta =
            newTx.type === 'INCOME' ? newTx.amount :
            newTx.type === 'EXPENSE' ? -newTx.amount :
            newTx.type === 'TRANSFER_OUT' ? -newTx.amount :
            newTx.type === 'TRANSFER_IN' ? newTx.amount : 0;
          balance += newDelta;
        }
        if (newTx.type === 'TRANSFER_OUT' && acc.id === newTx.toAccountId) {
          balance += newTx.amount;
        }
        return { ...acc, balance };
      });
      saveAccounts(accounts);
      return { ...state, transactions, accounts };
    }
    case 'DELETE_TRANSACTION': {
      const tx = state.transactions.find((t) => t.id === action.payload);
      const transactions = state.transactions.filter((t) => t.id !== action.payload);
      saveTransactions(transactions);

      // Revert balance
      const accounts = state.accounts.map((acc) => {
        if (!tx) return acc;
        let balance = acc.balance || 0;
        if (acc.id === tx.accountId) {
          const delta =
            tx.type === 'INCOME' ? tx.amount :
            tx.type === 'EXPENSE' ? -tx.amount :
            tx.type === 'TRANSFER_OUT' ? -tx.amount :
            tx.type === 'TRANSFER_IN' ? tx.amount : 0;
          balance -= delta;
        }
        if (tx.type === 'TRANSFER_OUT' && acc.id === tx.toAccountId) {
          balance -= tx.amount;
        }
        return { ...acc, balance };
      });
      saveAccounts(accounts);
      return { ...state, transactions, accounts };
    }

    // ── Categories ────────────────────────────────────────────────────────────
    case 'ADD_CATEGORY': {
      const category = { ...action.payload, id: generateId() };
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
      const budget = { ...action.payload, id: generateId() };
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

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply theme from settings
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'light');
  }, [state.settings.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
