import { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatAmount } from '../utils/helpers';
import './Reports.css';

const CHART_COLORS = [
  '#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#1abc9c',
  '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#e91e63',
  '#607d8b', '#795548',
];

const PERIODS = [
  { label: 'Last 3 months',  months: 3  },
  { label: 'Last 6 months',  months: 6  },
  { label: 'Last 12 months', months: 12 },
] as const;

interface MonthlyEntry {
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryEntry {
  name: string;
  value: number;
}

export default function Reports() {
  const { state } = useApp();
  const { transactions, categories, settings } = state;
  const [periodIdx, setPeriodIdx] = useState(0);

  const months = PERIODS[periodIdx].months;

  const monthlyData = useMemo<MonthlyEntry[]>(() => {
    const now = new Date();
    const result: MonthlyEntry[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const txs   = transactions.filter((t) => t.date.startsWith(key));
      const income  = txs.filter((t) => t.type === 'INCOME').reduce((s, t)  => s + t.amount, 0);
      const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      result.push({ label, income, expense, net: income - expense });
    }
    return result;
  }, [transactions, months]);

  const expenseByCategory = useMemo<CategoryEntry[]>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    const cutoff = d.toISOString().slice(0, 10);

    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE' && t.date >= cutoff)
      .forEach((t) => {
        const cat  = categories.find((c) => c.id === t.categoryId);
        const name = cat?.name ?? 'Uncategorized';
        map[name] = (map[name] ?? 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, months]);

  const totals = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    const cutoff  = d.toISOString().slice(0, 10);
    const filtered = transactions.filter((t) => t.date >= cutoff);
    const income   = filtered.filter((t) => t.type === 'INCOME').reduce((s, t)  => s + t.amount, 0);
    const expense  = filtered.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions, months]);

  const cur = settings.currency;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Financial overview and trends</p>
        </div>
        <div className="period-tabs">
          {PERIODS.map((p, i) => (
            <button
              key={i}
              className={`period-tab${periodIdx === i ? ' active' : ''}`}
              onClick={() => setPeriodIdx(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="report-totals">
        <div className="report-total report-total--income">
          <div className="rt-label">Total Income</div>
          <div className="rt-value income">+{formatAmount(totals.income, cur)}</div>
        </div>
        <div className="report-total report-total--expense">
          <div className="rt-label">Total Expenses</div>
          <div className="rt-value expense">-{formatAmount(totals.expense, cur)}</div>
        </div>
        <div className="report-total report-total--net">
          <div className="rt-label">Net</div>
          <div className={`rt-value ${totals.net >= 0 ? 'income' : 'expense'}`}>
            {formatAmount(totals.net, cur)}
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-page">
          <div className="empty-icon">📈</div>
          <h3>No data yet</h3>
          <p>Add transactions to see reports</p>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-card">
            <h2 className="chart-title">Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => String(v)} />
                <Tooltip formatter={(v) => formatAmount(Number(v), cur)} />
                <Legend />
                <Bar dataKey="income"  fill="#2ecc71" name="Income"   radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#e74c3c" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2 className="chart-title">Net Balance Trend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatAmount(Number(v), cur)} />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', r: 4 }}
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card chart-card--wide">
            <h2 className="chart-title">Expenses by Category</h2>
            {expenseByCategory.length === 0 ? (
              <p className="empty-state">No expense data</p>
            ) : (
              <div className="pie-layout">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      dataKey="value"
                      nameKey="name"
                      label={(props: PieLabelRenderProps) => {
                        const name    = String(props.name ?? '');
                        const percent = Number(props.percent ?? 0);
                        return `${name} ${(percent * 100).toFixed(0)}%`;
                      }}
                      labelLine={false}
                    >
                      {expenseByCategory.map((_entry, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatAmount(Number(v), cur)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {expenseByCategory.map((item, idx) => (
                    <div key={idx} className="pie-legend-item">
                      <span
                        className="pie-dot"
                        style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="pie-name">{item.name}</span>
                      <span className="pie-value">{formatAmount(item.value, cur)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
