const express = require('express');
const router = express.Router();
const mw = require('../Middlewares/auth');
const kitchenController = require('../Controllers/kitchenController');

router.get('/orders/pending', mw.verifyToken, kitchenController.getPendingOrders);
router.put("/order/:id/ready", mw.verifyToken, kitchenController.readyOrder);

module.exports = router;
