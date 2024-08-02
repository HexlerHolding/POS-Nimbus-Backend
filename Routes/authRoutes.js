const express = require("express");
const router = express.Router();
const mw = require("../Middlewares/auth");
const authController = require("../Controllers/authController");

// router.post("/signup", authController.signup);
// router.post("/login", authController.login);
router.post("/admin/signup", authController.addShop); // hidden
router.post("/admin/login", authController.adminLogin);
router.post("/manager/login", authController.managerLogin);
router.post("/cashier/login", authController.cashierLogin);

module.exports = router;
