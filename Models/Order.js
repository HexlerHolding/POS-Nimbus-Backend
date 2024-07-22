const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  cart: [
    {
      product_id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  customer_name: {
    type: String,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  order_type: {
    type: String,
    required: true,
    enum: ["online", "branch"],
  },
  order_status: {
    type: String,
    default: "pending",
  },
  time: {
    type: Date,
    default: new Date(),
  },
  tax: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  complaints: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  refund_items: {
    type: Boolean,
    default: false,
  },
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;