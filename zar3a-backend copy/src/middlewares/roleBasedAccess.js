/**
 * Role-Based Access Control Middleware
 * Validates user roles before granting access to resources
 */

const roleBasedAccess = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      message: `Access denied. Requires role(s): ${allowedRoles.join(', ')}` 
    });
  };
};

/**
 * Check if user is Admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

/**
 * Check if user can access dashboard (not buyer)
 */
export const requireDashboardAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Buyers cannot access dashboard
  if (req.user.role === 'BUYER') {
    return res.status(403).json({ message: 'Buyers cannot access dashboard' });
  }

  next();
};

/**
 * Check if user can add products (Farmer, Supplier, Admin)
 */
export const requireProductCreation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const allowedRoles = ['FARMER', 'SUPPLIER', 'ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Only Farmers, Suppliers, and Admins can add products' });
  }

  next();
};

/**
 * Check if user is approved (Farmer, Supplier, Agro-expert)
 */
export const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const restrictedRoles = ['FARMER', 'SUPPLIER', 'AGRO_EXPERT'];
  if (restrictedRoles.includes(req.user.role) && !req.user.isApproved) {
    return res.status(403).json({
      message: 'Your account is pending approval by an administrator. Restricted functionality is disabled.'
    });
  }

  next();
};

export default roleBasedAccess;
