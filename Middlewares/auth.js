require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddlewares = {
verifyToken: (req, res, next) => {
  try {
    console.log('All cookies:', req.cookies);
    console.log('Headers:', req.headers);
    
    const token = req.cookies.token;
    console.log('Token found:', !!token);
     if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (!token) {
      console.log('No token provided');
      return res.status(403).send({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('JWT verification failed:', err.message);
        return res.status(401).send({ message: "Unauthorized" });
      }
      
      console.log('Token verified successfully for user:', decoded.id);
      req.id = decoded.id;
      req.role = decoded.role;

      if (decoded.shopId) req.shopId = decoded.shopId;
      if (decoded.shopName) req.shopName = decoded.shopName;
      if (decoded.branchId) req.branchId = decoded.branchId;
      if (decoded.branchName) req.branchName = decoded.branchName;

      next();
    });
  } catch (err) {
    console.log('Auth middleware error:', err);
    return res.status(401).send({ message: err.message });
  }
},

  // verifySuperAdmin: (req, res, next) => {
  //   if (req.role !== "superadmin")
  //     return res.status(403).send({ message: "Require Super Admin Role!" });
  //   next();
  // },

  verifyAdmin: (req, res, next) => {
    if (req.role !== "admin" && req.role !== "superadmin")
      return res.status(403).send({ message: "Require Admin Role!" });
    next();
  },

  verifyManager: (req, res, next) => {
    if (
      req.role !== "manager" &&
      req.role !== "admin" &&
      req.role !== "superadmin"
    )
      return res.status(403).send({ message: "Require Manager Role!" });
    next();
  },

  verifyCashier: (req, res, next) => {
    if (
      req.role !== "cashier" &&
      req.role !== "manager" &&
      req.role !== "admin" &&
      req.role !== "superadmin"
    )
      return res.status(403).send({ message: "Require Cashier Role!" });
    next();
  },
};

module.exports = authMiddlewares;
