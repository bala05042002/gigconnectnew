// controllers/chat.controller.js
const Chat = require('../models/Chat');
const Gig = require('../models/Gig');

// ========================
// GET or CREATE chat by gigId
// ========================
exports.getChatByGigId = async (req, res) => {
  try {
    const { gigId } = req.params;
    const userId = req.user.id; // from auth middleware

    // 1. Find gig with client & freelancer info
    const gig = await Gig.findById(gigId)
      .populate('client', 'name email _id')
      .populate('freelancer', 'name email _id');

    if (!gig) {
      return res.status(404).json({ msg: 'Gig not found' });
    }

    // 2. Check if logged in user is client or freelancer
    if (
      gig.client._id.toString() !== userId &&
      gig.freelancer?._id?.toString() !== userId
    ) {
      return res.status(403).json({ msg: 'Not authorized for this chat' });
    }

    // 3. Find existing chat
    let chat = await Chat.findOne({ gig: gigId })
      .populate('messages.sender', 'name email _id');

    // 4. If no chat, create one
    if (!chat) {
      chat = new Chat({
        gig: gigId,
        participants: [gig.client._id, gig.freelancer].filter(Boolean),
        messages: []
      });
      await chat.save();
      chat = await Chat.findById(chat._id).populate('messages.sender', 'name email _id');
    }

    res.json({
      gig,
      messages: chat.messages
    });
  } catch (err) {
    console.error('Error in getChatByGigId:', err.message);
    res.status(500).send('Server error');
  }
};

// ========================
// POST message to chat
// ========================
exports.sendMessage = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    let chat = await Chat.findOne({ gig: gigId });
    if (!chat) {
      return res.status(404).json({ msg: 'Chat not found for this gig' });
    }

    const newMessage = {
      sender: userId,
      content,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    await chat.populate('messages.sender', 'name email _id');

    res.json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).send('Server error');
  }
};

// ========================
// GET chat details (gig + messages)
// ========================
exports.getChat = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId)
      .populate('client', 'name email _id')
      .populate('freelancer', 'name email _id');

    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    let chat = await Chat.findOne({ gig: gigId })
      .populate('messages.sender', 'name email _id');

    if (!chat) {
      chat = new Chat({
        gig: gigId,
        participants: [gig.client._id, gig.freelancer].filter(Boolean),
        messages: []
      });
      await chat.save();
    }

    res.json({
      gig,
      messages: chat.messages
    });
  } catch (err) {
    console.error('Error in getChat:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ========================
// (Optional) get or create from direct call
// ========================
exports.getOrCreateChat = async (req, res) => {
  try {
    const { gigId } = req.params;
    const userId = req.user.id;

    const gig = await Gig.findById(gigId)
      .populate('client', 'name email _id')
      .populate('freelancer', 'name email _id');

    if (!gig) return res.status(404).json({ msg: 'Gig not found' });

    let chat = await Chat.findOne({ gig: gigId })
      .populate('participants', 'name email _id')
      .populate('gig', 'title client freelancer');

    if (!chat) {
      chat = new Chat({
        gig: gigId,
        participants: [gig.client._id, gig.freelancer].filter(Boolean),
        messages: []
      });
      await chat.save();
      await chat.populate('participants', 'name email _id');
    }

    res.json(chat);
  } catch (err) {
    console.error('Error in getOrCreateChat:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
