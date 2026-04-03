import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCustomers,
  createExchange,
  acceptExchange,
  createCounterparty,
  createWithdrawal,
  acceptWithdrawal,
  getCounterpartiesByCustomer,
} from '../api';
import StepIndicator from '../components/StepIndicator';
import StatusBadge from '../components/StatusBadge';

export default function OffRamp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [counterparties, setCounterparties] = useState([]);

  const [exchangeId, setExchangeId] = useState(null);
  const [counterpartyId, setCounterpartyId] = useState(null);
  const [withdrawalId, setWithdrawalId] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Exchange (Crypto to Fiat)
    exchangeCustomerId: '',
    exchangeSourceAccountId: '',
    exchangeDestinationAccountId: '',
    exchangeAmount: '',

    // Step 3: Counterparty
    counterpartyType: 'bank_account',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    blockchainAddress: '',

    // Step 4: Withdrawal
    withdrawalSourceAccountId: '',
    withdrawalCounterpartyId: '',
    withdrawalAmount: '',
  });

  const steps = [
    'Create Exchange',
    'Accept Exchange',
    'Add Counterparty',
    'Create Withdrawal',
    'Accept Withdrawal',
  ];

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (formData.exchangeCustomerId) {
      loadCounterparties(formData.exchangeCustomerId);
    }
  }, [formData.exchangeCustomerId]);

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

  const loadCounterparties = async (customerId) => {
    try {
      const data = await getCounterpartiesByCustomer(customerId);
      setCounterparties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading counterparties:', err);
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
      exchangeCustomerId: e.target.value,
      exchangeSourceAccountId: '',
      exchangeDestinationAccountId: '',
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
      handleNext();
    } catch (err) {
      setError(err.message || 'Failed to accept exchange');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCounterparty = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        customerId: formData.exchangeCustomerId,
        type: formData.counterpartyType,
      };

      if (formData.counterpartyType === 'bank_account') {
        payload.bankName = formData.bankName;
        payload.accountNumber = formData.accountNumber;
        payload.routingNumber = formData.routingNumber;
      } else {
        payload.blockchainAddress = formData.blockchainAddress;
      }

      const response = await createCounterparty(payload);
      setCounterpartyId(response.id);
      handleNext();
    } catch (err) {
      setError(err.message || 'Failed to create counterparty');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithdrawal = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await createWithdrawal({
        accountId: formData.withdrawalSourceAccountId,
        counterpartyId:
          formData.withdrawalCounterpartyId || counterpartyId,
        amount: parseFloat(formData.withdrawalAmount),
      });

      setWithdrawalId(response.id);
      handleNext();
    } catch (err) {
      setError(err.message || 'Failed to create withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWithdrawal = async () => {
    try {
      setLoading(true);
      setError(null);

      await acceptWithdrawal(withdrawalId);
      setStep(steps.length + 1);
    } catch (err) {
      setError(err.message || 'Failed to accept withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer =
    customers.find((c) => c.id === formData.exchangeCustomerId) || null;
  const cryptoAccounts =
    selectedCustomer?.accounts?.filter((a) => a.accountType === 'crypto') || [];
  const fiatAccounts =
    selectedCustomer?.accounts?.filter((a) => a.accountType === 'fiat') || [];

  return (
    <main className="main-content">
      <div className="top-bar">
        <h1 className="page-title">Off-Ramp Flow</h1>
      </div>

      <div className="page-content" style={{ maxWidth: '650px', margin: '0 auto' }}>
        {/* Success State */}
        {step === steps.length + 1 ? (
          <div className="card">
            <div className="text-center">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 className="card-title">Off-Ramp Completed</h2>
              <p style={{ color: '#666', marginBottom: '16px' }}>
                Your off-ramp flow has been completed successfully. The withdrawal
                has been accepted and funds are being processed.
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
              {/* Step 1: Create Exchange */}
              {step === 1 && (
                <div>
                  <h2 className="card-title">Create Exchange (Crypto to Fiat)</h2>

                  <div className="form-group">
                    <label>Customer *</label>
                    {customersLoading ? (
                      <div>Loading customers...</div>
                    ) : (
                      <select
                        name="exchangeCustomerId"
                        value={formData.exchangeCustomerId}
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
                        <label>Crypto Account (source) *</label>
                        {cryptoAccounts.length === 0 ? (
                          <div style={{ color: '#a0a0a0', padding: '12px' }}>
                            No crypto accounts available.
                          </div>
                        ) : (
                          <select
                            name="exchangeSourceAccountId"
                            value={formData.exchangeSourceAccountId}
                            onChange={handleInputChange}
                          >
                            <option value="">Select account...</option>
                            {cryptoAccounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.asset} - Balance: {a.balance}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Fiat Account (destination) *</label>
                        {fiatAccounts.length === 0 ? (
                          <div style={{ color: '#a0a0a0', padding: '12px' }}>
                            No fiat accounts available.
                          </div>
                        ) : (
                          <select
                            name="exchangeDestinationAccountId"
                            value={formData.exchangeDestinationAccountId}
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
                        <label>Amount to Exchange *</label>
                        <input
                          type="number"
                          name="exchangeAmount"
                          value={formData.exchangeAmount}
                          onChange={handleInputChange}
                          placeholder="0.5"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Accept Exchange */}
              {step === 2 && (
                <div>
                  <h2 className="card-title">Accept Exchange</h2>

                  {exchangeId && (
                    <div className="alert alert-success">
                      Exchange created: {exchangeId}
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1a1a2e', marginBottom: '12px' }}>
                      Exchange Summary
                    </h4>
                    <div className="info-row">
                      <span className="info-label">From</span>
                      <span className="info-value">
                        {cryptoAccounts.find(
                          (a) => a.id === formData.exchangeSourceAccountId
                        )?.asset || 'N/A'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Amount</span>
                      <span className="info-value">{formData.exchangeAmount}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">To</span>
                      <span className="info-value">
                        {fiatAccounts.find(
                          (a) => a.id === formData.exchangeDestinationAccountId
                        )?.asset || 'N/A'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status</span>
                      <StatusBadge status="pending" />
                    </div>
                  </div>

                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Accept the exchange to proceed with the off-ramp flow.
                  </p>
                </div>
              )}

              {/* Step 3: Add Counterparty */}
              {step === 3 && (
                <div>
                  <h2 className="card-title">Withdrawal Destination</h2>

                  <div className="form-group">
                    <label>Destination Type *</label>
                    <select
                      name="counterpartyType"
                      value={formData.counterpartyType}
                      onChange={handleInputChange}
                    >
                      <option value="bank_account">Bank Account</option>
                      <option value="blockchain_address">
                        Blockchain Address
                      </option>
                    </select>
                  </div>

                  {formData.counterpartyType === 'bank_account' ? (
                    <>
                      <div className="form-group">
                        <label>Bank Name *</label>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          placeholder="Chase Bank"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Account Number *</label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            placeholder="1234567890"
                          />
                        </div>
                        <div className="form-group">
                          <label>Routing Number *</label>
                          <input
                            type="text"
                            name="routingNumber"
                            value={formData.routingNumber}
                            onChange={handleInputChange}
                            placeholder="021000021"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label>Blockchain Address *</label>
                      <input
                        type="text"
                        name="blockchainAddress"
                        value={formData.blockchainAddress}
                        onChange={handleInputChange}
                        placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Create Withdrawal */}
              {step === 4 && (
                <div>
                  <h2 className="card-title">Create Withdrawal</h2>

                  {counterpartyId && (
                    <div className="alert alert-success">
                      Counterparty created: {counterpartyId}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Fiat Account (source) *</label>
                    {fiatAccounts.length === 0 ? (
                      <div style={{ color: '#a0a0a0', padding: '12px' }}>
                        No fiat accounts available.
                      </div>
                    ) : (
                      <select
                        name="withdrawalSourceAccountId"
                        value={formData.withdrawalSourceAccountId}
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

                  {!counterpartyId && counterparties.length > 0 && (
                    <div className="form-group">
                      <label>Or Select Existing Counterparty</label>
                      <select
                        name="withdrawalCounterpartyId"
                        value={formData.withdrawalCounterpartyId}
                        onChange={handleInputChange}
                      >
                        <option value="">Select counterparty...</option>
                        {counterparties.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.type === 'bank_account'
                              ? `${c.bankName} (****${c.accountNumber.slice(-4)})`
                              : `Address (${c.blockchainAddress.slice(0, 10)}...)`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Withdrawal Amount (USD) *</label>
                    <input
                      type="number"
                      name="withdrawalAmount"
                      value={formData.withdrawalAmount}
                      onChange={handleInputChange}
                      placeholder="1000.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Accept Withdrawal */}
              {step === 5 && (
                <div>
                  <h2 className="card-title">Accept Withdrawal</h2>

                  {withdrawalId && (
                    <div className="alert alert-success">
                      Withdrawal created: {withdrawalId}
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1a1a2e', marginBottom: '12px' }}>
                      Withdrawal Summary
                    </h4>
                    <div className="info-row">
                      <span className="info-label">Amount</span>
                      <span className="info-value">
                        {formData.withdrawalAmount} USD
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">From Account</span>
                      <span className="info-value">
                        {fiatAccounts.find(
                          (a) => a.id === formData.withdrawalSourceAccountId
                        )?.asset || 'N/A'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status</span>
                      <StatusBadge status="pending" />
                    </div>
                  </div>

                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Accept the withdrawal to complete the off-ramp flow. Funds will
                    be transferred to your designated account.
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
                    onClick={handleCreateExchange}
                    disabled={
                      !formData.exchangeSourceAccountId ||
                      !formData.exchangeDestinationAccountId ||
                      !formData.exchangeAmount ||
                      loading
                    }
                  >
                    {loading ? 'Creating...' : 'Create Exchange →'}
                  </button>
                )}

                {step === 2 && (
                  <button
                    className="btn btn-primary"
                    onClick={handleAcceptExchange}
                    disabled={loading}
                  >
                    {loading ? 'Accepting...' : 'Accept Exchange →'}
                  </button>
                )}

                {step === 3 && (
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateCounterparty}
                    disabled={
                      !formData.bankName ||
                      !formData.accountNumber ||
                      !formData.routingNumber ||
                      (formData.counterpartyType === 'blockchain_address' &&
                        !formData.blockchainAddress) ||
                      loading
                    }
                  >
                    {loading ? 'Creating...' : 'Add Counterparty →'}
                  </button>
                )}

                {step === 4 && (
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateWithdrawal}
                    disabled={
                      !formData.withdrawalSourceAccountId ||
                      !formData.withdrawalAmount ||
                      loading
                    }
                  >
                    {loading ? 'Creating...' : 'Create Withdrawal →'}
                  </button>
                )}

                {step === 5 && (
                  <button
                    className="btn btn-success"
                    onClick={handleAcceptWithdrawal}
                    disabled={loading}
                  >
                    {loading ? 'Accepting...' : '✓ Accept Withdrawal'}
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
