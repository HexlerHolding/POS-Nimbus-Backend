const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Branch = require("./Branch");
const Schema = mongoose.Schema;

const CashierSchema = new Schema({
  username: {
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
  branch_id: {
    type: String,
    required: true,
  },
});

CashierSchema.pre("save", async function (next) {
  const cashier = this;
  if (cashier.isModified("password")) {
    cashier.password = await bcrypt.hash(cashier.password, 8);
  }
  next();
});

CashierSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Cashier = mongoose.model("Cashier", CashierSchema);

module.exports = Cashier;
