const express = require("express");
const router = express.Router();
const mw = require("../Middlewares/auth");
const adminController = require("../Controllers/adminController");

router.get("/", mw.verifyToken, mw.verifyAdmin, adminController.getShop);
router.get(
  "/sales",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getTotalSales
);
router.get(
  "/branches",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getBranches
);
router.get(
  "/orders",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getAllOrders
);
router.get(
  "/managers",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getManagers
);
router.get(
  "/categories",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getCategories
);
router.get(
  "/products",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getAllProducts
);

router.get(
  "/branches/count",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getNumberOfBranches
);

router.get(
  "/branches/sales",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getBranchesSales
);

router.post(
  "/branch/add",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.addBranch
);
router.post(
  "/manager/add",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.addManager
);
router.post(
  "/category/add",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.addCategory
);

router.put(
  "/branch/update",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.updateBranch
);
router.put(
  "/category/update",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.updateCategory
);

router.delete(
  "/category/delete",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.deleteCategory
);
router.delete(
  "/branch/delete",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.deleteBranch
);
router.put(
  "/manager/update",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.updateManager
);

// For deleting a manager
router.delete(
  "/manager/delete",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.deleteManager
);
router.get(
  "/tax/fbr-rates",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getFbrTaxRates
);

// Route to update a branch with current FBR tax rates
router.put(
  "/branch/update-fbr-taxes",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.updateBranchWithFbrTaxes
);
router.get(
  "/profile",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.getAdminProfile
);

// Update admin profile
router.put(
  "/profile/update",
  mw.verifyToken,
  mw.verifyAdmin,
  adminController.updateAdminProfile
);

// managerRoutes.js - Add this route

module.exports = router;
