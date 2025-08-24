// routes/gig.routes.js
const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gig.controller');
const auth = require('../middlewares/auth.middleware');
const Gig = require('../models/Gig'); // ✅ Needed for custom apply route
const User = require('../models/User');

// ---------------------- CREATE ----------------------
router.post('/', auth, gigController.createGig);

// ---------------------- READ ----------------------
// More specific first
router.get('/search', gigController.searchGigs);

// Freelancer dashboard
router.get('/freelancer/dashboard', auth, gigController.getFreelancerGigs);

// Get all gigs
router.get('/', gigController.getGigs);

// Get single gig by ID
router.get('/:id', gigController.getGigById);

// ---------------------- UPDATE ----------------------

// Apply to gig (custom implementation)
// routes/gigs.js
router.put("/:id/apply", auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ msg: "Gig not found" });

    // prevent duplicate applications
    if (gig.applicants.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already applied" });
    }

    // add to applicants list
    gig.applicants.push(req.user.id);

    // 👇 auto-assign first applicant as freelancer (or keep only for client approval)
    if (!gig.freelancer) {
      gig.freelancer = req.user.id;
    }

    await gig.save();
    res.json(gig);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


// Assign freelancer (only client can assign)
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ msg: 'Gig not found' });
    }

    if (gig.client.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to assign' });
    }

    gig.freelancer = req.body.freelancerId;
    await gig.save();

    res.json({ msg: 'Freelancer assigned', gig });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    console.log("🔑 Request User:", req.user);  // Debug user
    console.log("👤 Gig Client:", gig.client.toString());
    console.log("🛠 Gig Freelancer:", gig.freelancer?.toString());

    const isClient = gig.client.toString() === req.user.id;
    const isFreelancer = gig.freelancer?.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    gig.isCompleted = true;
    await gig.save();

    res.json(gig);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Submit a review (client only)
router.put('/:id/review', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    if (gig.client.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the client can leave a review' });
    }

    gig.review = req.body.review;
    await gig.save();

    res.json({ msg: 'Review submitted successfully', gig });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/applicants/:id', async (req, res) => {
  try {
    const applicant = await User.findById(req.params.id);
    
    res.status(200).json({sucess: true, applicant: applicant})
  } catch (error) {
    res.status(500).json({message: 'Internal server error!'});
  }
})

module.exports = router;
