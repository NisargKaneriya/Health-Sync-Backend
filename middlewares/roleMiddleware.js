// This middleware allows access only to specific roles
// const authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     // Check if current user's role is allowed
//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ error: "Access denied: insufficient permissions" });
//     }
//     next(); // Continue if role is authorized
//   };
// };
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
module.exports = authorizeRoles;
