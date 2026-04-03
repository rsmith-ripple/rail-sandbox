import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, createAccount } from '../api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    accountType: 'fiat',
    asset: 'USD',
  });

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await getCustomer(id);
      setCustomer(data);
      setError(null);
    } catch (err) {
      console.error('Error loading customer:', err);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAccount = async () => {
    try {
      setIsCreating(true);
      await createAccount({
        customerId: id,
        accountType: formData.accountType,
        asset: formData.asset,
      });
      setIsModalOpen(false);
      setFormData({ accountType: 'fiat', asset: 'USD' });
      loadCustomer();
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAccountClick = (accountId) => {
    navigate(`/accounts/${accountId}`);
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="page-content">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading customer...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="main-content">
        <div className="page-content">
          <div className="alert alert-error">Customer not found</div>
          <button className="btn btn-primary" onClick={() => navigate('/customers')}>
            ← Back to Customers
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="top-bar">
        <h1 className="page-title">
          {customer.firstName} {customer.lastName}
        </h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/customers')}
        >
          ← Back
        </button>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Customer Info Card */}
        <div className="card">
          <h2 className="card-title">Customer Information</h2>
          <div className="info-row">
            <span className="info-label">Customer ID</span>
            <span className="info-value">{customer.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{customer.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone</span>
            <span className="info-value">{customer.phone || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status</span>
            <StatusBadge status={customer.status || 'active'} />
          </div>
          <div className="info-row">
            <span className="info-label">Created</span>
            <span className="info-value">
              {customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          {customer.address && (
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value">
                {customer.address.street}, {customer.address.city},{' '}
                {customer.address.state} {customer.address.zip}
              </span>
            </div>
          )}
        </div>

        {/* Accounts Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
            Accounts ({(customer.accounts || []).length})
          </h2>
          <button
            className="btn btn-primary btn-small"
            onClick={() => setIsModalOpen(true)}
          >
            ➕ Create Account
          </button>
        </div>

        {(customer.accounts || []).length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🏦</div>
              <div className="empty-state-title">No Accounts</div>
              <p className="empty-state-text">
                Create an account to start using the platform.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                ➕ Create Account
              </button>
            </div>
          </div>
        ) : (
          <div className="accounts-grid">
            {customer.accounts.map((account) => (
              <div
                key={account.id}
                className="account-card"
                onClick={() => handleAccountClick(account.id)}
              >
                <div className="account-card-header">
                  <div>
                    <div className="account-type">{account.accountType}</div>
                    <div className="account-asset">{account.asset}</div>
                  </div>
                  <StatusBadge status={account.status || 'active'} />
                </div>
                <div className="account-balance">
                  {account.balance || '0'} {account.asset}
                </div>
                <div className="account-card-footer">
                  ID: {account.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Create Account"
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="btn-group">
            <button
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateAccount}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label>Account Type *</label>
          <select
            name="accountType"
            value={formData.accountType}
            onChange={handleInputChange}
          >
            <option value="fiat">Fiat</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div className="form-group">
          <label>Asset *</label>
          <select
            name="asset"
            value={formData.asset}
            onChange={handleInputChange}
          >
            {formData.accountType === 'fiat' ? (
              <>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </>
            ) : (
              <>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDC">USD Coin (USDC)</option>
              </>
            )}
          </select>
        </div>
      </Modal>
    </main>
  );
}
