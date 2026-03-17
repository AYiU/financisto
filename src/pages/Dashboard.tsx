import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatAmount } from '../utils/helpers';
import type { Account, Transaction, AppState } from '../types';
import TransactionForm from './TransactionForm';
import './Dashboard.css';

export default function Dashboard() {
  const { state } = useApp();
  const { accounts, transactions, settings } = state;
  const [showAddTx, setShowAddTx] = useState(false);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthTxs = transactions.filter((t) => t.date >= monthStart);

  const monthIncome  = monthTxs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your finances</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddTx(true)}>
          + Add Transaction
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card summary-card--balance">
          <div className="summary-card__label">Total Balance</div>
          <div className="summary-card__value">
            {formatAmount(totalBalance, settings.currency)}
          </div>
          <div className="summary-card__sub">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="summary-card summary-card--income">
          <div className="summary-card__label">This Month Income</div>
          <div className="summary-card__value income">
            +{formatAmount(monthIncome, settings.currency)}
          </div>
        </div>
        <div className="summary-card summary-card--expense">
          <div className="summary-card__label">This Month Expenses</div>
          <div className="summary-card__value expense">
            -{formatAmount(monthExpense, settings.currency)}
          </div>
        </div>
        <div className="summary-card summary-card--net">
          <div className="summary-card__label">This Month Net</div>
          <div className={`summary-card__value ${monthIncome - monthExpense >= 0 ? 'income' : 'expense'}`}>
            {formatAmount(monthIncome - monthExpense, settings.currency)}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h2>Accounts</h2>
            <Link to="/accounts" className="card-link">View all →</Link>
          </div>
          {accounts.length === 0 ? (
            <p className="empty-state">No accounts yet. <Link to="/accounts">Add one →</Link></p>
          ) : (
            <ul className="account-list">
              {accounts.map((acc) => (
                <li key={acc.id} className="account-item">
                  <span className="account-icon">{accountIcon(acc.type)}</span>
                  <div className="account-info">
                    <span className="account-name">{acc.name}</span>
                    <span className="account-type">{acc.type} · {acc.currency}</span>
                  </div>
                  <span className={`account-balance ${acc.balance < 0 ? 'expense' : ''}`}>
                    {formatAmount(acc.balance, acc.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Recent Transactions</h2>
            <Link to="/transactions" className="card-link">View all →</Link>
          </div>
          {recentTxs.length === 0 ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <ul className="tx-list">
              {recentTxs.map((tx) => (
                <RecentTxItem key={tx.id} tx={tx} state={state} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {showAddTx && <TransactionForm onClose={() => setShowAddTx(false)} />}
    </div>
  );
}

interface RecentTxItemProps {
  tx: Transaction;
  state: AppState;
}

function RecentTxItem({ tx, state }: RecentTxItemProps) {
  const { accounts, categories, settings } = state;
  const account  = accounts.find((a) => a.id === tx.accountId);
  const category = categories.find((c) => c.id === tx.categoryId);
  const isIncome   = tx.type === 'INCOME';
  const isTransfer = tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER_IN';

  return (
    <li className="tx-item">
      <span className={`tx-type-dot ${isIncome ? 'income' : isTransfer ? 'transfer' : 'expense'}`} />
      <div className="tx-info">
        <span className="tx-note">{tx.note || category?.name || tx.type}</span>
        <span className="tx-meta">{tx.date} · {account?.name}</span>
      </div>
      <span className={`tx-amount ${isIncome ? 'income' : isTransfer ? 'transfer' : 'expense'}`}>
        {isIncome ? '+' : isTransfer ? '' : '-'}
        {formatAmount(tx.amount, account?.currency ?? settings.currency)}
      </span>
    </li>
  );
}

function accountIcon(type: Account['type']): string {
  const icons: Record<Account['type'], string> = {
    CASH: '💵', BANK: '🏦', CREDIT_CARD: '💳', SAVINGS: '🏧', INVESTMENT: '📈',
  };
  return icons[type] ?? '💰';
}
