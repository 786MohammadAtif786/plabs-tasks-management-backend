/** @format */

const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// Route ko protect karta hai - valid JWT token zaroori hai
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Password chhodkar baaki employee data request me daal do
      req.employee = await Employee.findById(decoded.id).select("-password");

      if (!req.employee) {
        return res.status(401).json({ success: false, message: "Employee not found" });
      }

      if (!req.employee.isActive) {
        return res.status(403).json({ success: false, message: "Account is deactivated" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token invalid" });
    }
  } else {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

// Sirf diye gaye roles hi access kar payenge (e.g. admin, manager)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.employee.role}' is not allowed to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
