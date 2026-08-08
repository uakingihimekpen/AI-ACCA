const express = require('express');
const router = express.Router();
const { submitRating, getRatings } = require('../controllers/ratingController');
const { authenticate } = require('../middleware/auth');

router.get('/', getRatings);
router.post('/', authenticate, submitRating);

module.exports = router;