const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const {
  createAccumulator,
  updateAccumulator,
  gradeAccumulator,
  getAllAccumulators,
  createRollover,
  updateRolloverDay,
  getAllRollovers,
  getDonations,
  confirmDonation,
  getRatings,
  hideRating,
  getAnalytics,
  getAuditLogs,
  updateVipPlans,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Accumulator management
router.get('/accumulators', getAllAccumulators);
router.post('/accumulators', createAccumulator);
router.put('/accumulators/:id', updateAccumulator);
router.post('/accumulators/:id/grade', gradeAccumulator);

// Rollover management
router.get('/rollovers', getAllRollovers);
router.post('/rollovers', createRollover);
router.put('/rollovers/:id/days/:dayNumber', updateRolloverDay);

// Donation management
router.get('/donations', getDonations);
router.post('/donations/:id/confirm', confirmDonation);

// Rating management
router.get('/ratings', getRatings);
router.post('/ratings/:id/hide', hideRating);

// VIP plans
router.put('/vip-plans', updateVipPlans);

// Analytics
router.get('/analytics', getAnalytics);

// Audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;