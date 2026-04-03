/**
 * Rail Sandbox API Client
 * Handles OAuth2 authentication and all API operations
 */

import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.RAIL_API_BASE_URL;
const AUTH_URL = process.env.RAIL_AUTH_URL;
const CLIENT_ID = process.env.RAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.RAIL_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Get or refresh access token using OAuth2 client credentials flow
 */
async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer before expiry)
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    // Create Basic auth header with base64 encoded client_id:client_secret
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'openid'
      }).toString()
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Auth failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    // Cache the token with expiry time
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    return cachedToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * Make authenticated request to Rail API
 */
async function railRequest(method, endpoint, body = null) {
  const token = await getAccessToken();
  const url = `${BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    // Handle empty responses
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error(`Rail API request failed: ${method} ${endpoint}`, error);
    throw error;
  }
}

// APPLICATION OPERATIONS

/**
 * Create a new application
 */
export async function createApplication(applicationData) {
  return railRequest('POST', '/applications', applicationData);
}

/**
 * Get a specific application
 */
export async function getApplication(id) {
  return railRequest('GET', `/applications/${id}`);
}

/**
 * List all applications
 */
export async function listApplications() {
  return railRequest('GET', '/applications');
}

// CUSTOMER OPERATIONS

/**
 * Get a specific customer
 */
export async function getCustomer(id) {
  return railRequest('GET', `/customers/${id}`);
}

/**
 * List all customers
 */
export async function listCustomers() {
  return railRequest('GET', '/customers');
}

// ACCOUNT OPERATIONS

/**
 * Create a new account
 */
export async function createAccount(accountData) {
  return railRequest('POST', '/accounts', accountData);
}

/**
 * Get a specific account
 */
export async function getAccount(id) {
  return railRequest('GET', `/accounts/${id}`);
}

/**
 * List accounts with optional filters
 */
export async function listAccounts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/accounts?${query}` : '/accounts';
  return railRequest('GET', endpoint);
}

// DEPOSIT OPERATIONS

/**
 * Create a new deposit
 */
export async function createDeposit(depositData) {
  return railRequest('POST', '/deposits', depositData);
}

/**
 * Get a specific deposit
 */
export async function getDeposit(id) {
  return railRequest('GET', `/deposits/${id}`);
}

// EXCHANGE OPERATIONS

/**
 * Create a new exchange
 */
export async function createExchange(exchangeData) {
  return railRequest('POST', '/exchanges', exchangeData);
}

/**
 * Accept an exchange
 */
export async function acceptExchange(id) {
  return railRequest('POST', `/exchanges/${id}/accept`, {});
}

// COUNTERPARTY OPERATIONS

/**
 * Create a new counterparty
 */
export async function createCounterparty(counterpartyData) {
  return railRequest('POST', '/counterparties', counterpartyData);
}

/**
 * List counterparties with optional filters
 */
export async function listCounterparties(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/counterparties?${query}` : '/counterparties';
  return railRequest('GET', endpoint);
}

// WITHDRAWAL OPERATIONS

/**
 * Create a new withdrawal
 */
export async function createWithdrawal(withdrawalData) {
  return railRequest('POST', '/withdrawals', withdrawalData);
}

/**
 * Accept a withdrawal
 */
export async function acceptWithdrawal(id) {
  return railRequest('POST', `/withdrawals/${id}/accept`, {});
}
