const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
  shopName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  branch_ids: {
    type: Array,
    default: [],
  },
  product_ids: {
    type: Array,
    default: [],
  },
  websiteLink: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  NTN: {
    type: String,
    required: true,
  },
  tax_integration: {
    type: Boolean,
    default: false,
  },
  total_tables: {
    type: Number,
    required: true,
  },
  social_media_links: {
    type: Array,
    default: [],
  },
});

ShopSchema.pre("save", async function (next) {
  const shop = this;
  if (shop.isModified("password")) {
    shop.password = await bcrypt.hash(shop.password, 8);
  }
  next();
});

ShopSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Shop = mongoose.model("Shop", ShopSchema);
