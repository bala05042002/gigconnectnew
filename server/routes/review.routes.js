// routes/review.routes.js

const express = require('express');
const auth = require('../middlewares/auth.middleware');
const {
  createReview,
  getReviewsForUser,
} = require('../controllers/review.controller');

const router = express.Router();

// @route POST api/reviews/:gigId
// @desc Post a review for a completed gig
// @access Private
router.post('/:gigId', auth, createReview);

// @route GET api/reviews/:userId
// @desc Get all reviews for a specific user (client or freelancer)
// @access Public
router.get('/:userId', getReviewsForUser);

module.exports = router;