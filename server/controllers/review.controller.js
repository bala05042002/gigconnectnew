// controllers/review.controller.js

const Review = require('../models/Review');
const Gig = require('../models/Gig');

// Create a new review
exports.createReview = async (req, res) => {
  const { gigId } = req.params;
  const { rating, comment } = req.body;
  const reviewerId = req.user.id;

  try {
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ msg: 'Gig not found' });
    }

    // Check if the gig is completed and the user is either the client or a freelancer on the gig
    if (!gig.isCompleted || (gig.client.toString() !== reviewerId)) {
        // You'll need to expand this logic to include the freelancer who completed the gig
        return res.status(403).json({ msg: 'Cannot review an uncompleted gig or unauthorized user' });
    }

    // Check if a review already exists for this gig
    const existingReview = await Review.findOne({ gig: gigId, reviewer: reviewerId });
    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this gig' });
    }

    // Determine the user being reviewed (freelancer or client)
    const reviewedUserId = gig.client.toString() !== reviewerId ? gig.client : 'freelancerIdHere'; // You'll need to add a freelancerId to your Gig model to make this work fully.

    const newReview = new Review({
      reviewer: reviewerId,
      reviewedUser: reviewedUserId,
      gig: gigId,
      rating,
      comment,
    });

    const review = await newReview.save();
    res.json(review);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get reviews for a specific user
exports.getReviewsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const reviews = await Review.find({ reviewedUser: userId }).populate('reviewer', ['name']);
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};