import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccount, getAccountTransactions } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAccountData();
  }, [id]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const [accountData, transactionsData] = await Promise.all([
        getAccount(id),
        getAccountTransactions(id).catch(() => []),
      ]);
      setAccount(accountData);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setError(null);
    } catch (err) {
      console.error('Error loading account:', err);
      setError('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const params = new URLSearchParams({
      accountId: id,
      action: action,
    });

    if (account.accountType === 'fiat' && action === 'deposit') {
      navigate('/on-ramp');
    } else if (action === 'exchange') {
      navigate(`/on-ramp?accountId=${id}`);
    } else if (action === 'withdraw') {
      navigate(`/off-ramp?accountId=${id}`);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="page-content">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading account...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="main-content">
        <div className="page-content">
          <div className="alert alert-error">Account not found</div>
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
          {account.asset} {account.accountType === 'fiat' ? '(Fiat)' : '(Crypto)'}{' '}
          Account
        </h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/customers/${account.customerId}`)}
        >
          ← Back
        </button>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Account Info Card */}
        <div className="card">
          <h2 className="card-title">Account Information</h2>
          <div className="info-row">
            <span className="info-label">Account ID</span>
            <span className="info-value">{account.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Type</span>
            <span className="info-value">
              {account.accountType.charAt(0).toUpperCase() +
                account.accountType.slice(1)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Asset</span>
            <span className="info-value">{account.asset}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Balance</span>
            <span
              className="info-value"
              style={{ fontSize: '18px', color: '#4361ee' }}
            >
              {account.balance || '0'} {account.asset}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Status</span>
            <StatusBadge status={account.status || 'active'} />
          </div>
          <div className="info-row">
            <span className="info-label">Created</span>
            <span className="info-value">
              {account.createdAt
                ? new Date(account.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="btn-group">
            {account.accountType === 'fiat' && (
              <button
                className="btn btn-primary"
                onClick={() => handleQuickAction('deposit')}
              >
                ⬆️ Deposit
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => handleQuickAction('exchange')}
            >
              🔄 Exchange
            </button>
            {account.accountType === 'crypto' && (
              <button
                className="btn btn-secondary"
                onClick={() => handleQuickAction('withdraw')}
              >
                ⬇️ Withdraw
              </button>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Transaction History ({transactions.length})
        </h2>

        {transactions.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No Transactions</div>
              <p className="empty-state-text">
                No transactions on this account yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <strong>{tx.type}</strong>
                      </td>
                      <td>{tx.amount || '0'}</td>
                      <td>
                        <StatusBadge status={tx.status || 'pending'} />
                      </td>
                      <td>
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>{tx.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
