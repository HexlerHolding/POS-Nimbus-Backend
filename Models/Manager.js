const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManagerSchema = new Schema({
  shop_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  branch_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

ManagerSchema.pre("save", async function (next) {
  const manager = this;
  if (manager.isModified("password")) {
    manager.password = await bcrypt.hash(manager.password, 8);
  }
  next();
});

ManagerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Manager = mongoose.model("Manager", ManagerSchema);
module.exports = Manager;