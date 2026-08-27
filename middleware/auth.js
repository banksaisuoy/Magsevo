const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || (isProduction ? '' : 'dev-only-change-me');
  if (isProduction && secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters in production');
  }
  return secret;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ error: 'Bearer access token is required' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = {
      id: decoded.userId || decoded.id || decoded.username,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  verifyToken
};