// routes/profile.routes.js

const express = require('express');
const { createOrUpdateProfile, getMyProfile } = require('../controllers/profile.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', auth, createOrUpdateProfile);
router.get('/me', auth, getMyProfile);

module.exports = router;