const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Shop = require("./Shop");

const CategorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
  category_image: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  token: {
    type: String,
    required: true,
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
