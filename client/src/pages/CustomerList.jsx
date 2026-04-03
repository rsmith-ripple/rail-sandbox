import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCustomers();
  };

  const handleRowClick = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  return (
    <main className="main-content">
      <div className="top-bar">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={handleRefresh}>
          🔄 Refresh
        </button>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No Customers Yet</div>
              <p className="empty-state-text">
                Start by onboarding a new application to create customers.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/onboarding')}
              >
                ➕ New Application
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Accounts</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>
                          {customer.firstName} {customer.lastName}
                        </strong>
                      </td>
                      <td>{customer.email}</td>
                      <td>
                        <StatusBadge status={customer.status || 'active'} />
                      </td>
                      <td>{(customer.accounts || []).length}</td>
                      <td style={{ fontSize: '12px', color: '#a0a0a0' }}>
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        <button
                          className="table-action-btn"
                          onClick={() => handleRowClick(customer.id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
