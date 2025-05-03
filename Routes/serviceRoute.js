const express = require("express");
const router = express.Router();
const serviceAuth = require("../middlewares/serviceAuth");
const adminController = require("../Controllers/adminController");

// Products route for ordering system
router.get(
  "/products/:shopId", 
  serviceAuth.verifyServiceToken, 
  adminController.getAllProducts
);

module.exports = router;
