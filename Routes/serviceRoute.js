// routes/serviceRoutes.js in your POS system
const express = require("express");
const router = express.Router();
const serviceAuth = require("../Middlewares/serviceAuth");
const adminController = require("../Controllers/adminController");
const cashierController = require("../Controllers/cashierController");
const Branch = require("../Models/Branch");

// Existing route for products
router.get(
  "/products/:shopId", 
  serviceAuth.verifyServiceToken, 
  adminController.getAllProducts
);

// Existing route for categories
router.get(
  "/categories/:shopId", 
  serviceAuth.verifyServiceToken, 
  adminController.getCategories
);

// Add route for branches
router.get(
  "/branches/:shopId",
  serviceAuth.verifyServiceToken,
  adminController.getBranches
);

// Add route for branch tax rates
router.get(
  "/branch/:branchId/taxes",
  serviceAuth.verifyServiceToken,
  async (req, res) => {
    try {
      // Extract shop ID from token and branch ID from URL
      const shopId = req.shopId;
      const branchId = req.params.branchId;
      
      if (!shopId || !branchId) {
        return res.status(400).json({ 
          message: "Missing required information (shop ID or branch ID)" 
        });
      }
      
      // Get branch information
      const branch = await Branch.findOne({ 
        _id: branchId,
        shop_id: shopId
      });
      
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      // Return tax rates
      res.status(200).json({ 
        cash_tax: branch.cash_tax || 0, 
        card_tax: branch.card_tax || 0 
      });
    } catch (error) {
      console.error("Service branch tax error:", error);
      res.status(500).json({ message: "Failed to get tax information", error: error.message });
    }
  }
);

// Route for submitting orders
router.post(
  "/order/add",
  serviceAuth.verifyServiceToken,
  async (req, res) => {
    try {
      // Extract shop ID from token
      const shopId = req.shopId;
      
      // Extract branch ID from request body
      const { branch_id } = req.body;
      
      if (!shopId || !branch_id) {
        return res.status(400).json({ 
          message: "Missing required information (shop ID or branch ID)" 
        });
      }
      
      // Add necessary IDs to the request object for the cashier controller
      req.shopId = shopId;
      req.branchId = branch_id;
      
      // Forward to cashier controller
      await cashierController.addOrder(req, res);
    } catch (error) {
      console.error("Service order error:", error);
      res.status(500).json({ message: "Failed to process order", error: error.message });
    }
  }
);


module.exports = router;