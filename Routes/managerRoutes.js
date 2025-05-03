const express = require("express");
const router = express.Router();
const mw = require("../Middlewares/auth");
const managerController = require("../Controllers/managerController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", mw.verifyToken, mw.verifyManager, managerController.getBranch);
router.get(
  "/sales",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getSales
);
router.get(
  "/cashiers",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getCashiers
);
router.get(
  "/kitchens",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getKitchens
);
router.get(
  "/products",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getProducts
);
router.get(
  "/categories",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getCategories
);

router.get(
  "/branch/orders",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getBranchOrders
);
router.post(
  "/cashier/add",
  mw.verifyToken,
  mw.verifyManager,
  managerController.addCashier
);
router.post(
  "/kitchen/add",
  mw.verifyToken,
  mw.verifyManager,
  managerController.addKitchen
);
router.post(
  "/product/add",
  mw.verifyToken,
  mw.verifyManager,
  managerController.addProduct
);

// New product management routes
router.put(
  "/product/update",
  mw.verifyToken,
  mw.verifyManager,
  managerController.updateProduct
);
router.delete(
  "/product/delete",
  mw.verifyToken,
  mw.verifyManager,
  managerController.deleteProduct
);

// New bulk product upload route
router.post(
  "/products/bulk-upload",
  mw.verifyToken,
  mw.verifyManager,
  upload.single("csvFile"),
  managerController.bulkUploadProducts
);

// Category management routes for managers
router.post(
  "/category/add",
  mw.verifyToken,
  mw.verifyManager,
  managerController.addCategory
);
router.put(
  "/category/update",
  mw.verifyToken,
  mw.verifyManager,
  managerController.updateCategory
);
router.delete(
  "/category/delete/:categoryId",
  mw.verifyToken,
  mw.verifyManager,
  managerController.deleteCategory
);

router.put(
  "/branch/timings",
  mw.verifyToken,
  mw.verifyManager,
  managerController.updateBranchTimings
);

router.put(
  "/branch/openBranch",
  mw.verifyToken,
  mw.verifyManager,
  managerController.openBranch
);

router.put(
  "/branch/closeBranch",
  mw.verifyToken,
  mw.verifyManager,
  managerController.closeBranch
);

router.put(
  "/branch/updateCashOnHand",
  mw.verifyToken,
  mw.verifyManager,
  managerController.updateCashOnHand
);

router.get(
  "/profile",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getManagerProfile
);
router.put(
  "/profile/update",
  mw.verifyToken,
  mw.verifyManager,
  managerController.updateManagerProfile
);

module.exports = router;