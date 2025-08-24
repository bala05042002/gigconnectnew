// models/Gig.js
const mongoose = require("mongoose");

const GigSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  skillsRequired: { type: [String], default: [] },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isCompleted: { type: Boolean, default: false },
  review: { type: String },   // 👈 NEW FIELD
  datePosted: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Gig", GigSchema);
