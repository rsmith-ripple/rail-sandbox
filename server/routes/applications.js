import express from 'express';
import {
  createApplication as createApplicationRail,
  getApplication as getApplicationRail,
  listApplications as listApplicationsRail
} from '../railApi.js';
import {
  saveApplication,
  getApplicationByRailId,
  getAllApplications
} from '../db.js';

const router = express.Router();

/**
 * POST /api/applications
 * Create a new application submission
 * Body: { customer_type, first_name, last_name, email, phone, date_of_birth, tax_id, address }
 */
router.post('/', async (req, res) => {
  try {
    const {
      customer_type,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      tax_id,
      address
    } = req.body;

    // Validate required fields
    if (!customer_type || !first_name || !last_name || !email) {
      return res.status(400).json({
        error: 'Missing required fields: customer_type, first_name, last_name, email'
      });
    }

    // Build Rail API payload
    const railPayload = {
      customer_type,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      tax_id,
      address: address || {}
    };

    // Create application via Rail API
    const railResponse = await createApplicationRail(railPayload);

    // Save to local database
    const dbRecord = {
      id: railResponse.id,
      customer_name: `${first_name} ${last_name}`,
      email,
      status: railResponse.status || 'PENDING',
      customer_type
    };

    saveApplication(dbRecord);

    // Return both responses
    res.status(201).json({
      message: 'Application created successfully',
      rail: railResponse,
      local: dbRecord
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      error: 'Failed to create application',
      details: error.message
    });
  }
});

/**
 * GET /api/applications
 * List all applications from local database
 */
router.get('/', async (req, res) => {
  try {
    const applications = getAllApplications();
    res.json({
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Error listing applications:', error);
    res.status(500).json({
      error: 'Failed to list applications',
      details: error.message
    });
  }
});

/**
 * GET /api/applications/:id
 * Get application by Rail ID and sync with Rail API
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch latest from Rail API
    const railResponse = await getApplicationRail(id);

    // Update local database
    const dbRecord = {
      id: railResponse.id,
      customer_name: `${railResponse.first_name} ${railResponse.last_name}`,
      email: railResponse.email,
      status: railResponse.status,
      customer_type: railResponse.customer_type
    };

    saveApplication(dbRecord);

    res.json({
      message: 'Application retrieved and synced',
      rail: railResponse,
      local: dbRecord
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({
      error: 'Failed to get application',
      details: error.message
    });
  }
});

export default router;
