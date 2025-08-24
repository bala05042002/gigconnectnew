// controllers/profile.controller.js

const User = require('../models/User');

exports.createOrUpdateProfile = async (req, res) => {
  const { bio, skills, rate } = req.body;
  const profileFields = {
    bio,
    skills: skills.split(',').map(skill => skill.trim()),
    rate,
  };

  try {
    let user = await User.findById(req.user.id);

    if (user) {
      if (user.role !== 'freelancer') {
        return res.status(400).json({ msg: 'Only freelancers can create a profile' });
      }

      user.profile = profileFields;
      await user.save();
      return res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};