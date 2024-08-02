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
  "/products",
  mw.verifyToken,
  mw.verifyManager,
  managerController.getProducts
);

router.post(
  "/cashier/add",
  mw.verifyToken,
  mw.verifyManager,
  managerController.addCashier
);
router.post(
  "/product/add",
  mw.verifyToken,
  mw.verifyManager,
  managerController.addProduct
);

module.exports = router;
