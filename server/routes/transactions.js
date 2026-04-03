import express from 'express';
import {
  createDeposit as createDepositRail,
  getDeposit as getDepositRail,
  createExchange as createExchangeRail,
  acceptExchange as acceptExchangeRail,
  createCounterparty as createCounterpartyRail,
  listCounterparties as listCounterpartiesRail,
  createWithdrawal as createWithdrawalRail,
  acceptWithdrawal as acceptWithdrawalRail
} from '../railApi.js';
import {
  saveTransaction,
  getTransactionByRailId,
  getTransactionsByAccountId,
  getAllTransactions
} from '../db.js';

const router = express.Router();

// ============================================================================
// DEPOSIT ROUTES
// ============================================================================

/**
 * POST /api/transactions/deposits
 * Create a new deposit
 * Body: { account_id, amount, asset_type }
 */
router.post('/deposits', async (req, res) => {
  try {
    const { account_id, amount, asset_type } = req.body;

    // Validate required fields
    if (!account_id || !amount || !asset_type) {
      return res.status(400).json({
        error: 'Missing required fields: account_id, amount, asset_type'
      });
    }

    // Create deposit via Rail API
    const railResponse = await createDepositRail({
      account_id,
      amount,
      asset_type
    });

    // Save to local database
    const dbRecord = {
      id: railResponse.id,
      account_id: railResponse.account_id,
      type: 'DEPOSIT',
      amount: railResponse.amount,
      asset_type: railResponse.asset_type,
      status: railResponse.status || 'PENDING'
    };

    saveTransaction(dbRecord);

    res.status(201).json({
      message: 'Deposit created successfully',
      rail: railResponse,
      local: dbRecord
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({
      error: 'Failed to create deposit',
      details: error.message
    });
  }
});

/**
 * GET /api/transactions/deposits/:id
 * Get deposit details
 */
router.get('/deposits/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch from Rail API
    const railResponse = await getDepositRail(id);

    res.json({
      rail: railResponse
    });
  } catch (error) {
    console.error('Error getting deposit:', error);
    res.status(500).json({
      error: 'Failed to get deposit',
      details: error.message
    });
  }
});

// ============================================================================
// EXCHANGE ROUTES
// ============================================================================

/**
 * POST /api/transactions/exchanges
 * Create a new exchange
 * Body: { account_id, counterparty_id, from_amount, from_asset_type, to_asset_type }
 */
router.post('/exchanges', async (req, res) => {
  try {
    const {
      account_id,
      counterparty_id,
      from_amount,
      from_asset_type,
      to_asset_type
    } = req.body;

    // Validate required fields
    if (!account_id || !counterparty_id || !from_amount || !from_asset_type || !to_asset_type) {
      return res.status(400).json({
        error: 'Missing required fields: account_id, counterparty_id, from_amount, from_asset_type, to_asset_type'
      });
    }

    // Create exchange via Rail API
    const railResponse = await createExchangeRail({
      account_id,
      counterparty_id,
      from_amount,
      from_asset_type,
      to_asset_type
    });

    // Save to local database
    const dbRecord = {
      id: railResponse.id,
      account_id: railResponse.account_id,
      type: 'EXCHANGE',
      amount: railResponse.from_amount,
      asset_type: railResponse.from_asset_type,
      status: railResponse.status || 'PENDING'
    };

    saveTransaction(dbRecord);

    res.status(201).json({
      message: 'Exchange created successfully',
      rail: railResponse,
      local: dbRecord
    });
  } catch (error) {
    console.error('Error creating exchange:', error);
    res.status(500).json({
      error: 'Failed to create exchange',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/exchanges/:id/accept
 * Accept an exchange
 */
router.post('/exchanges/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;

    // Accept exchange via Rail API
    const railResponse = await acceptExchangeRail(id);

    // Update local database
    const transaction = getTransactionByRailId(id);
    if (transaction) {
      const updated = {
        ...transaction,
        status: 'ACCEPTED'
      };
      saveTransaction(updated);
    }

    res.json({
      message: 'Exchange accepted successfully',
      rail: railResponse
    });
  } catch (error) {
    console.error('Error accepting exchange:', error);
    res.status(500).json({
      error: 'Failed to accept exchange',
      details: error.message
    });
  }
});

// ============================================================================
// COUNTERPARTY ROUTES
// ============================================================================

/**
 * POST /api/transactions/counterparties
 * Create a new counterparty
 * Body: { name, email, counterparty_type }
 */
router.post('/counterparties', async (req, res) => {
  try {
    const { name, email, counterparty_type } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        error: 'Missing required fields: name, email'
      });
    }

    // Create counterparty via Rail API
    const railResponse = await createCounterpartyRail({
      name,
      email,
      counterparty_type: counterparty_type || 'INDIVIDUAL'
    });

    res.status(201).json({
      message: 'Counterparty created successfully',
      rail: railResponse
    });
  } catch (error) {
    console.error('Error creating counterparty:', error);
    res.status(500).json({
      error: 'Failed to create counterparty',
      details: error.message
    });
  }
});

/**
 * GET /api/transactions/counterparties
 * List all counterparties
 */
router.get('/counterparties', async (req, res) => {
  try {
    const railResponse = await listCounterpartiesRail();
    const counterparties = Array.isArray(railResponse) ? railResponse : railResponse.data || [];

    res.json({
      count: counterparties.length,
      counterparties
    });
  } catch (error) {
    console.error('Error listing counterparties:', error);
    res.status(500).json({
      error: 'Failed to list counterparties',
      details: error.message
    });
  }
});

// ============================================================================
// WITHDRAWAL ROUTES
// ============================================================================

/**
 * POST /api/transactions/withdrawals
 * Create a new withdrawal
 * Body: { account_id, amount, asset_type, destination }
 */
router.post('/withdrawals', async (req, res) => {
  try {
    const { account_id, amount, asset_type, destination } = req.body;

    // Validate required fields
    if (!account_id || !amount || !asset_type) {
      return res.status(400).json({
        error: 'Missing required fields: account_id, amount, asset_type'
      });
    }

    // Create withdrawal via Rail API
    const railResponse = await createWithdrawalRail({
      account_id,
      amount,
      asset_type,
      destination: destination || {}
    });

    // Save to local database
    const dbRecord = {
      id: railResponse.id,
      account_id: railResponse.account_id,
      type: 'WITHDRAWAL',
      amount: railResponse.amount,
      asset_type: railResponse.asset_type,
      status: railResponse.status || 'PENDING'
    };

    saveTransaction(dbRecord);

    res.status(201).json({
      message: 'Withdrawal created successfully',
      rail: railResponse,
      local: dbRecord
    });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    res.status(500).json({
      error: 'Failed to create withdrawal',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/withdrawals/:id/accept
 * Accept a withdrawal
 */
router.post('/withdrawals/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;

    // Accept withdrawal via Rail API
    const railResponse = await acceptWithdrawalRail(id);

    // Update local database
    const transaction = getTransactionByRailId(id);
    if (transaction) {
      const updated = {
        ...transaction,
        status: 'ACCEPTED'
      };
      saveTransaction(updated);
    }

    res.json({
      message: 'Withdrawal accepted successfully',
      rail: railResponse
    });
  } catch (error) {
    console.error('Error accepting withdrawal:', error);
    res.status(500).json({
      error: 'Failed to accept withdrawal',
      details: error.message
    });
  }
});

export default router;
