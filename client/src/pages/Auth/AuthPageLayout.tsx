import type { FC, ReactNode } from 'react';

interface AuthPageLayoutProps {
  children: ReactNode;
}

const AuthPageLayout: FC<AuthPageLayoutProps> = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-hero">
          <div className="auth-hero-glow auth-hero-glow-one" />
          <div className="auth-hero-glow auth-hero-glow-two" />
          <div className="auth-hero-content">
            <p className="auth-eyebrow">Nikays Pastry</p>
            <h1 className="auth-hero-title">
              A warmer way to manage your bakery operations.
            </h1>
            <p className="auth-hero-copy">
              Sign in once and the app sends you to the right workspace for your
              account, whether you are managing users or browsing as a customer.
            </p>
          </div>
          <div className="auth-hero-grid">
            <div className="auth-hero-card">
              <span className="auth-hero-card-label">Inventory</span>
              <strong>Menu availability</strong>
            </div>
            <div className="auth-hero-card">
              <span className="auth-hero-card-label">Users</span>
              <strong>Fast account routing</strong>
            </div>
            <div className="auth-hero-card">
              <span className="auth-hero-card-label">Orders</span>
              <strong>Clean daily tracking</strong>
            </div>
          </div>
        </aside>
        <main className="auth-panel">{children}</main>
      </div>
    </div>
  );
};

export default AuthPageLayout;
