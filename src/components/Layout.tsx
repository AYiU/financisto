import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { to: '/',             label: 'Dashboard',   icon: '🏠' },
  { to: '/transactions', label: 'Transactions', icon: '💳' },
  { to: '/accounts',     label: 'Accounts',     icon: '🏦' },
  { to: '/categories',   label: 'Categories',   icon: '🏷️' },
  { to: '/budgets',      label: 'Budgets',      icon: '📊' },
  { to: '/reports',      label: 'Reports',      icon: '📈' },
  { to: '/settings',     label: 'Settings',     icon: '⚙️' },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">💰</span>
          <span className="logo-text">Financisto</span>
        </div>
        <ul className="nav-list">
          {navItems.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' nav-item--active' : ''}`
                }
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
