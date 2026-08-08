const express = require('express');
const router = express.Router();
const { getBankDetails, initializeDonation, recordBankTransfer, getDonationWall } = require('../controllers/donationController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/bank-details', getBankDetails);
router.get('/wall', getDonationWall);
router.post('/paystack', optionalAuth, initializeDonation);
router.post('/bank-transfer', optionalAuth, recordBankTransfer);

module.exports = router;