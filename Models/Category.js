const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  category_name: {
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
  shop_id: {
    type: Schema.Types.ObjectId,
    unique: true,
    required: true,
  },
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
