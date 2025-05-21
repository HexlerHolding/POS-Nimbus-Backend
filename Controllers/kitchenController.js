const Order = require("../Models/Order");
 const { createOrderReadyEmail, sendEmail } = require('../utils/emailNotifier'); // Adjust the path as needed

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
    console.log( "order is " , order);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    order.status = "ready";
    await order.save();

    // Prepare email content
    const customerName = order.customer_name || "Valued Customer"; // Fallback if name is not available
    const orderNumber = order._id.toString(); // Use order ID as order number
    const customerEmail = order.customer_email || "";
    const orderDetails = {
      orderType: order.orderType || "delivery", // Adjust based on your order schema
      estimatedTime: order.estimatedTime || "30-45 minutes" // Adjust based on your order schema or logic
    };

    // Check if the order address is in branch (modify this condition based on your schema/logic)
    const isInBranch = !order.address || order.address === "Branch Address"; // Example condition

    let emailSubject, emailHtml;
    if (isInBranch) {
      // Customize email for in-branch orders
      emailSubject = `Your Order #${orderNumber} is Ready In Branch!`;
      emailHtml = createOrderReadyEmail(customerName, orderNumber, {
        ...orderDetails,
        orderType: "pickup" // Override to pickup for in-branch orders
      });
    } else {
      // Standard email for non-branch (delivery) orders
      emailSubject = `Your Order #${orderNumber} is Ready!`;
      emailHtml = createOrderReadyEmail(customerName, orderNumber, orderDetails);
    }
    //log email id
    console.log("Customer Email:", customerEmail);
    // Send email notification
    const emailResult = await sendEmail(
      customerEmail,
      emailSubject,
      emailHtml
    );

    if (!emailResult.success) {
      console.error("Failed to send email notification:", emailResult.error);
      // Log to a monitoring system but don't fail the API response
    }

    res.status(200).send({ message: "Order is ready" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
},
};

module.exports = kitchenController;