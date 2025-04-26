const Shop = require("../Models/Shop");
const Branch = require("../Models/Branch");
const Cashier = require("../Models/Cashier");
const Product = require("../Models/Product");
const Category = require("../Models/Category");
const Order = require("../Models/Order");
const Kitchen = require("../Models/Kitchen");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Manager = require("../Models/Manager")
const multer = require("multer");
const admin = require("firebase-admin");
const { getProducts } = require("./cashierController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const managerController = {
  getBranch: async (req, res) => {
    try {
      var shopId = req.shopId;
      if (!shopId) {
        shopId = req.params.shopId;
      }
      if (!shopId) {
        return res.status(400).send({ message: "Please provide shop name" });
      }

      var branchId = req.branchId;
      if (!branchId) {
        branchId = req.params.branchId;
      }
      if (!branchId) {
        return res.status(400).send({ message: "Please provide branch name" });
      }

      const shop = await Shop.findOne({ _id: shopId });

      if (!shop) {
        return res.status(404).send({ message: "Shop not found" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });

      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      res.status(200).send(branch);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  getSales: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const { startDate, endDate } = req.query;

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });

      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      let sales = 0;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        sales = branch.sales.filter((sale) => {
          const saleDate = new Date(sale.date);
          return saleDate >= start && saleDate <= end;
        });
      } else {
        sales = branch.sales;
      }

      res.status(200).send({ sales });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },

  addCashier: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      const cashier = new Cashier({
        shop_id: shopId,
        branch_id: branch._id,
        username,
        password,
      });
      await cashier.save();

      res
        .status(201)
        .json({ message: "Cashier created successfully", cashier });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getCashiers: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop name" });
      }

      const branchId = req.branchId;
      const branchName = req.branchName;
      if (!branchId || !branchName) {
        return res.status(400).json({ message: "Please provide branch name" });
      }

      const cashiers = await Cashier.find({
        shop_id: shopId,
        branch_id: branchId,
      });

      res.status(200).json({ cashiers, branchName });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  addKitchen: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      const kitchen = new Kitchen({
        shop_id: shopId,
        branch_id: branch._id,
        username,
        password,
      });
      await kitchen.save();

      res
        .status(201)
        .json({ message: "Kitchen created successfully", kitchen });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  getKitchens: async (req, res) => {
    try {
      const shopId = req.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Please provide shop name" });
      }

      const branchId = req.branchId;
      const branchName = req.branchName;
      if (!branchId || !branchName) {
        return res.status(400).json({ message: "Please provide branch name" });
      }

      const kitchens = await Kitchen.find({
        shop_id: shopId,
        branch_id: branchId,
      });

      res.status(200).json({ kitchens, branchName });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  addProduct: [
    upload.single("image"),
    async (req, res) => {
      try {
        const shopId = req.shopId;
        if (!shopId) {
          return res.status(400).json({ message: "Please provide shop name" });
        }

        console.log("body", req.body);
        console.log("file", req.file);

        const { name, description, price, category } = req.body;
        const image = req.file;

        if (!name || !description || !price || !category) {
          return res.status(400).json({ message: "Please fill in all fields" });
        }

        if (!image) {
          return res.status(400).json({ message: "Please upload an image" });
        }

        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        const file = bucket.file(`products/${uuid}`);

        await file.save(image.buffer, {
          metadata: {
            contentType: image.mimetype,
            firebaseStorageDownloadTokens: uuid,
          },
        });

        const prodExists = await Product.findOne({
          shop_id: shopId,
          name,
        });
        if (prodExists) {
          return res.status(400).json({ message: "Product already exists" });
        }

        const cat = await Category.findOne({
          shop_id: shopId,
          category_name: category,
        });
        if (!cat) {
          return res.status(404).json({ message: "Category not found" });
        }

        const product = new Product({
          shop_id: shopId,
          name,
          description,
          image: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/products%2F${uuid}?alt=media&token=${uuid}`,
          price,
          category: cat._id,
        });
        await product.save();

        res.status(201).json({ message: "Product created successfully" });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
      }
    },
  ],

  getProducts: async (req, res) => {
    try {
      const { shopId } = req;
      if (!shopId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const products = await Product.find({
        shop_id: shopId,
        status: true,
      }).populate({
        path: "category",
        select: "category_name",
      });

      res.status(200).json({ products });
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
      console.log(categories);
      res.status(200).json(categories);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },

  updateBranchTimings: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const { branchGot } = req.body;

      const { opening_time, closing_time } = branchGot;
      if (!opening_time || !closing_time) {
        return res.status(400).send({ message: "Please provide timings" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      branch.opening_time = opening_time;
      branch.closing_time = closing_time;
      await branch.save();

      res.status(200).send({ message: "Timings updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  openBranch: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      branch.shift_status = true;
      branch.day_number = branch.day_number + 1;

      await branch.save();

      res.status(200).send({ message: "Branch opened successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  closeBranch: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      branch.shift_status = false;

      await branch.save();

      res.status(200).send({ message: "Branch closed successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  updateCashOnHand: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const { cash_on_hand } = req.body;
      if (!cash_on_hand) {
        return res.status(400).send({ message: "Please provide cash on hand" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      branch.cash_on_hand = cash_on_hand;
      await branch.save();

      res.status(200).send({ message: "Cash on hand updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },

  getBranchOrders: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      const orders = await Order.find({
        shop_id: shopId,
        branch_id: branchId,
      }).sort({ _id: -1 });

      res.status(200).send({ orders });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },
// Add this new function to managerController

addCategory: async (req, res) => {
  try {
    const shopId = req.shopId;
    if (!shopId) {
      return res.status(400).json({ message: "Please provide shop ID" });
    }

    const { categoryName } = req.body;
    if (!categoryName) {
      return res.status(400).json({ message: "Please provide category name" });
    }

    // Check if category already exists
    const categoryExists = await Category.findOne({
      shop_id: shopId,
      category_name: categoryName,
    });

    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create new category
    const category = new Category({
      shop_id: shopId,
      category_name: categoryName,
    });

    await category.save();

    res.status(201).json({ 
      message: "Category created successfully",
      category: category
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
},

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

    // Check if category exists
    const category = await Category.findOne({
      _id: categoryId,
      shop_id: shopId,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if another category with the same name exists
    const categoryExists = await Category.findOne({
      shop_id: shopId,
      category_name: categoryName,
      _id: { $ne: categoryId },
    });

    if (categoryExists) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    // Update category
    category.category_name = categoryName;
    await category.save();

    res.status(200).json({ 
      message: "Category updated successfully",
      category: category
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
},

deleteCategory: async (req, res) => {
  try {
    const shopId = req.shopId;
    if (!shopId) {
      return res.status(400).json({ message: "Please provide shop ID" });
    }

    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ message: "Please provide category ID" });
    }

    // Check if category exists
    const category = await Category.findOne({
      _id: categoryId,
      shop_id: shopId,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if products are using this category
    const productsUsingCategory = await Product.countDocuments({
      shop_id: shopId,
      category: categoryId,
      status: true,
    });

    if (productsUsingCategory > 0) {
      // Instead of deleting, we can mark it as inactive
      category.status = false;
      await category.save();
      return res.status(200).json({ 
        message: "Category has been deactivated as it is being used by products",
        category: category
      });
    }

    // Delete category if not being used
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({ 
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
},
  updateTax: async (req, res) => {
    try {
      const { shopId, branchId } = req;
      if (!shopId || !branchId) {
        return res.status(400).send({ message: "Please provide ids" });
      }

      const { cardTax, cashTax } = req.body;
      if (!cardTax && !cashTax) {
        return res.status(400).send({ message: "Please provide tax" });
      }

      const branch = await Branch.findOne({
        shop_id: shopId,
        _id: branchId,
      });
      if (!branch) {
        return res.status(404).send({ message: "Branch not found" });
      }

      if (cardTax !== undefined && cardTax !== null) {
        branch.card_tax = cardTax;
      }
      if (cashTax !== undefined && cashTax !== null) {
        branch.cash_tax = cashTax;
      }

      await branch.save();

      res.status(200).send({ message: "Tax updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  },
  getManagerProfile: async (req, res) => {
    try {
      // Log the entire request to see what's available
      console.log('Manager Profile Request:', {
        userId: req.userId,
        id: req.id,
        role: req.role,
        shopId: req.shopId,
        branchId: req.branchId
      });
  
      // Use req.id if req.userId is not available
      const managerId = req.userId || req.id;
      
      if (!managerId) {
        return res.status(400).json({ message: "Manager ID not found" });
      }
    
      // Find manager in database
      const manager = await Manager.findById(managerId).select("-password");
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }
    
      // Get branch and shop information
      const branch = await Branch.findById(manager.branch_id);
      const shop = branch ? await Shop.findById(branch.shop_id) : null;
      
      // Return manager profile with branch and shop information
      res.status(200).json({
        manager: {
          _id: manager._id,
          username: manager.username,
          email: manager.email,
          first_name: manager.first_name,
          last_name: manager.last_name,
          contact: manager.contact,
          role: "manager"
        },
        branch: branch ? {
          _id: branch._id,
          name: branch.branch_name,
          address: branch.address,
          city: branch.city,
          contact: branch.contact
        } : null,
        shop: shop ? {
          _id: shop._id,
          name: shop.name
        } : null
      });
    } catch (error) {
      console.error('Error in getManagerProfile:', error);
      res.status(500).json({ message: error.message });
    }
  },
  updateManagerProfile: async (req, res) => {
    try {
      const bcrypt = require('bcryptjs'); // Make sure to import bcrypt at the top of the file
      
      const managerId = req.userId || req.id;
      console.log('Manager Profile Request:', {
        id: req.id,
        role: req.role,
        shopId: req.shopId,
        branchId: req.branchId
      });
  
      if (!managerId) {
        return res.status(400).json({ message: "Manager ID not found" });
      }
  
      // Find manager in database
      const manager = await Manager.findById(managerId);
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }
  
      // Destructure request body
      const { 
        username, 
        email, 
        currentPassword, 
        newPassword 
      } = req.body;
  
      // Validate current password if trying to update sensitive info
      if ((email !== manager.email || newPassword) && !currentPassword) {
        return res.status(400).json({ message: "Current password is required for updates" });
      }
  
      // Check current password if provided
      if (currentPassword) {
        const isMatch = await manager.comparePassword(currentPassword);
        
        
        if (!isMatch) {
          console.log(isMatch);
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }
  
      // Update username if provided and different
      if (username && username !== manager.username) {
        // Check if username already exists
        const existingUsername = await Manager.findOne({ 
          username, 
          _id: { $ne: managerId } 
        });
        if (existingUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
        manager.username = username;
      }
  
      // Update email if provided and different
      if (email && email !== manager.email) {
        // Check if email already exists
        const existingEmail = await Manager.findOne({ 
          email, 
          _id: { $ne: managerId } 
        });
        if (existingEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }
        manager.email = email;
      }
  
      // Update password if new password provided
      if (newPassword) {
        // Validate password strength (example criteria)
        if (newPassword.length < 4) {
          return res.status(400).json({ message: "Password must be at least 4 characters long" });
        }
  
        // Hash new password
        manager.password = newPassword
      }
  
      // Save updated manager
      await manager.save();
  
      // Return updated profile (excluding password)
      res.status(200).json({
        message: "Profile updated successfully",
        manager: {
          _id: manager._id,
          username: manager.username,
          email: manager.email,
          first_name: manager.first_name,
          last_name: manager.last_name,
          contact: manager.contact,
          role: "manager"
        }
      });
    } catch (error) {
      console.error('Error updating manager profile:', error);
      res.status(500).json({ message: error.message });
    }
  },
  // Add these functions to your managerController.js file

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

    // Option 1: Soft delete by setting status to false
    product.status = false;
    await product.save();
    
    // Option 2: Hard delete (uncomment if you prefer hard delete)
    // await Product.deleteOne({ _id: productId });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}
};


module.exports = managerController;