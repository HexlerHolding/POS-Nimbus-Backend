const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const KitchenSchema = new Schema({
  username: {
    type: String,
    required: true,   
  },
  password: {
    type: String,
    required: true,
  },
  branch_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  shop_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

KitchenSchema.pre("save", async function (next) {
  const kitchen = this;
  if (kitchen.isModified("password")) {
    kitchen.password = await bcrypt.hash(kitchen.password, 8);
  }
  next();
});

KitchenSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

KitchenSchema.index(
  { shop_id: 1, branch_id: 1, username: 1 },
  { unique: true }
);

const Kitchen = mongoose.model("Kitchen", KitchenSchema);
module.exports = Kitchen;
