// routes/chat.routes.js

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth.middleware');
const Chat = require('../models/Chat');
const Gig = require('../models/Gig');

const router = express.Router();

/**
 * GET or CREATE chat for a gig
 */
router.get('/:gigId', auth, async (req, res) => {
  const { gigId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    return res.status(400).json({ msg: 'Invalid gig ID' });
  }

  try {
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    // Only client or applicants can create/access a chat
    if (
      req.user.id.toString() !== gig.client.toString() &&
      !gig.applicants.map(a => a.toString()).includes(req.user.id.toString())
    ) {
      return res.status(403).json({ msg: 'Not authorized for this chat' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      gig: gigId,
      participants: { $all: [gig.client, req.user.id] }
    })
      .populate('participants', 'name email')
      .populate('gig', 'title');

    // If no chat, create one
    if (!chat) {
      chat = new Chat({
        gig: gigId,
        participants: [gig.client, req.user.id],
        messages: []
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/**
 * POST a message in chat
 */
router.post('/:gigId', auth, async (req, res) => {
  const { gigId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ msg: 'Message content cannot be empty' });
  }

  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    return res.status(400).json({ msg: 'Invalid gig ID' });
  }

  try {
    let chat = await Chat.findOne({ gig: gigId, participants: req.user.id });
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found for this gig' });
    }

    // Ensure user is a participant
    if (!chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(401).json({ msg: 'Not authorized to send message in this chat' });
    }

    const message = {
      sender: req.user.id,
      content: content.trim(),
      timestamp: new Date()
    };

    chat.messages.push(message);
    await chat.save();

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
