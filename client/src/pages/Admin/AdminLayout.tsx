import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Optional layout wrapper for future nested admin routes.
 * AdminApp currently implements the full dashboard inline.
 */
export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="app-container">
      <header
        className="glass-header"
        style={{ borderBottomColor: 'var(--secondary)' }}
      >
        <div className="container header-inner">
          <NavLink
            to="/admin"
            className="logo-link"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="logo-icon"
              style={{
                backgroundColor: 'var(--secondary-light)',
                color: 'var(--secondary)',
                borderColor: 'var(--secondary)',
              }}
            >
              A
            </div>
            <div>
              <h1 className="logo-text">Nikay&apos;s Admin</h1>
              <span
                className="logo-subtitle"
                style={{ color: 'var(--secondary)' }}
              >
                Bakery Control Hub
              </span>
            </div>
          </NavLink>

          <nav className="nav-actions">
            <NavLink to="/admin" className="nav-link" end>
              Dashboard
            </NavLink>
            <NavLink to="/admin/orders" className="nav-link">
              Order Queue
            </NavLink>
            <NavLink to="/admin/products" className="nav-link">
              Stock Editor
            </NavLink>
            <button type="button" className="nav-link" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
