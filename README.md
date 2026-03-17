# Financisto – Personal Finance Tracker

A personal finance tracker React SPA, converted from the original [Financisto Android app](https://code.google.com/p/financisto/).

## Features

- **Dashboard** – Account overview, monthly income/expense summary, recent transactions
- **Transactions** – Full transaction ledger with filtering by type, account, category, and search
- **Accounts** – Multiple accounts (Cash, Bank, Credit Card, Savings, Investment) with multi-currency support
- **Categories** – Customizable income/expense categories with color coding
- **Budgets** – Set spending limits per category with progress tracking (weekly / monthly / yearly)
- **Reports** – Income vs Expenses bar chart, net balance trend line, expense-by-category pie chart
- **Settings** – Default currency, date format, light/dark theme, data export/import (JSON backup)

## Tech Stack

- **React 19** – UI library
- **Vite 8** – Build tool
- **React Router 7** – Client-side routing
- **Recharts** – Charts and data visualisation
- **localStorage** – Browser-local data persistence (no backend required)

## Getting Started

```bash
npm install
npm run dev       # Development server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Data Persistence

All data (accounts, transactions, categories, budgets, settings) is stored in `localStorage`.  
Use **Settings → Export Backup** to download a JSON file and **Import Backup** to restore.

## License

GPL-2.0 – see [license.txt](license.txt)
