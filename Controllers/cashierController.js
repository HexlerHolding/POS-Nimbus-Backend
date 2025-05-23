const Order = require("../Models/Order");
const Product = require("../Models/Product");
const Branch = require("../Models/Branch");
const Cashier = require("../Models/Cashier");
const Shop = require("../Models/Shop");
const whatsappNotifier = require('../utils/whatsappNotifier');
const emailNotifier = require('../utils/emailNotifier'); // Import the email notifier

const cashierController = {
  getProducts: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }

      const products = await Product.find({ shop_id: shopId });
      res.status(200).send(products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getOrders: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const orders = await Order.find({
        shop_id: shopId,
        branch_id: branchId,
      }).sort({ _id: -1 });

      res.status(200).send(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getActiveOrders: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const orders = await Order.find({
        shop_id: shopId,
        branch_id: branchId,
        status: { $in: ["pending", "ready"] },
      });

      res.status(200).send(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

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

      res.status(200).send(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  // Updated addOrder function for cashier controller with email notification
  addOrder: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }
      console.log("Shop ID:", shopId);
      const {
        // Original required fields
        products,
        total,
        grand_total,
        customer_name,
        payment_method,
        order_type,
        tax,
        discount,
        address,
        
        // New optional fields from ordering system
        customer_phone,
        customer_email, // Added customer email field
        delivery_charges,
        comment,
        source_system,
        ordering_system_id,
        gst,
      } = req.body;
      
      console.log("Order Request Body:", req.body);
      
      // Validate required fields
      if (
        !products ||
        !total ||
        !grand_total ||
        !customer_name ||
        !payment_method ||
        !order_type ||
        tax == "null" ||
        discount == "null" ||
        !address
      ) {
        console.log(
          !products,
          !total,
          !grand_total,
          !customer_name,
          !payment_method,
          !order_type,
          tax == "null",
          discount == "null",
          !address
        );
        return res
          .status(400)
          .send({ message: "Please provide all required fields" });
      }
      
      // Process the cart items
      const cart = products.map((product) => {
        return {
          product_id: product._id,
          product_name: product.name,
          quantity: product.quantity,
          price: product.price,
        };
      });
      
      console.log("Formatted cart:", cart);
      
      // Create the order object with all fields
      const order = new Order({
        // Original fields
        cart,
        total,
        grand_total,
        customer_name,
        payment_method,
        order_type,
        tax,
        discount,
        address,
        shop_id: shopId,
        branch_id: branchId,
        
        // New optional fields - only add if they exist
        ...(customer_phone && { customer_phone }),
        ...(customer_email && { customer_email }), // Add customer email
        ...(delivery_charges !== undefined && { delivery_charges }),
        ...(comment && { comment }),
        ...(source_system && { source_system }),
        ...(ordering_system_id && { ordering_system_id }),
        ...(gst !== undefined && { gst }),
      });
      
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }
      
      // Add grand total to branch sales
      branch.sales.push({ date: new Date(), amount: grand_total });
      console.log("Updated branch sales:", branch.sales);
      
      await order.save();
      await branch.save();
      
      // Generate a unique order number
      const orderNumber = order._id.toString().slice(-6).toUpperCase();
      
      // Send WhatsApp notification if a phone number is provided
      let whatsappSent = false;
      console.log("Customer Phone:", customer_phone);
      if (customer_phone && customer_phone.trim() !== '') {
        try {
          console.log(`Attempting to send WhatsApp notification to: ${customer_phone}`);
          const message = `Hello ${customer_name}, your order #${orderNumber} has been placed successfully!`;
          const notificationResult = await whatsappNotifier.sendWhatsAppMessage(customer_phone, message);
          if (notificationResult.success) {
            console.log(`WhatsApp notification sent successfully to: ${customer_phone}`);
          } else {
            console.log(`Failed to send WhatsApp notification to: ${customer_phone}`);
          }
          whatsappSent = notificationResult.success;
        } catch (notificationError) {
          console.error(`Error sending WhatsApp notification to ${customer_phone}:`, notificationError);
        }
      } else {
        console.log("No phone number provided or empty phone number, skipping WhatsApp notification");
      }
      
      // Send email notification
      let emailSent = false;
      const emailTarget = customer_email || process.env.ADMIN_EMAIL;
      
      if (emailTarget) {
        try {
          console.log("Attempting to send email notification to:", emailTarget);
          
          // Create email content
          const emailContent = emailNotifier.createOrderPlacedEmail(
            customer_name,
            orderNumber,
            {
              orderType: order_type,
              total: grand_total,
              cart
            }
          );
          
          // Send the email notification
          const emailResult = await emailNotifier.sendEmail(
            emailTarget,
            `Order Confirmation #${orderNumber} - Habib Catering`,
            emailContent
          );
          
          if (emailResult.success) {
            console.log("Email notification sent successfully to:", emailTarget);
            emailSent = true;
          } else {
            console.log("Email notification failed:", emailResult.error);
          }
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Continue with the order process even if email fails
        }
      }
      
      res.status(200).send({ 
        message: "Order placed successfully", 
        order,
        notification: {
          whatsapp_sent: whatsappSent,
          email_sent: emailSent
        }
      });
    } catch (error) {
      console.log("Error in addOrder:", error);
      res.status(500).json({ message: error.message });
    }
  },

  completeOrder: async (req, res) => {
    try {
      const orderId = req.params.id;
      if (!orderId) {
        return res.status(400).send({ message: "Please provide order id" });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }

      order.status = "completed";
      await order.save();

      // Send WhatsApp notification if it's a delivery order and phone number is provided
      if (order.order_type === 'delivery' && order.customer_phone && order.address !== 'In Branch') {
        try {
          console.log("Sending order ready notification to:", order.customer_phone);
          
          // Generate estimated delivery time (30 minutes from now)
          const now = new Date();
          now.setMinutes(now.getMinutes() + 30);
          const estimatedTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          // Create parameters for the delivery notification template
          const parameters = whatsappNotifier.createDeliveryParameters(
            order.customer_name,
            estimatedTime
          );
          
          // Send the WhatsApp notification
          const notificationResult = await whatsappNotifier.sendWhatsAppMessage(
            order.customer_phone,
            parameters,
            whatsappNotifier.templates.orderReady  // Use the order ready template
          );
          
          console.log("WhatsApp delivery notification result:", notificationResult);
        } catch (notificationError) {
          console.error('Failed to send WhatsApp notification:', notificationError);
          // Continue with the order process even if notification fails
        }
      }

      res.status(200).send({ message: "Order completed successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  // Update the cancelOrder function
  cancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;
      if (!orderId) {
        return res.status(400).send({ message: "Please provide order id" });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }

      order.status = "cancelled";
      await order.save();

      // Send WhatsApp notification if it's a delivery order and phone number is provided
      if (order.order_type === 'delivery' && order.customer_phone && order.address !== 'In Branch') {
        try {
          console.log(`Attempting to send order cancellation notification to: ${order.customer_phone}`);
          const message = `Hello ${order.customer_name}, we regret to inform you that your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled due to unforeseen circumstances.`;
          const notificationResult = await whatsappNotifier.sendWhatsAppMessage(order.customer_phone, message);
          if (notificationResult.success) {
            console.log(`Order cancellation notification sent successfully to: ${order.customer_phone}`);
          } else {
            console.log(`Failed to send order cancellation notification to: ${order.customer_phone}`);
          }
        } catch (notificationError) {
          console.error(`Error sending order cancellation notification to ${order.customer_phone}:`, notificationError);
        }
      }

      res.status(200).send({ message: "Order cancelled successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  // Updated markOrderReady function with email notification
  markOrderReady: async (req, res) => {
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

      // Generate a unique order number
      const orderNumber = order._id.toString().slice(-6).toUpperCase();
      
      // Generate estimated delivery time (30 minutes from now)
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const estimatedTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Only send notifications if it's a delivery order and not "In Branch"
      if (order.order_type === 'delivery' && order.address !== 'In Branch') {
        // Send WhatsApp notification if phone number is provided
        if (order.customer_phone && order.customer_phone.trim() !== '') {
          try {
            console.log(`Attempting to send order ready notification to: ${order.customer_phone}`);
            const message = `Hello ${order.customer_name}, your order #${orderNumber} is ready for delivery. Estimated delivery time: ${estimatedTime}.`;
            const notificationResult = await whatsappNotifier.sendWhatsAppMessage(order.customer_phone, message);
            if (notificationResult.success) {
              console.log(`Order ready notification sent successfully to: ${order.customer_phone}`);
            } else {
              console.log(`Failed to send order ready notification to: ${order.customer_phone}`);
            }
          } catch (notificationError) {
            console.error(`Error sending order ready notification to ${order.customer_phone}:`, notificationError);
            // Continue with the order process even if notification fails
          }
        }
        
        // Send email notification if email is provided
        const emailTarget = order.customer_email || process.env.ADMIN_EMAIL;
        if (emailTarget) {
          try {
            console.log("Sending order ready email notification to:", emailTarget);
            
            // Create email content
            const emailContent = emailNotifier.createOrderReadyEmail(
              order.customer_name,
              orderNumber,
              {
                orderType: order.order_type,
                estimatedTime
              }
            );
            
            // Send the email notification
            const emailResult = await emailNotifier.sendEmail(
              emailTarget,
              `Your Order is Ready #${orderNumber} - Habib Catering`,
              emailContent
            );
            
            if (emailResult.success) {
              console.log("Email notification sent successfully to:", emailTarget);
            } else {
              console.log("Email notification failed:", emailResult.error);
            }
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Continue with the order process even if email fails
          }
        }
      }

      res.status(200).send({ message: "Order marked as ready" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getTaxes: async (req, res) => {
    try {
      const { branchId } = req;
      if (!branchId) {
        return res.status(400).send({ message: "Please provide branch id" });
      }
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }
      res
        .status(200)
        .send({ cash_tax: branch.cash_tax, card_tax: branch.card_tax });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getBranchStatus: async (req, res) => {
    try {
      const { branchId } = req;
      if (!branchId) {
        return res.status(400).send({ message: "Please provide branch id" });
      }
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }
      res.status(200).send({ status: branch.shift_status });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  
  getCashierProfile: async (req, res) => {
    try {
      // Log the entire request to see what's available
      console.log("Cashier Profile Request:", {
        userId: req.id,
        role: req.role,
        shopId: req.shopId,
        branchId: req.branchId,
      });

      // Check if we have a cashier ID
      if (!req.id) {
        return res.status(400).json({ message: "Cashier ID not found" });
      }

      // Find the cashier in database
      const cashier = await Cashier.findById(req.id);
      if (!cashier) {
        return res.status(404).json({ message: "Cashier not found" });
      }

      // Get shop information
      const shop = await Shop.findById(req.shopId);

      // Get branch information
      const branch = await Branch.findById(req.branchId);

      // Return cashier profile with shop and branch information
      return res.status(200).json({
        cashier: {
          _id: cashier._id,
          username: cashier.username,
          salary: cashier.salary || 0,
          joining_date: cashier.joining_date,
          salary_due_date: cashier.salary_due_date,
          status: cashier.status,
        },
        shop: shop
          ? {
              _id: shop._id,
              name: shop.shop_name,
              logo: shop.logo || "",
            }
          : null,
        branch: branch
          ? {
              _id: branch._id,
              name: branch.branch_name,
              address: branch.address,
              city: branch.city,
              contact: branch.contact,
            }
          : null,
      });
    } catch (error) {
      console.error("Error in getCashierProfile:", error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Update cashier profile information
   */
  updateCashierProfile: async (req, res) => {
    try {
      console.log("Cashier Profile Update Request:", {
        userId: req.id,
        role: req.role,
        shopId: req.shopId,
        branchId: req.branchId,
      });

      // Check if we have a cashier ID
      if (!req.id) {
        return res.status(400).json({ message: "Cashier ID not found" });
      }

      // Find the cashier in database
      const cashier = await Cashier.findById(req.id);
      if (!cashier) {
        return res.status(404).json({ message: "Cashier not found" });
      }

      // Extract update data from request
      const { username, currentPassword, newPassword } = req.body;

      // For any update, current password is required
      if ((username !== cashier.username || newPassword) && !currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required to update profile" });
      }

      // Check current password if provided
      if (currentPassword) {
        const isMatch = await cashier.comparePassword(currentPassword);

        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect" });
        }

        // Update username if provided and different
        if (username && username !== cashier.username) {
          // Check if username already exists for this shop and branch
          const existingCashier = await Cashier.findOne({
            username,
            shop_id: cashier.shop_id,
            branch_id: cashier.branch_id,
            _id: { $ne: req.id },
          });

          if (existingCashier) {
            return res
              .status(400)
              .json({ message: "Username already exists for this branch" });
          }

          cashier.username = username;
        }

        // Update password if new password provided
        if (newPassword) {
          // Validate password strength
          if (newPassword.length < 4) {
            return res
              .status(400)
              .json({ message: "Password must be at least 4 characters long" });
          }

          // New password will be hashed by pre-save middleware
          cashier.password = newPassword;
        }
      }

      // Save updated cashier
      await cashier.save();

      // Return updated profile (excluding password)
      return res.status(200).json({
        message: "Profile updated successfully",
        cashier: {
          _id: cashier._id,
          username: cashier.username,
          salary: cashier.salary || 0,
          joining_date: cashier.joining_date,
          salary_due_date: cashier.salary_due_date,
          status: cashier.status,
        },
      });
    } catch (error) {
      console.error("Error in updateCashierProfile:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = cashierController;