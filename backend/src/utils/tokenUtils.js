const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      planType: user.planType,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}


module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
