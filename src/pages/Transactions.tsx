import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatAmount, formatDate } from '../utils/helpers';
import type { Transaction, TransactionType } from '../types';
import Modal from '../components/Modal';
import TransactionForm from './TransactionForm';
import './Transactions.css';

type FilterType = TransactionType | 'ALL';

const TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Income', EXPENSE: 'Expense', TRANSFER_OUT: 'Transfer', TRANSFER_IN: 'Transfer',
};

const TYPE_OPTIONS: FilterType[] = ['ALL', 'INCOME', 'EXPENSE', 'TRANSFER_OUT'];

interface Filter {
  type: FilterType;
  accountId: string;
  categoryId: string;
  search: string;
}

export default function Transactions() {
  const { state, dispatch } = useApp();
  const { transactions, accounts, categories, settings } = state;

  const [filter, setFilter] = useState<Filter>({ type: 'ALL', accountId: '', categoryId: '', search: '' });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = transactions.filter((tx) => {
    if (filter.type !== 'ALL' && tx.type !== filter.type) return false;
    if (filter.accountId  && String(tx.accountId)  !== filter.accountId)  return false;
    if (filter.categoryId && String(tx.categoryId) !== filter.categoryId) return false;
    if (filter.search) {
      const q    = filter.search.toLowerCase();
      const note = (tx.note ?? '').toLowerCase();
      if (!note.includes(q)) return false;
    }
    return true;
  });

  function confirmDelete() {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_TRANSACTION', payload: deleteConfirm.id });
    setDeleteConfirm(null);
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-subtitle">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Transaction</button>
      </div>

      <div className="filters-bar">
        <input
          className="form-control filter-search"
          placeholder="🔍 Search by note..."
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="form-control"
          value={filter.type}
          onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value as FilterType }))}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === 'ALL' ? 'All Types' : TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select
          className="form-control"
          value={filter.accountId}
          onChange={(e) => setFilter((f) => ({ ...f, accountId: e.target.value }))}
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select
          className="form-control"
          value={filter.categoryId}
          onChange={(e) => setFilter((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-page">
          <div className="empty-icon">💳</div>
          <h3>No transactions</h3>
          <p>Add a transaction to get started</p>
        </div>
      ) : (
        <div className="tx-table-wrapper">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Account</th>
                <th>Category</th>
                <th>Note</th>
                <th className="text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const account  = accounts.find((a) => a.id === tx.accountId);
                const category = categories.find((c) => c.id === tx.categoryId);
                const isIncome   = tx.type === 'INCOME';
                const isTransfer = tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER_IN';
                return (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.date, settings.dateFormat)}</td>
                    <td>
                      <span className={`tx-badge ${isIncome ? 'income' : isTransfer ? 'transfer' : 'expense'}`}>
                        {TYPE_LABELS[tx.type]}
                      </span>
                    </td>
                    <td>{account?.name ?? '—'}</td>
                    <td>{category?.name ?? '—'}</td>
                    <td className="tx-note-cell">{tx.note || '—'}</td>
                    <td className={`text-right fw-bold ${isIncome ? 'income' : isTransfer ? 'transfer' : 'expense'}`}>
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatAmount(tx.amount, account?.currency ?? settings.currency)}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => setEditing(tx)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(tx)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd    && <TransactionForm onClose={() => setShowAdd(false)} />}
      {editing    && <TransactionForm transaction={editing} onClose={() => setEditing(null)} />}

      {deleteConfirm && (
        <Modal title="Delete Transaction" onClose={() => setDeleteConfirm(null)} size="sm">
          <p>Delete this transaction for {formatAmount(deleteConfirm.amount, settings.currency)}?</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
