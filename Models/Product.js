const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Shop = require("./Shop");
const Branch = require("./Branch");
const Category = require("./Category");

const ProductSchema = new Schema({
  product_name: {
    type: String,
    required: true,
  },
  product_image: {
    type: String,
    required: true,
  },
  product_description: {
    type: String,
    required: true,
  },
  variation: {
    type: Array,
    default: [],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  product_price: {
    type: Number,
    required: true,
  },
  product_status: {
    type: Boolean,
    default: true,
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
  branch_ids: {
    type: Array,
    default: [],
  },
});
