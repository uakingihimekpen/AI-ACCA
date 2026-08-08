const express = require('express');
const router = express.Router();
const { getActiveRollovers, getRolloverById, getRolloverHistory } = require('../controllers/rolloverController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/active', optionalAuth, getActiveRollovers);
router.get('/history', optionalAuth, getRolloverHistory);
router.get('/:id', optionalAuth, getRolloverById);

module.exports = router;