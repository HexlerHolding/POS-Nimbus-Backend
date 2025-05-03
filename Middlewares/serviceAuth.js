const jwt = require("jsonwebtoken");

const serviceAuthMiddleware = {
  verifyServiceToken: (req, res, next) => {
    try {
      const serviceToken = req.headers['x-service-token'];
      
      if (!serviceToken) {
        return res.status(403).json({ message: "No service token provided" });
      }

      // Verify service token
      jwt.verify(serviceToken, process.env.SERVICE_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid service token" });
        }
        
        // Check if the request is from authorized ordering system
        if (decoded.service !== 'ordering-system') {
          return res.status(403).json({ message: "Unauthorized service" });
        }
        
        // Set shopId if needed for the request
        if (decoded.shopId) {
          req.shopId = decoded.shopId;
        }
        
        next();
      });
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: err.message });
    }
  }
};

module.exports = serviceAuthMiddleware;