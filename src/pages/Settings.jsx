import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../utils/helpers';
import './Settings.css';

const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

export default function Settings() {
  const { state, dispatch } = useApp();
  const { settings } = state;
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...settings });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', payload: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    const data = {
      accounts: JSON.parse(localStorage.getItem('financisto_accounts') || '[]'),
      transactions: JSON.parse(localStorage.getItem('financisto_transactions') || '[]'),
      categories: JSON.parse(localStorage.getItem('financisto_categories') || '[]'),
      budgets: JSON.parse(localStorage.getItem('financisto_budgets') || '[]'),
      settings: JSON.parse(localStorage.getItem('financisto_settings') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financisto-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.accounts)     localStorage.setItem('financisto_accounts',     JSON.stringify(data.accounts));
        if (data.transactions) localStorage.setItem('financisto_transactions', JSON.stringify(data.transactions));
        if (data.categories)   localStorage.setItem('financisto_categories',   JSON.stringify(data.categories));
        if (data.budgets)      localStorage.setItem('financisto_budgets',      JSON.stringify(data.budgets));
        if (data.settings)     localStorage.setItem('financisto_settings',     JSON.stringify(data.settings));
        window.location.reload();
      } catch {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (window.confirm('Clear ALL data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">App preferences and data management</p>
        </div>
      </div>

      <div className="settings-sections">
        {/* Preferences */}
        <section className="settings-section">
          <h2>Preferences</h2>
          <form onSubmit={handleSave} className="form">
            <div className="form-group">
              <label className="form-label">Default Currency</label>
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
            <div className="form-group">
              <label className="form-label">Date Format</label>
              <select
                className="form-control"
                value={form.dateFormat}
                onChange={(e) => set('dateFormat', e.target.value)}
              >
                {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Theme</label>
              <div className="type-tabs">
                {['light', 'dark'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`type-tab${form.theme === t ? ' active' : ''}`}
                    onClick={() => set('theme', t)}
                  >
                    {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Save Preferences</button>
              {saved && <span className="saved-badge">✔ Saved!</span>}
            </div>
          </form>
        </section>

        {/* Data Management */}
        <section className="settings-section">
          <h2>Data Management</h2>
          <div className="data-actions">
            <div className="data-action">
              <div>
                <div className="da-title">Export Data</div>
                <div className="da-desc">Download all your data as a JSON backup file</div>
              </div>
              <button className="btn btn-outline" onClick={handleExport}>
                ⬇ Export Backup
              </button>
            </div>
            <div className="data-action">
              <div>
                <div className="da-title">Import Data</div>
                <div className="da-desc">Restore data from a previously exported backup</div>
              </div>
              <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                ⬆ Import Backup
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
            <div className="data-action data-action--danger">
              <div>
                <div className="da-title">Reset All Data</div>
                <div className="da-desc danger">Permanently delete all accounts, transactions, and settings</div>
              </div>
              <button className="btn btn-danger" onClick={handleReset}>
                🗑 Reset Data
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="settings-section">
          <h2>About</h2>
          <div className="about-card">
            <span className="about-logo">💰</span>
            <div>
              <div className="about-name">Financisto Web</div>
              <div className="about-desc">
                A personal finance tracker converted from the original Android app to a React SPA.
                Your data is stored locally in your browser.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
