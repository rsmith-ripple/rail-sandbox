import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">💳 Rail Sandbox</div>
      </div>

      <nav>
        <ul className="sidebar-nav">
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/onboarding"
              className={`nav-link ${isActive('/onboarding') ? 'active' : ''}`}
            >
              <span className="nav-icon">📋</span>
              <span>Onboarding</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/customers"
              className={`nav-link ${isActive('/customers') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              <span>Customers</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/on-ramp"
              className={`nav-link ${isActive('/on-ramp') ? 'active' : ''}`}
            >
              <span className="nav-icon">⬆️</span>
              <span>On-Ramp</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/off-ramp"
              className={`nav-link ${isActive('/off-ramp') ? 'active' : ''}`}
            >
              <span className="nav-icon">⬇️</span>
              <span>Off-Ramp</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
