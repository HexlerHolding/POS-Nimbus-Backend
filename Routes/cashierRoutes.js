const express = require("express");
const router = express.Router();
const mw = require("../Middlewares/auth");
const cashierController = require("../Controllers/cashierController");

router.get("/products", mw.verifyToken, cashierController.getProducts);
router.get("/orders", mw.verifyToken, cashierController.getOrders);

router.post("/order/add", mw.verifyToken, cashierController.addOrder);

router.put("/order/complete", mw.verifyToken, cashierController.completeOrder);

module.exports = router;
