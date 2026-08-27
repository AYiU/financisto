import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { todayISO } from '../utils/helpers';
import type { Transaction, TransactionType } from '../types';
import Modal from '../components/Modal';

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
}

interface FormState {
  type: TransactionType;
  date: string;
  amount: string;
  accountId: string;
  toAccountId: string;
  categoryId: string;
  note: string;
}

export default function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  const { state, dispatch } = useApp();
  const { accounts, categories } = state;
  const isEdit = Boolean(transaction);

  const [form, setForm] = useState<FormState>({
    type:        transaction?.type        ?? 'EXPENSE',
    date:        transaction?.date        ?? todayISO(),
    amount:      transaction?.amount != null ? String(transaction.amount) : '',
    accountId:   transaction?.accountId != null ? String(transaction.accountId) : String(accounts[0]?.id ?? ''),
    toAccountId: transaction?.toAccountId != null ? String(transaction.toAccountId) : '',
    categoryId:  transaction?.categoryId  != null ? String(transaction.categoryId)  : '',
    note:        transaction?.note        ?? '',
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories  = categories.filter((c) => c.type === 'INCOME');
  const visibleCategories = form.type === 'INCOME' ? incomeCategories : expenseCategories;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    const payload = {
      type:        form.type,
      date:        form.date,
      note:        form.note,
      amount,
      accountId:   Number(form.accountId),
      toAccountId: form.type === 'TRANSFER_OUT' ? Number(form.toAccountId) : null,
      categoryId:  form.categoryId ? Number(form.categoryId) : null,
    };

    if (isEdit && transaction) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...transaction, ...payload } });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload });
    }
    onClose();
  }

  const typeOptions: { value: TransactionType; label: string }[] = [
    { value: 'EXPENSE',      label: 'Expense' },
    { value: 'INCOME',       label: 'Income' },
    { value: 'TRANSFER_OUT', label: 'Transfer' },
  ];

  return (
    <Modal title={isEdit ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="type-tabs">
            {typeOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`type-tab${form.type === value ? ' active' : ''}`}
                onClick={() => set('type', value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount *</label>
            <input
              className="form-control"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              className="form-control"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Account *</label>
          <select
            className="form-control"
            value={form.accountId}
            onChange={(e) => set('accountId', e.target.value)}
            required
          >
            <option value="">Select account...</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
            ))}
          </select>
        </div>

        {form.type === 'TRANSFER_OUT' && (
          <div className="form-group">
            <label className="form-label">To Account *</label>
            <select
              className="form-control"
              value={form.toAccountId}
              onChange={(e) => set('toAccountId', e.target.value)}
              required
            >
              <option value="">Select target account...</option>
              {accounts
                .filter((a) => String(a.id) !== form.accountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                ))}
            </select>
          </div>
        )}

        {form.type !== 'TRANSFER_OUT' && (
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
            >
              <option value="">No category</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Note</label>
          <input
            className="form-control"
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="Optional note..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
