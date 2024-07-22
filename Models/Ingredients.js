const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Shop = require("./Shop");
const Branch = require("./Branch");

const IngredientSchema = new Schema({
  ingredient_name: {
    type: String,
    required: true,
  },
  ingredient_description: {
    type: String,
    required: true,
  },
  ingredient_status: {
    type: Boolean,
    default: true,
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
});

const Ingredient = mongoose.model("Ingredient", IngredientSchema);

module.exports = Ingredient;
