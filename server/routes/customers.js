import express from 'express';
import {
  getCustomer as getCustomerRail,
  listCustomers as listCustomersRail,
  listAccounts as listAccountsRail
} from '../railApi.js';
import {
  saveCustomer,
  getCustomerByRailId,
  getAllCustomers,
  getAccountsByCustomerId
} from '../db.js';

const router = express.Router();

/**
 * GET /api/customers
 * Fetch customers from Rail API and sync to local database
 */
router.get('/', async (req, res) => {
  try {
    // Fetch from Rail API
    const railResponse = await listCustomersRail();
    const customers = Array.isArray(railResponse) ? railResponse : railResponse.data || [];

    // Sync each customer to local database
    customers.forEach(customer => {
      saveCustomer({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status
      });
    });

    // Get updated list from local database
    const localCustomers = getAllCustomers();

    res.json({
      count: localCustomers.length,
      synced: customers.length,
      customers: localCustomers
    });
  } catch (error) {
    console.error('Error listing customers:', error);
    res.status(500).json({
      error: 'Failed to list customers',
      details: error.message
    });
  }
});

/**
 * GET /api/customers/:id
 * Get customer from Rail API and sync to database
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch from Rail API
    const railResponse = await getCustomerRail(id);

    // Save to local database
    saveCustomer({
      id: railResponse.id,
      name: railResponse.name,
      email: railResponse.email,
      status: railResponse.status
    });

    // Get from local database
    const localCustomer = getCustomerByRailId(id);

    res.json({
      message: 'Customer retrieved and synced',
      rail: railResponse,
      local: localCustomer
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({
      error: 'Failed to get customer',
      details: error.message
    });
  }
});

/**
 * GET /api/customers/:id/accounts
 * Get accounts for a specific customer from Rail API
 */
router.get('/:id/accounts', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch accounts from Rail API, filtered by customer
    const railResponse = await listAccountsRail({ customer_id: id });
    const accounts = Array.isArray(railResponse) ? railResponse : railResponse.data || [];

    // Get local accounts if any
    const localAccounts = getAccountsByCustomerId(id);

    res.json({
      customer_id: id,
      count: localAccounts.length,
      accounts: localAccounts,
      railTotal: accounts.length
    });
  } catch (error) {
    console.error('Error getting customer accounts:', error);
    res.status(500).json({
      error: 'Failed to get customer accounts',
      details: error.message
    });
  }
});

export default router;
