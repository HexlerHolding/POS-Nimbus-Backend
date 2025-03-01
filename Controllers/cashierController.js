const Order = require("../Models/Order");
const Product = require("../Models/Product");
const Branch = require("../Models/Branch");
const Cashier = require("../Models/Cashier");
const Shop = require("../Models/Shop");

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

  addOrder: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const {
        products,
        total,
        grand_total,
        customer_name,
        payment_method,
        order_type,
        tax,
        discount,
        address,
      } = req.body;

      console.log(req.body);

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

      const cart = products.map((product) => {
        return {
          product_id: product._id,
          product_name: product.name,
          quantity: product.quantity,
          price: product.price,
        };
      });

      console.log(cart);

      const order = new Order({
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
      });

      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }
      

      // add grand total to branch sales
      branch.sales.push({ date: new Date(), amount: grand_total });
      console.log(branch.sales);
      await order.save();
      await branch.save();

      res.status(200).send({ message: "Order placed successfully", order });
    } catch (error) {
      console.log(error);
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

      res.status(200).send({ message: "Order completed successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

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

      res.status(200).send({ message: "Order cancelled successfully" });
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
      console.log('Cashier Profile Request:', {
        userId: req.id,
        role: req.role,
        shopId: req.shopId,
        branchId: req.branchId
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
          status: cashier.status
        },
        shop: shop ? {
          _id: shop._id,
          name: shop.shop_name,
          logo: shop.logo || ""
        } : null,
        branch: branch ? {
          _id: branch._id,
          name: branch.branch_name,
          address: branch.address,
          city: branch.city,
          contact: branch.contact
        } : null
      });
    } catch (error) {
      console.error('Error in getCashierProfile:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  /**
   * Update cashier profile information
   */
  updateCashierProfile: async (req, res) => {
    try {
      console.log('Cashier Profile Update Request:', {
        userId: req.id,
        role: req.role,
        shopId: req.shopId,
        branchId: req.branchId
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
      const { 
        username,
        currentPassword, 
        newPassword
      } = req.body;
      
      // For any update, current password is required
      if ((username !== cashier.username || newPassword) && !currentPassword) {
        return res.status(400).json({ message: "Current password is required to update profile" });
      }
      
      // Check current password if provided
      if (currentPassword) {
        const isMatch = await cashier.comparePassword(currentPassword);
        
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        
        // Update username if provided and different
        if (username && username !== cashier.username) {
          // Check if username already exists for this shop and branch
          const existingCashier = await Cashier.findOne({ 
            username, 
            shop_id: cashier.shop_id,
            branch_id: cashier.branch_id,
            _id: { $ne: req.id } 
          });
          
          if (existingCashier) {
            return res.status(400).json({ message: "Username already exists for this branch" });
          }
          
          cashier.username = username;
        }
        
        // Update email if provided
      
        
        // Update password if new password provided
        if (newPassword) {
          // Validate password strength
          if (newPassword.length < 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters long" });
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
          status: cashier.status
        }
      });
    } catch (error) {
      console.error('Error in updateCashierProfile:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = cashierController;
