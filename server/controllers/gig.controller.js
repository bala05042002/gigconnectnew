// controllers/gig.controller.js
const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Chat = require('../models/Chat');

// Helper: parse skills
const parseSkills = (skillsRequired) => {
  if (!skillsRequired) return [];
  if (Array.isArray(skillsRequired)) return skillsRequired.map(s => s.trim());
  return skillsRequired.toString().split(',').map(s => s.trim());
};

// ✅ Create a new gig (Client only)
// ✅ Create a new gig (Client only)
exports.createGig = async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ msg: 'Only clients can post gigs' });
  }

  const { title, description, location, budget, skillsRequired } = req.body;

  try {
    const newGig = new Gig({
      client: req.user.id,
      title,
      description,
      location,
      budget,
      skillsRequired: parseSkills(skillsRequired),
    });

    await newGig.save();

    // 🔑 Populate client details before sending response
    const gig = await Gig.findById(newGig._id)
      .populate('client', 'name email role')
      .populate('freelancer', 'name email role');

    res.json(gig);
  } catch (err) {
    console.error('❌ createGig error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};


// ✅ Get all gigs
exports.getGigs = async (req, res) => {
  try {
    const gigs = await Gig.find().sort({ datePosted: -1 });
    res.json(gigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Get single gig by ID
exports.getGigById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid gig ID' });
  }

  try {
    const gig = await Gig.findById(id)
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    if (!gig) return res.status(404).json({ msg: 'Gig not found' });
    res.json(gig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Apply to gig (Freelancer)
exports.applyToGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    if (gig.applicants.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You already applied to this gig' });
    }

    gig.applicants.push(req.user.id);
    await gig.save();
    res.json({ msg: 'Applied successfully', gig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Assign freelancer + create chat (Client only)
exports.assignFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid gig ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      return res.status(400).json({ msg: 'Invalid freelancer ID' });
    }

    const gig = await Gig.findById(id).populate('client');
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    // Only gig owner can assign
    if (gig.client._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to assign freelancer' });
    }

    // Assign freelancer
    gig.freelancer = mongoose.Types.ObjectId(freelancerId);
    await gig.save();

    // Create chat if not exists
    let chat = await Chat.findOne({
      gig: gig._id,
      participants: { $all: [gig.client._id, freelancerId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [gig.client._id, freelancerId],
        gig: gig._id,
        messages: [],
      });
      await chat.save();
    }

    res.json({ msg: 'Freelancer assigned and chat created', gig, chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Get gigs for freelancer (only assigned or applied)
exports.getFreelancerGigs = async (req, res) => {
  try {
    const userId = req.user.id;

    const gigs = await Gig.find({
      $or: [{ freelancer: userId }, { applicants: userId }],
    })
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    res.json(gigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Ensure chat access (owner or assigned freelancer only)
exports.getChatForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({ msg: 'Invalid gig ID' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    // Check if user is either the gig owner or the assigned freelancer
    if (
      gig.client.toString() !== req.user.id &&
      gig.freelancer?.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Not authorized for this chat' });
    }

    const chat = await Chat.findOne({ gig: gigId }).populate('messages.sender', 'name email');
    if (!chat) return res.status(404).json({ msg: 'Chat not found for this gig' });

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Mark gig as complete (Client)
// Mark gig as complete (Client or assigned Freelancer)
exports.markGigAsComplete = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    const userId = req.user.id;

    // Allow client OR assigned freelancer to mark as complete
    if (
      gig.client.toString() !== userId &&
      gig.freelancer?.toString() !== userId
    ) {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    gig.isCompleted = true;
    await gig.save();

    res.json(gig);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// ✅ Delete a gig (Client)
exports.deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    if (gig.client.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Gig.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Gig removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Update a gig (Client)
exports.updateGig = async (req, res) => {
  const { title, description, location, budget, skillsRequired } = req.body;
  const gigFields = { title, description, location, budget };

  if (skillsRequired) {
    gigFields.skillsRequired = parseSkills(skillsRequired);
  }

  try {
    let gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    if (gig.client.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: gigFields },
      { new: true }
    );

    res.json(gig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ✅ Search gigs (optional filters)
exports.searchGigs = async (req, res) => {
  const { query, location, minBudget, maxBudget, skills } = req.query;
  let filters = {};

  if (query) {
    filters.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }
  if (location) filters.location = { $regex: location, $options: 'i' };
  if (minBudget || maxBudget) {
    filters.budget = {};
    if (minBudget) filters.budget.$gte = Number(minBudget);
    if (maxBudget) filters.budget.$lte = Number(maxBudget);
  }
  if (skills) {
    filters.skillsRequired = { $in: parseSkills(skills) };
  }

  try {
    const gigs = await Gig.find(filters).sort({ datePosted: -1 });
    res.json(gigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};
