import { NavLink } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/transactions', label: 'Transactions', icon: '💳' },
  { to: '/accounts', label: 'Accounts', icon: '🏦' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
  { to: '/budgets', label: 'Budgets', icon: '📊' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout({ children }) {
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
