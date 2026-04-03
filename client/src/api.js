const API_BASE = '/api';

// Helper function for API requests
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Applications
export async function createApplication(data) {
  return apiCall('POST', '/applications', data);
}

export async function getApplications() {
  return apiCall('GET', '/applications');
}

export async function getApplication(id) {
  return apiCall('GET', `/applications/${id}`);
}

// Customers
export async function getCustomers() {
  return apiCall('GET', '/customers');
}

export async function getCustomer(id) {
  return apiCall('GET', `/customers/${id}`);
}

export async function getCustomerAccounts(customerId) {
  return apiCall('GET', `/customers/${customerId}/accounts`);
}

// Accounts
export async function createAccount(data) {
  return apiCall('POST', '/accounts', data);
}

export async function getAccount(id) {
  return apiCall('GET', `/accounts/${id}`);
}

export async function getAccountTransactions(accountId) {
  return apiCall('GET', `/accounts/${accountId}/transactions`);
}

// Deposits (On-Ramp)
export async function createDeposit(data) {
  return apiCall('POST', '/deposits', data);
}

export async function getDeposit(id) {
  return apiCall('GET', `/deposits/${id}`);
}

// Exchanges
export async function createExchange(data) {
  return apiCall('POST', '/exchanges', data);
}

export async function getExchange(id) {
  return apiCall('GET', `/exchanges/${id}`);
}

export async function acceptExchange(id) {
  return apiCall('POST', `/exchanges/${id}/accept`);
}

// Counterparties (for Off-Ramp)
export async function createCounterparty(data) {
  return apiCall('POST', '/counterparties', data);
}

export async function getCounterparties() {
  return apiCall('GET', '/counterparties');
}

export async function getCounterpartiesByCustomer(customerId) {
  return apiCall('GET', `/customers/${customerId}/counterparties`);
}

// Withdrawals (Off-Ramp)
export async function createWithdrawal(data) {
  return apiCall('POST', '/withdrawals', data);
}

export async function getWithdrawal(id) {
  return apiCall('GET', `/withdrawals/${id}`);
}

export async function acceptWithdrawal(id) {
  return apiCall('POST', `/withdrawals/${id}/accept`);
}
