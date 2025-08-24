// models/Chat.js

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true, unique: true }, 
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // client + freelancer
  messages: [MessageSchema]
});

module.exports = mongoose.model('Chat', ChatSchema);
