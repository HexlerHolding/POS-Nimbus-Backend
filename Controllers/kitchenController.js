const Order = require("../Models/Order");

const kitchenController = {
  getPendingOrders: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const orders = await Order.find({
        shop_id: shopId,
        branch_id: branchId,
        status: "pending",
      });

      res.status(200).json({ orders });
    } catch (error) {
      console.log(error);
    }
  },

  readyOrder: async (req, res) => {
    try {
      const orderId = req.params.id;
      if (!orderId) {
        return res.status(400).send({ message: "Please provide order id" });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }

      order.status = "ready";
      await order.save();

      res.status(200).send({ message: "Order is ready" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = kitchenController;