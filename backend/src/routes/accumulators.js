const express = require('express');
const router = express.Router();
const { getTodayAccumulators, getAccumulatorsByDate, getAccumulatorById, getHistory, getStats } = require('../controllers/accumulatorController');
const { optionalAuth } = require('../middleware/auth');

router.get('/today', optionalAuth, getTodayAccumulators);
router.get('/history', optionalAuth, getHistory);
router.get('/stats', getStats);
router.get('/date/:date', optionalAuth, getAccumulatorsByDate);
router.get('/:id', optionalAuth, getAccumulatorById);

module.exports = router;