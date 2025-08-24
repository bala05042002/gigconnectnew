// middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Make sure req.user.id is set
    req.user = { id: decoded.user.id };
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};