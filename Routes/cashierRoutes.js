const express = require("express");
const router = express.Router();
const mw = require("../Middlewares/auth");
const cashierController = require("../Controllers/cashierController");

router.get(
  "/products",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.getProducts
);
router.get(
  "/orders",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.getOrders
);
router.get(
  "/orders/active",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.getActiveOrders
);
router.get(
  "/orders/pending",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.getPendingOrders
);
router.get(
  "/taxes",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.getTaxes
);
router.get(
  "/branch/status",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.getBranchStatus
);

router.post(
  "/order/add",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.addOrder
);

router.put(
  "/order/:id/complete",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.completeOrder
);
router.put(
  "/order/:id/cancel",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.cancelOrder
);
router.get(
  "/profile",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.getCashierProfile
);

// Update cashier profile
router.put(
  "/profile/update",
  mw.verifyToken,
  mw.verifyCashier,
  cashierController.updateCashierProfile
);

module.exports = router;
