const jwt = require('jsonwebtoken');


// ------------------ AUTHENTICATE USER ------------------
const authenticate = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role,
      planType: decoded.planType,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

// ------------------ REQUIRE ADMIN ROLE ------------------
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  next();
};

module.exports = authenticate;
module.exports.requireAdmin = requireAdmin;
