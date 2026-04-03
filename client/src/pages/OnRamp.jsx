import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, createDeposit, createExchange, acceptExchange } from '../api';
import StepIndicator from '../components/StepIndicator';
import StatusBadge from '../components/StatusBadge';

export default function OnRamp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  const [depositId, setDepositId] = useState(null);
  const [exchangeId, setExchangeId] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Deposit
    depositCustomerId: '',
    depositAmount: '',
    depositAccountId: '',

    // Step 2: Exchange
    exchangeSourceAccountId: '',
    exchangeDestinationAccountId: '',
    exchangeAmount: '',
  });

  const steps = [
    'Select Account & Deposit',
    'Create Exchange',
    'Review & Accept',
  ];

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      depositCustomerId: e.target.value,
      depositAccountId: '',
    }));
  };

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleCreateDeposit = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await createDeposit({
        accountId: formData.depositAccountId,
        amount: parseFloat(formData.depositAmount),
      });

      setDepositId(response.id);
      handleNext();
    } catch (err) {
      setError(err.message || 'Failed to create deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExchange = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await createExchange({
        sourceAccountId: formData.exchangeSourceAccountId,
        destinationAccountId: formData.exchangeDestinationAccountId,
        amount: parseFloat(formData.exchangeAmount),
      });

      setExchangeId(response.id);
      handleNext();
    } catch (err) {
      setError(err.message || 'Failed to create exchange');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptExchange = async () => {
    try {
      setLoading(true);
      setError(null);

      await acceptExchange(exchangeId);

      setStep(steps.length + 1);
    } catch (err) {
      setError(err.message || 'Failed to accept exchange');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer =
    customers.find((c) => c.id === formData.depositCustomerId) || null;
  const fiatAccounts =
    selectedCustomer?.accounts?.filter((a) => a.accountType === 'fiat') || [];
  const cryptoAccounts =
    selectedCustomer?.accounts?.filter((a) => a.accountType === 'crypto') || [];

  return (
    <main className="main-content">
      <div className="top-bar">
        <h1 className="page-title">On-Ramp Flow</h1>
      </div>

      <div className="page-content" style={{ maxWidth: '650px', margin: '0 auto' }}>
        {/* Success State */}
        {step === steps.length + 1 ? (
          <div className="card">
            <div className="text-center">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 className="card-title">Exchange Completed</h2>
              <p style={{ color: '#666', marginBottom: '16px' }}>
                Your on-ramp flow has been completed successfully. The exchange
                has been accepted and funds are being transferred.
              </p>
              <div className="btn-group" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/customers')}
                >
                  View Customers
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <StepIndicator steps={steps} currentStep={step} />

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
              {/* Step 1: Select Account and Deposit */}
              {step === 1 && (
                <div>
                  <h2 className="card-title">Select Account & Deposit</h2>
                  <div className="form-group">
                    <label>Customer *</label>
                    {customersLoading ? (
                      <div>Loading customers...</div>
                    ) : (
                      <select
                        name="depositCustomerId"
                        value={formData.depositCustomerId}
                        onChange={handleCustomerChange}
                      >
                        <option value="">Select a customer...</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedCustomer && (
                    <>
                      <div className="form-group">
                        <label>Fiat Account (deposit destination) *</label>
                        {fiatAccounts.length === 0 ? (
                          <div style={{ color: '#a0a0a0', padding: '12px' }}>
                            No fiat accounts available. Create one first.
                          </div>
                        ) : (
                          <select
                            name="depositAccountId"
                            value={formData.depositAccountId}
                            onChange={handleInputChange}
                          >
                            <option value="">Select account...</option>
                            {fiatAccounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.asset} - Balance: {a.balance}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Deposit Amount (USD) *</label>
                        <input
                          type="number"
                          name="depositAmount"
                          value={formData.depositAmount}
                          onChange={handleInputChange}
                          placeholder="1000.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </>
                  )}

                  <p style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>
                    Enter the amount of USD you want to deposit into your fiat
                    account.
                  </p>
                </div>
              )}

              {/* Step 2: Create Exchange */}
              {step === 2 && (
                <div>
                  <h2 className="card-title">Create Exchange</h2>

                  {depositId && (
                    <div className="alert alert-success">
                      Deposit created: {depositId}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Source Account (Fiat) *</label>
                    {fiatAccounts.length === 0 ? (
                      <div style={{ color: '#a0a0a0', padding: '12px' }}>
                        No fiat accounts available.
                      </div>
                    ) : (
                      <select
                        name="exchangeSourceAccountId"
                        value={formData.exchangeSourceAccountId}
                        onChange={handleInputChange}
                      >
                        <option value="">Select source account...</option>
                        {fiatAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.asset} - Balance: {a.balance}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Destination Account (Crypto) *</label>
                    {cryptoAccounts.length === 0 ? (
                      <div style={{ color: '#a0a0a0', padding: '12px' }}>
                        No crypto accounts available. Create one first.
                      </div>
                    ) : (
                      <select
                        name="exchangeDestinationAccountId"
                        value={formData.exchangeDestinationAccountId}
                        onChange={handleInputChange}
                      >
                        <option value="">Select destination account...</option>
                        {cryptoAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.asset} - Balance: {a.balance}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Amount to Exchange (USD) *</label>
                    <input
                      type="number"
                      name="exchangeAmount"
                      value={formData.exchangeAmount}
                      onChange={handleInputChange}
                      placeholder="500.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <p style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>
                    Specify how much of your fiat currency you want to exchange for
                    crypto.
                  </p>
                </div>
              )}

              {/* Step 3: Review & Accept */}
              {step === 3 && (
                <div>
                  <h2 className="card-title">Review Exchange</h2>

                  {exchangeId && (
                    <div className="alert alert-info">
                      Exchange created: {exchangeId}
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1a1a2e', marginBottom: '12px' }}>
                      Exchange Details
                    </h4>
                    <div className="info-row">
                      <span className="info-label">Source Account</span>
                      <span className="info-value">
                        {fiatAccounts.find(
                          (a) => a.id === formData.exchangeSourceAccountId
                        )?.asset || 'N/A'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Amount</span>
                      <span className="info-value">
                        {formData.exchangeAmount || '0'} USD
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Destination Account</span>
                      <span className="info-value">
                        {cryptoAccounts.find(
                          (a) => a.id === formData.exchangeDestinationAccountId
                        )?.asset || 'N/A'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status</span>
                      <StatusBadge status="pending" />
                    </div>
                  </div>

                  <p style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>
                    Review the exchange details above and accept to complete the
                    on-ramp flow.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="btn-group" style={{ marginTop: '32px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handlePrev}
                  disabled={step === 1}
                  style={{ opacity: step === 1 ? 0.5 : 1 }}
                >
                  ← Previous
                </button>

                {step === 1 && (
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateDeposit}
                    disabled={!formData.depositAccountId || !formData.depositAmount || loading}
                  >
                    {loading ? 'Creating Deposit...' : 'Create Deposit →'}
                  </button>
                )}

                {step === 2 && (
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateExchange}
                    disabled={
                      !formData.exchangeSourceAccountId ||
                      !formData.exchangeDestinationAccountId ||
                      !formData.exchangeAmount ||
                      loading
                    }
                  >
                    {loading ? 'Creating Exchange...' : 'Create Exchange →'}
                  </button>
                )}

                {step === 3 && (
                  <button
                    className="btn btn-success"
                    onClick={handleAcceptExchange}
                    disabled={loading}
                  >
                    {loading ? 'Accepting...' : '✓ Accept Exchange'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
