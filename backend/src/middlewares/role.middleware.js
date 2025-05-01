/**
 * Role-Based Authorization Middleware
 *
 * Factory function that returns middleware to enforce allowed user roles.
 * Checks `req.user.Role` against a whitelist of permitted roles and
 * returns 403 Forbidden if the user's role is not included.
 *
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Extract the user's role from the authenticated request
    const userRole = req.user.Role;

    // If the user's role is not in the allowed list, deny access
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role privileges' });
    }

    // Proceed to the next middleware or route handler
    next();
  };
};

module.exports = roleMiddleware;
