const Shop = require("../Models/Shop");
const Branch = require("../Models/Branch");
const Manager = require("../Models/Manager");
const Category = require("../Models/Category");
const Order = require("../Models/Order");
const Product = require("../Models/Product");
const mongoose = require("mongoose");
const Admin = require("../Models/Admin");

const adminController = {
  getShop: async (req, res) => {
    try {
      var shopId = req.shopId;
      if (!shopId) {
        shopId = req.params.shopId;
      }
      const shop = await Shop.find({ _id: shopId });

      if (!shop) {
        return res.status(404).send({ message: "Shop not found" });
      }
      res.status(200).send(shop);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop ID" });
      }
      
      const { 
        productId, 
        name, 
        description, 
        price, 
        category, 
        variation,
        image,
        status 
      } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Please provide product ID" });
      }
  
      const product = await Product.findOne({ 
        _id: productId,
        shop_id: shopId
      });
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Update fields if provided
      if (name) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = price;
      if (variation !== undefined) product.variation = variation;
      if (image !== undefined) product.image = image;
      if (status !== undefined) product.status = status;
      
      // If category is being changed, validate and update
      if (category) {
        const categoryExists = await Category.findOne({
          _id: category,
          shop_id: shopId,
          status: true
        });
        
        if (!categoryExists) {
          return res.status(404).json({ message: "Category not found" });
        }
        
        product.category = category;
      }
  
      await product.save();
      res.status(200).json({ 
        message: "Product updated successfully",
        product
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // For deleting a product
  deleteProduct: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop ID" });
      }
  
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Please provide product ID" });
      }
  
      const product = await Product.findOne({ 
        _id: productId,
        shop_id: shopId
      });
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      product.status = true;
      await product.save();
  
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  

  getBranches: async (req, res) => {
    try {
      var shopId = req.shopId;
      if (!shopId) {
        shopId = req.params.shopId;
      }
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }
      const shop = await Shop.findOne({ _id: shopId });

      if (!shop) {
        return res.status(404).send({ message: "Shop not found" });
      }

      const branches = await Branch.find({ shop_id: shopId });
      res.status(200).send(branches);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }

      const orders = await Order.find({ shop_id: shopId }).sort({ _id: -1 });
      res.status(200).send(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  getTotalSales: async (req, res) => {
    try {
      var shopId = req.shopId;
      if (!shopId) {
        shopId = req.params.shopId;
      }
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }

      const shop = await Shop.findOne({ _id: shopId });

      if (!shop) {
        return res.status(404).send({ message: "Shop not found" });
      }

      const branches = await Branch.find({ shop_id: shopId });

      const { startDate, endDate } = req.query;
      let totalSales = 0;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).send({ message: "Invalid date format" });
        }

        for (let i = 0; i < branches.length; i++) {
          let branch = branches[i];
          let sales = branch.sales.filter(
            (sale) => new Date(sale.date) >= start && new Date(sale.date) <= end
          );
          totalSales += sales.reduce((acc, sale) => acc + sale.amount, 0);
        }
      } else {
        for (let i = 0; i < branches.length; i++) {
          let branch = branches[i];
          totalSales += branch.sales.reduce(
            (acc, sale) => acc + sale.amount,
            0
          );
        }
      }

      res.status(200).send({ totalSales });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  addBranch: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }

      const {
        branchName,
        address,
        city,
        contact,
        total_tables,
        opening_time,
        closing_time,
        card_tax,
        cash_tax,
      } = req.body;

      if (!branchName || !address || !city || !contact) {
        return res.status(400).send({ message: "Please fill in all fields" });
      }

      const shop = await Shop.findOne({ _id: shopId });

      if (!shop) {
        return res.status(404).send({ message: "Shop not found" });
      }

      const branch = new Branch({
        branch_name: branchName,
        shop_id: shopId,
        address,
        city,
        contact,
        total_tables,
        opening_time,
        closing_time,
        card_tax,
        cash_tax,
      });

      await branch.save();
      res.status(201).send({ message: "Branch created successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

updateBranch: async (req, res) => {
  try {
    const shopId = req.body.shopId;
    if (!shopId) {
      return res.status(400).send({ message: "Please provide shop name" });
    }

    const {
      branchName,
      newName,
      address,
      city,
      contact,
      totalTables,
      openingTime,
      closingTime,
      shiftStatus,
      latitude,
      longitude,
    } = req.body;

    if (!branchName) {
      return res.status(400).send({ message: "Please fill in all required fields" });
    }

    const branch = await Branch.findOne({
      shop_id: shopId,
      branch_name: branchName,
    });

    if (!branch) {
      return res.status(404).send({ message: "Branch not found" });
    }

    branch.branch_name = newName || branchName;
    branch.address = address || branch.address;
    branch.city = city || branch.city;
    branch.contact = contact || branch.contact;
    branch.total_tables = totalTables || branch.total_tables;
    branch.opening_time = openingTime || branch.opening_time;
    branch.closing_time = closingTime || branch.closing_time;
    branch.shift_status = shiftStatus || branch.shift_status;
    branch.latitude = latitude !== undefined ? latitude : branch.latitude;
    branch.longitude = longitude !== undefined ? longitude : branch.longitude;

    await branch.save();

    res.status(200).send({ message: "Branch updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
},

  deleteBranch: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }

      const { branchName } = req.body;

      const branch = await Branch.findOne({
        shop_id: shopId,
        branch_name: branchName,
      });

      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      await branch.delete();

      res.status(200).send({ message: "Branch deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  getManagers: async (req, res) => {
    try {
      var shopId = req.shopId;
      if (!shopId) {
        shopId = req.params.shopId;
      }
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }

      const managers = await Manager.find({ shop_id: shopId }).populate({
        path: "branch_id",
        select: "branch_name",
      });

      res.status(200).send(managers);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  addManager: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop name" });
      }

      const {
        branchName,
        username,
        email,
        password,
        firstName,
        lastName,
        contact,
      } = req.body;
      if (
        !username ||
        !password ||
        !branchName ||
        !email ||
        !firstName ||
        !lastName ||
        !contact
      ) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        branch_name: branchName,
      });
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      const manager = new Manager({
        shop_id: shopId,
        branch_id: branch._id,
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        contact,
      });
      await manager.save();

      branch.manager_ids.push(manager._id);
      await branch.save();

      res.status(201).json({ message: "Manager created successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  updateManager: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop ID" });
      }
  
      const { 
        managerId, 
        username, 
        email, 
        firstName, 
        lastName, 
        contact, 
        branchId 
      } = req.body;
      
      if (!managerId) {
        return res.status(400).json({ message: "Please provide manager ID" });
      }
  
      const manager = await Manager.findOne({ 
        _id: managerId,
        shop_id: shopId
      });
  
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }
  
      // Update fields if provided
      if (username) manager.username = username;
      if (email) manager.email = email;
      if (firstName) manager.first_name = firstName;
      if (lastName) manager.last_name = lastName;
      if (contact) manager.contact = contact;
      
      // If branch is being changed, update branch references
      if (branchId && branchId !== manager.branch_id.toString()) {
        // First, remove manager from old branch
        const oldBranch = await Branch.findById(manager.branch_id);
        if (oldBranch) {
          oldBranch.manager_ids = oldBranch.manager_ids.filter(
            id => id.toString() !== managerId
          );
          await oldBranch.save();
        }
        
        // Then, add manager to new branch
        const newBranch = await Branch.findById(branchId);
        if (!newBranch) {
          return res.status(404).json({ message: "New branch not found" });
        }
        
        newBranch.manager_ids.push(managerId);
        await newBranch.save();
        
        // Update manager's branch reference
        manager.branch_id = branchId;
      }
  
      await manager.save();
      res.status(200).json({ message: "Manager updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // For deleting a manager
  deleteManager: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop ID" });
      }
  
      const { managerId } = req.body;
      
      if (!managerId) {
        return res.status(400).json({ message: "Please provide manager ID" });
      }
  
      const manager = await Manager.findOne({ 
        _id: managerId,
        shop_id: shopId
      });
  
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }
  
      // Remove manager from branch
      const branch = await Branch.findById(manager.branch_id);
      if (branch) {
        branch.manager_ids = branch.manager_ids.filter(
          id => id.toString() !== managerId
        );
        await branch.save();
      }
  
      // Delete the manager
      await Manager.deleteOne({ _id: managerId });
  
      res.status(200).json({ message: "Manager deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

// In adminController.js for addCategory
addCategory: async (req, res) => {
  try {
    // Get shopId from token instead of request body
    const shopId = req.shopId; // Middleware should extract this
    
    const { categoryName } = req.body;
    if (!categoryName) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const category = new Category({
      category_name: categoryName,
      shop_id: shopId,
    });
    await category.save();

    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
},
// Add these methods to your adminController.js file

// For updating a category
updateCategory: async (req, res) => {
  try {
    const shopId = req.shopId;
    if (!shopId) {
      return res.status(400).json({ message: "Please provide shop ID" });
    }

    const { categoryId, categoryName } = req.body;
    
    if (!categoryId || !categoryName) {
      return res.status(400).json({ message: "Please provide category ID and name" });
    }

    const category = await Category.findOne({ 
      _id: categoryId,
      shop_id: shopId
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.category_name = categoryName;
    await category.save();

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
},

// For deleting a category
deleteCategory: async (req, res) => {
  try {
    const shopId = req.shopId;
    if (!shopId) {
      return res.status(400).json({ message: "Please provide shop ID" });
    }

    const { categoryId } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ message: "Please provide category ID" });
    }

    const category = await Category.findOne({ 
      _id: categoryId,
      shop_id: shopId
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Option 1: Soft delete by setting status to false
    category.status = false;
    await category.save();

    // Option 2: Hard delete
    // await Category.deleteOne({ _id: categoryId });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
},


  getCategories: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop name" });
      }

      const categories = await Category.find({ shop_id: shopId, status: true });
      res.status(200).json(categories);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop name" });
      }

      const products = await Product.find({ shop_id: shopId });
      res.status(200).json(products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getNumberOfBranches: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop name" });
      }

      const branches = await Branch.find({ shop_id: shopId });
      res.status(200).json({ numberOfBranches: branches.length });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getBranchesSales: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop name" });
      }

      const branches = await Branch.find({ shop_id: shopId });
      let branchSales = [];
      for (let i = 0; i < branches.length; i++) {
        let branch = branches[i];
        let sales = 0;
        //get all orders for the branch
        const orders = await Order.find({ branch_id: branch._id });
        //sum the total amount of all orders
        for (let j = 0; j < orders.length; j++) {
          sales += orders[j].grand_total;
        }
        branchSales.push({ branch: branch.branch_name, sales });
      }

      res.status(200).json(branchSales);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  getFbrTaxRates: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop ID" });
      }
  
      // TODO: Implement actual FBR API integration
      // This is a placeholder that returns mock data
      // In the future, this would make an actual API call to FBR services
      
      const mockFbrData = {
        card_tax: 2.5,
        cash_tax: 1.5,
        fetched_at: new Date().toISOString(),
        is_mock: true // Flag to indicate this is mock data
      };
      
      res.status(200).json(mockFbrData);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  
  /**
   * Update branch tax rates with rates from FBR
   * This is a placeholder for future implementation
   */
  updateBranchWithFbrTaxes: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop ID" });
      }
  
      const { branchId } = req.body;
      
      if (!branchId) {
        return res.status(400).json({ message: "Please provide branch ID" });
      }
  
      const branch = await Branch.findOne({ 
        _id: branchId,
        shop_id: shopId
      });
  
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
  
      // TODO: Implement actual FBR API integration
      // This is a placeholder that uses mock data
      // In the future, this would make an actual API call to FBR services
      
      const mockFbrData = {
        card_tax: 2.5,
        cash_tax: 1.5
      };
      
      // Update branch with FBR tax rates
      branch.card_tax = mockFbrData.card_tax;
      branch.cash_tax = mockFbrData.cash_tax;
      branch.tax_last_updated = new Date();
      
      await branch.save();
      
      res.status(200).json({ 
        message: "Branch tax rates updated successfully with FBR rates",
        updatedRates: {
          card_tax: branch.card_tax,
          cash_tax: branch.cash_tax,
          last_updated: branch.tax_last_updated
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  getAdminProfile: async (req, res) => {
    try {
      // Log the entire request to see what's available
      console.log('Admin Profile Request:', {
        userId: req.userId,
        _id: req._id,
        role: req.role,
        shopId: req.shopId
      });
      
      // Check if we have a shop ID
      if (!req.shopId) {
        return res.status(400).json({ message: "Shop ID not found" });
      }
      
      // Get shop information directly since admin is the shop
      const shop = await Shop.findById(req.shopId).select("-password");
      
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      // Return shop information as admin profile
      return res.status(200).json({
        admin: {
          _id: shop._id,
          username: shop.shop_name, // Use shop_name as username
          email: shop.email,
          first_name: shop.shop_name.split(' ')[0] || "", // Split shop name for first name
          last_name: shop.shop_name.split(' ').slice(1).join(' ') || "", // Rest of shop name for last name
          contact: shop.contact || "",
          role: "admin",
          // Additional shop-specific fields
          website_link: shop.website_link || "",
          logo: shop.logo || "",
          NTN: shop.NTN || "",
          tax_integration: shop.tax_integration || false,
          social_media_links: shop.social_media_links || [],
          currency: shop.currency || "PKR",
          timezone: shop.timezone || "",
          subscription_plan: shop.subscription_plan || ""
        },
        shop: {
          _id: shop._id,
          name: shop.shop_name,
          email: shop.email,
          website: shop.website_link || "",
          logo: shop.logo || "",
          branch_count: shop.branch_ids ? shop.branch_ids.length : 0,
          product_count: shop.product_ids ? shop.product_ids.length : 0
        }
      });
    } catch (error) {
      console.error('Error in getAdminProfile:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  updateAdminProfile: async (req, res) => {
    try {
      console.log('Admin Profile Update Request:', {
        userId: req.userId,
        _id: req._id,
        role: req.role,
        shopId: req.shopId
      });
      
      // Check if we have a shop ID
      if (!req.shopId) {
        return res.status(400).json({ message: "Shop ID not found" });
      }
      
      // Find the shop 
      const shop = await Shop.findById(req.shopId);
      
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      
      // Extract update data from request
      const { 
        username, 
        email, 
        currentPassword, 
        newPassword,
        firstName,
        lastName,
        contact,
        website_link,
        logo,
        NTN,
        tax_integration,
        social_media_links,
        currency,
        timezone,
        subscription_plan
      } = req.body;
      
      // Validate current password if trying to update sensitive info
      if ((email !== shop.email || newPassword) && !currentPassword) {
        return res.status(400).json({ message: "Current password is required for updates" });
      }
      
      // Check current password if provided
      if (currentPassword) {
        const isMatch = await shop.comparePassword(currentPassword);
        
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }
      
      // Update email if provided and different
      if (email && email !== shop.email) {
        // Check if email already exists
        const existingEmail = await Shop.findOne({ 
          email, 
          _id: { $ne: shop._id } 
        });
        if (existingEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }
        shop.email = email;
      }
      
      // Update shop name (username) if provided
      if (username && username !== shop.shop_name) {
        // Check if shop name already exists
        const existingShop = await Shop.findOne({ 
          shop_name: username, 
          _id: { $ne: shop._id } 
        });
        if (existingShop) {
          return res.status(400).json({ message: "Shop name already exists" });
        }
        shop.shop_name = username;
      }
      
      // Update additional shop fields
      if (website_link !== undefined) shop.website_link = website_link;
      if (logo !== undefined) shop.logo = logo;
      if (NTN !== undefined) shop.NTN = NTN;
      if (tax_integration !== undefined) shop.tax_integration = tax_integration;
      if (social_media_links !== undefined) shop.social_media_links = social_media_links;
      if (currency !== undefined) shop.currency = currency;
      if (timezone !== undefined) shop.timezone = timezone;
      if (subscription_plan !== undefined) shop.subscription_plan = subscription_plan;
      
      // Update password if new password provided
      if (newPassword) {
        // Validate password strength
        if (newPassword.length < 4) {
          return res.status(400).json({ message: "Password must be at least 4 characters long" });
        }
        
        // New password will be hashed by pre-save middleware
        shop.password = newPassword;
      }
      
      // Save updated shop
      await shop.save();
      
      // Return updated profile (excluding password)
      return res.status(200).json({
        message: "Profile updated successfully",
        admin: {
          _id: shop._id,
          username: shop.shop_name,
          email: shop.email,
          first_name: shop.shop_name.split(' ')[0] || "",
          last_name: shop.shop_name.split(' ').slice(1).join(' ') || "",
          contact: shop.contact || "",
          role: "admin",
          website_link: shop.website_link || "",
          logo: shop.logo || "",
          NTN: shop.NTN || "",
          tax_integration: shop.tax_integration || false,
          social_media_links: shop.social_media_links || [],
          currency: shop.currency || "PKR",
          timezone: shop.timezone || "",
          subscription_plan: shop.subscription_plan || ""
        }
      });
    } catch (error) {
      console.error('Error in updateAdminProfile:', error);
      res.status(500).json({ message: error.message });
    }
  }
};
async function handleAdminUpdate(req, res, admin) {
  try {
    // Destructure request body
    const { 
      username, 
      email, 
      currentPassword, 
      newPassword,
      firstName,
      lastName,
      contact
    } = req.body;

    // Validate current password if trying to update sensitive info
    if ((email !== admin.email || newPassword) && !currentPassword) {
      return res.status(400).json({ message: "Current password is required for updates" });
    }

    // Check current password if provided
    if (currentPassword) {
      const isMatch = await admin.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    // Update username if provided and different
    if (username && username !== admin.username) {
      // Check if username already exists
      const existingUsername = await Admin.findOne({ 
        username, 
        _id: { $ne: admin._id } 
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      admin.username = username;
    }

    // Update email if provided and different
    if (email && email !== admin.email) {
      // Check if email already exists
      const existingEmail = await Admin.findOne({ 
        email, 
        _id: { $ne: admin._id } 
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      admin.email = email;
    }

    // Update additional profile fields
    if (firstName) admin.first_name = firstName;
    if (lastName) admin.last_name = lastName;
    if (contact) admin.contact = contact;

    // Update password if new password provided
    if (newPassword) {
      // Validate password strength (example criteria)
      if (newPassword.length < 4) {
        return res.status(400).json({ message: "Password must be at least 4 characters long" });
      }

      // New password will be hashed by pre-save middleware
      admin.password = newPassword;
    }

    // Save updated admin
    await admin.save();

    // Return updated profile (excluding password)
    return res.status(200).json({
      message: "Profile updated successfully",
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        first_name: admin.first_name || "",
        last_name: admin.last_name || "",
        contact: admin.contact || "",
        role: "admin"
      }
    });
  } catch (error) {
    console.error('Error in handleAdminUpdate:', error);
    return res.status(500).json({ message: error.message });
  }
}
module.exports = adminController;
