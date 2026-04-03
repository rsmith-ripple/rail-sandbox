import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, getCustomers } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    applications: 0,
    customers: 0,
    accounts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [appsResponse, customersResponse] = await Promise.all([
          getApplications(),
          getCustomers(),
        ]);

        const apps = Array.isArray(appsResponse) ? appsResponse : [];
        const customers = Array.isArray(customersResponse)
          ? customersResponse
          : [];

        setStats({
          applications: apps.length,
          customers: customers.length,
          accounts: customers.reduce(
            (sum, c) => sum + (c.accounts?.length || 0),
            0
          ),
        });
        setError(null);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <main className="main-content">
      <div className="top-bar">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h2 className="card-title">Welcome to Rail Sandbox</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Rail Sandbox is a training platform for understanding crypto on-ramp
            and off-ramp flows. Navigate through the complete customer lifecycle:
            from onboarding through deposits, exchanges, and withdrawals.
          </p>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Quick Stats
        </h3>
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading statistics...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.applications}</div>
              <div className="stat-label">Applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.customers}</div>
              <div className="stat-label">Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.accounts}</div>
              <div className="stat-label">Accounts</div>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/onboarding')}
            >
              ➕ New Application
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/customers')}
            >
              👥 View Customers
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/on-ramp')}>
              ⬆️ On-Ramp Flow
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/off-ramp')}>
              ⬇️ Off-Ramp Flow
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">📖 How Rail Sandbox Works</h3>
          <div style={{ lineHeight: '1.8', color: '#666' }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>1. Onboarding:</strong> Create a new application for a
              customer (individual or business).
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>2. Customers & Accounts:</strong> View customers and their
              associated accounts (fiat and crypto).
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>3. On-Ramp:</strong> Deposit fiat currency and exchange it
              for cryptocurrency.
            </p>
            <p>
              <strong>4. Off-Ramp:</strong> Exchange cryptocurrency back to fiat
              and withdraw to a bank account.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
