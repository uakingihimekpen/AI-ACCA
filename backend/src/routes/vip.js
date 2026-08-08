const express = require('express');
const router = express.Router();
const { getPlans, initializePayment, verifyPayment, checkStatus } = require('../controllers/vipController');
const { authenticate } = require('../middleware/auth');

router.get('/plans', getPlans);
router.get('/status', authenticate, checkStatus);
router.post('/initialize', authenticate, initializePayment);
router.post('/verify', authenticate, verifyPayment);

module.exports = router;