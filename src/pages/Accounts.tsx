import { useState, type Dispatch } from 'react';
import { useApp } from '../context/AppContext';
import { formatAmount } from '../utils/helpers';
import { CURRENCIES } from '../utils/helpers';
import type { Account, AccountType, AppAction, Settings } from '../types';
import Modal from '../components/Modal';
import './Accounts.css';

const ACCOUNT_TYPES: AccountType[] = ['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'INVESTMENT'];

const accountTypeIcons: Record<AccountType, string> = {
  CASH: '💵', BANK: '🏦', CREDIT_CARD: '💳', SAVINGS: '🏧', INVESTMENT: '📈',
};

type AccountModal =
  | { mode: 'add' }
  | { mode: 'edit'; account: Account };

export default function Accounts() {
  const { state, dispatch } = useApp();
  const { accounts, transactions, settings } = state;

  const [modal, setModal]               = useState<AccountModal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);

  function confirmDelete() {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_ACCOUNT', payload: deleteConfirm.id });
    setDeleteConfirm(null);
  }

  return (
    <div className="accounts-page">
      <div className="page-header">
        <div>
          <h1>Accounts</h1>
          <p className="page-subtitle">Manage your financial accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
          + Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="empty-page">
          <div className="empty-icon">🏦</div>
          <h3>No accounts yet</h3>
          <p>Add your first account to start tracking your finances</p>
          <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
            Add Account
          </button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((acc) => {
            const txCount = transactions.filter((t) => t.accountId === acc.id).length;
            return (
              <div key={acc.id} className="account-card">
                <div className="account-card__icon">{accountTypeIcons[acc.type]}</div>
                <div className="account-card__body">
                  <div className="account-card__name">{acc.name}</div>
                  <div className="account-card__meta">
                    {acc.type} · {acc.currency} · {txCount} transactions
                  </div>
                  {acc.note && <div className="account-card__note">{acc.note}</div>}
                </div>
                <div className={`account-card__balance ${acc.balance < 0 ? 'expense' : ''}`}>
                  {formatAmount(acc.balance, acc.currency)}
                </div>
                <div className="account-card__actions">
                  <button className="btn btn-sm btn-outline" onClick={() => setModal({ mode: 'edit', account: acc })}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(acc)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <AccountFormModal
          modal={modal}
          onClose={() => setModal(null)}
          dispatch={dispatch}
          settings={settings}
        />
      )}

      {deleteConfirm && (
        <Modal title="Delete Account" onClose={() => setDeleteConfirm(null)} size="sm">
          <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
          <p className="text-muted">This action cannot be undone.</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface AccountFormModalProps {
  modal: AccountModal;
  onClose: () => void;
  dispatch: Dispatch<AppAction>;
  settings: Settings;
}

interface AccountFormState {
  name: string;
  type: AccountType;
  currency: string;
  balance: string;
  note: string;
}

function AccountFormModal({ modal, onClose, dispatch, settings }: AccountFormModalProps) {
  const account = modal.mode === 'edit' ? modal.account : undefined;

  const [form, setForm] = useState<AccountFormState>({
    name:     account?.name     ?? '',
    type:     account?.type     ?? 'CASH',
    currency: account?.currency ?? settings.currency,
    balance:  account?.balance  != null ? String(account.balance) : '0',
    note:     account?.note     ?? '',
  });

  function set<K extends keyof AccountFormState>(key: K, value: AccountFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name:     form.name,
      type:     form.type,
      currency: form.currency,
      balance:  parseFloat(form.balance) || 0,
      note:     form.note,
    };
    if (modal.mode === 'add') {
      dispatch({ type: 'ADD_ACCOUNT', payload });
    } else {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { ...modal.account, ...payload } });
    }
    onClose();
  }

  return (
    <Modal title={modal.mode === 'add' ? 'Add Account' : 'Edit Account'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Account Name *</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="e.g. My Checking"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-control"
              value={form.type}
              onChange={(e) => set('type', e.target.value as AccountType)}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select
              className="form-control"
              value={form.currency}
              onChange={(e) => set('currency', e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} – {c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Opening Balance</label>
          <input
            className="form-control"
            type="number"
            step="0.01"
            value={form.balance}
            onChange={(e) => set('balance', e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Note (optional)</label>
          <input
            className="form-control"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="Any notes"
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {modal.mode === 'add' ? 'Add Account' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
