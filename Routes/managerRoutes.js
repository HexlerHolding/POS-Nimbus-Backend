const express = require("express");
const router = express.Router();
const mw = require("../Middlewares/auth");
const managerController = require("../Controllers/managerController");

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
// Add this to your manager routes file
router.put(
  "/profile/update",
  mw.verifyToken,
  mw.verifyManager,
  managerController.updateManagerProfile
);
module.exports = router;
