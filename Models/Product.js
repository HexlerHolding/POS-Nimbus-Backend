const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VariationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  options: [{
    name: {
      type: String,
      required: true
    },
    additionalCharge: {
      type: Number,
      default: 0
    }
  }]
});

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  variations: {
    type: [VariationSchema],
    default: [],
  },
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  shop_id: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
});

ProductSchema.index({ shop_id: 1, name: 1 }, { unique: true });

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
