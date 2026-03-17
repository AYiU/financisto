import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatAmount } from '../utils/helpers';
import Modal from '../components/Modal';
import './Budgets.css';

const PERIODS = ['MONTHLY', 'WEEKLY', 'YEARLY'];

export default function Budgets() {
  const { state, dispatch } = useApp();
  const { budgets, categories, transactions, settings } = state;
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const now = new Date();

  function getSpent(budget) {
    const startDate = periodStart(budget.period, now);
    return transactions
      .filter((t) => {
        if (t.type !== 'EXPENSE') return false;
        if (t.date < startDate) return false;
        if (budget.categoryIds && budget.categoryIds.length > 0) {
          if (!budget.categoryIds.includes(t.categoryId)) return false;
        }
        return true;
      })
      .reduce((s, t) => s + t.amount, 0);
  }

  function confirmDelete() {
    dispatch({ type: 'DELETE_BUDGET', payload: deleteConfirm.id });
    setDeleteConfirm(null);
  }

  return (
    <div className="budgets-page">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p className="page-subtitle">Track your spending limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
          + Add Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="empty-page">
          <div className="empty-icon">📊</div>
          <h3>No budgets yet</h3>
          <p>Create a budget to track your spending limits</p>
          <button className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
            Create Budget
          </button>
        </div>
      ) : (
        <div className="budget-list">
          {budgets.map((budget) => {
            const spent = getSpent(budget);
            const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
            const over = spent > budget.amount;
            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-card__header">
                  <div>
                    <div className="budget-card__name">{budget.name}</div>
                    <div className="budget-card__period">{budget.period}</div>
                  </div>
                  <div className="budget-card__actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setModal({ mode: 'edit', budget })}
                    >Edit</button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(budget)}
                    >Delete</button>
                  </div>
                </div>
                <div className="budget-progress">
                  <div className="budget-progress__bar">
                    <div
                      className={`budget-progress__fill ${over ? 'over' : pct > 80 ? 'warning' : 'ok'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="budget-progress__labels">
                    <span className={over ? 'expense' : ''}>
                      Spent: {formatAmount(spent, settings.currency)}
                    </span>
                    <span>
                      Budget: {formatAmount(budget.amount, settings.currency)}
                    </span>
                  </div>
                </div>
                {over && (
                  <div className="budget-over-warning">
                    ⚠️ Over budget by {formatAmount(spent - budget.amount, settings.currency)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <BudgetModal
          mode={modal.mode}
          budget={modal.budget}
          categories={categories.filter((c) => c.type === 'EXPENSE' || !c.type)}
          onClose={() => setModal(null)}
          dispatch={dispatch}
        />
      )}

      {deleteConfirm && (
        <Modal title="Delete Budget" onClose={() => setDeleteConfirm(null)} size="sm">
          <p>Delete budget <strong>{deleteConfirm.name}</strong>?</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function periodStart(period, now) {
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  if (period === 'WEEKLY') {
    const day = now.getDay();
    const start = new Date(y, m, d - day);
    return start.toISOString().slice(0, 10);
  }
  if (period === 'YEARLY') {
    return `${y}-01-01`;
  }
  // MONTHLY default
  return new Date(y, m, 1).toISOString().slice(0, 10);
}

function BudgetModal({ mode, budget, categories, onClose, dispatch }) {
  const [form, setForm] = useState({
    name: budget?.name || '',
    amount: budget?.amount ?? '',
    period: budget?.period || 'MONTHLY',
    categoryIds: budget?.categoryIds || [],
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCategory(id) {
    setForm((f) => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter((x) => x !== id)
        : [...f.categoryIds, id];
      return { ...f, categoryIds: ids };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) || 0 };
    if (mode === 'add') {
      dispatch({ type: 'ADD_BUDGET', payload });
    } else {
      dispatch({ type: 'UPDATE_BUDGET', payload: { ...budget, ...payload } });
    }
    onClose();
  }

  return (
    <Modal title={mode === 'add' ? 'Add Budget' : 'Edit Budget'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Budget Name *</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="e.g. Monthly Food"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Limit Amount *</label>
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
            <label className="form-label">Period</label>
            <select
              className="form-control"
              value={form.period}
              onChange={(e) => set('period', e.target.value)}
            >
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Categories (leave empty for all)</label>
          <div className="category-checkboxes">
            {categories.map((cat) => (
              <label key={cat.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.categoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                <span className="cat-dot-sm" style={{ background: cat.color || '#999' }} />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {mode === 'add' ? 'Add Budget' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
