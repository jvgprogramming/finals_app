import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { UsersIcon } from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  icon: any;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Users',
    icon: <UsersIcon style={{ width: 18, height: 18 }} aria-hidden />,
    to: '/',
  },
];

const AppSidebar: FC = () => {
  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">A</div>
        <div>
          <p className="sidebar-brand-text">Admin Hub</p>
          <span className="sidebar-brand-sub">Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main Menu</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          style={{
            padding: '0 2px 14px',
            color: 'var(--color-cocoa)',
            fontSize: 12,
          }}
        >
          Frontend only preview mode
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
