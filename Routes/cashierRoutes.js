const express = require("express");
const router = express.Router();
const mw = require("../Middlewares/auth");
const cashierController = require("../Controllers/cashierController");

router.get("/products", mw.verifyToken, cashierController.getProducts);
router.get("/orders", mw.verifyToken, cashierController.getOrders);
router.get("/orders/active", mw.verifyToken, cashierController.getActiveOrders);

router.post("/order/add", mw.verifyToken, cashierController.addOrder);

router.put("/order/complete/:id", mw.verifyToken, cashierController.completeOrder);
router.put("/order/cancel/:id", mw.verifyToken, cashierController.cancelOrder);

module.exports = router;
