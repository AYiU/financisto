import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { todayISO } from '../utils/helpers';
import Modal from '../components/Modal';

export default function TransactionForm({ transaction, onClose }) {
  const { state, dispatch } = useApp();
  const { accounts, categories } = state;
  const isEdit = Boolean(transaction);

  const [form, setForm] = useState({
    type: transaction?.type || 'EXPENSE',
    date: transaction?.date || todayISO(),
    amount: transaction?.amount ?? '',
    accountId: transaction?.accountId || accounts[0]?.id || '',
    toAccountId: transaction?.toAccountId || '',
    categoryId: transaction?.categoryId || '',
    note: transaction?.note || '',
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' || !c.type);
  const incomeCategories  = categories.filter((c) => c.type === 'INCOME');
  const visibleCategories = form.type === 'INCOME' ? incomeCategories : expenseCategories;

  function handleSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    const payload = {
      ...form,
      amount,
      accountId: Number(form.accountId),
      toAccountId: form.type === 'TRANSFER_OUT' ? Number(form.toAccountId) : null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };

    if (isEdit) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...transaction, ...payload } });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload });
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        {/* Type selector */}
        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="type-tabs">
            {[
              { value: 'EXPENSE',      label: 'Expense' },
              { value: 'INCOME',       label: 'Income' },
              { value: 'TRANSFER_OUT', label: 'Transfer' },
            ].map(({ value, label }) => (
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
              required={form.type === 'TRANSFER_OUT'}
            >
              <option value="">Select target account...</option>
              {accounts
                .filter((a) => String(a.id) !== String(form.accountId))
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
