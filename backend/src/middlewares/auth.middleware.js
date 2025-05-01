/**
 * Authentication Middleware
 *
 * Verifies the presence and validity of a JWT in the Authorization header.
 * On successful verification, attaches the decoded payload to `req.user`.
 * Otherwise, returns a 401 Unauthorized response.
 */

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load JWT_SECRET from .env

const authenticateUser = (req, res, next) => {
  try {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }

    // Expect header in the format "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Verify the JWT; throws if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload (e.g., UserID, role) to request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Token missing/invalid/expired
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

module.exports = authenticateUser;
