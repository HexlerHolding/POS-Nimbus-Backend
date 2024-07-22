const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    type: [String],
    default: [],
  },
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  product_price: {
    type: Number,
    required: true,
  },
  product_status: {
    type: Boolean,
    default: true,
  },
  shop_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  branch_ids: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
});
