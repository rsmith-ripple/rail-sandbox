import express from 'express';
import {
  createAccount as createAccountRail,
  getAccount as getAccountRail,
  listAccounts as listAccountsRail
} from '../railApi.js';
import {
  saveAccount,
  getAccountByRailId,
  getAllAccounts,
  getAccountsByCustomerId
} from '../db.js';

const router = express.Router();

/**
 * POST /api/accounts
 * Create a new account via Rail API
 * Body: { customer_id, account_type, asset_type, label }
 */
router.post('/', async (req, res) => {
  try {
    const { customer_id, account_type, asset_type, label } = req.body;

    // Validate required fields
    if (!customer_id || !account_type || !asset_type) {
      return res.status(400).json({
        error: 'Missing required fields: customer_id, account_type, asset_type'
      });
    }

    // Create account via Rail API
    const railResponse = await createAccountRail({
      customer_id,
      account_type,
      asset_type,
      label: label || `${asset_type} Account`
    });

    // Save to local database
    const dbRecord = {
      id: railResponse.id,
      customer_id: railResponse.customer_id,
      account_type: railResponse.account_type,
      asset_type: railResponse.asset_type,
      label: railResponse.label,
      status: railResponse.status || 'ACTIVE'
    };

    saveAccount(dbRecord);

    res.status(201).json({
      message: 'Account created successfully',
      rail: railResponse,
      local: dbRecord
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      error: 'Failed to create account',
      details: error.message
    });
  }
});

/**
 * GET /api/accounts
 * List all accounts, optionally filtered by customer_id query param
 */
router.get('/', async (req, res) => {
  try {
    const { customer_id } = req.query;

    let accounts;

    if (customer_id) {
      // Get accounts for specific customer
      accounts = getAccountsByCustomerId(customer_id);
    } else {
      // Get all accounts
      accounts = getAllAccounts();
    }

    res.json({
      count: accounts.length,
      customer_id: customer_id || null,
      accounts
    });
  } catch (error) {
    console.error('Error listing accounts:', error);
    res.status(500).json({
      error: 'Failed to list accounts',
      details: error.message
    });
  }
});

/**
 * GET /api/accounts/:id
 * Get account details from Rail API and update local database
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch from Rail API
    const railResponse = await getAccountRail(id);

    // Save to local database
    const dbRecord = {
      id: railResponse.id,
      customer_id: railResponse.customer_id,
      account_type: railResponse.account_type,
      asset_type: railResponse.asset_type,
      label: railResponse.label,
      status: railResponse.status
    };

    saveAccount(dbRecord);

    // Get from local database
    const localAccount = getAccountByRailId(id);

    res.json({
      message: 'Account retrieved and synced',
      rail: railResponse,
      local: localAccount
    });
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({
      error: 'Failed to get account',
      details: error.message
    });
  }
});

export default router;
