const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  cart: [
    {
      product_id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      product_name: {  
        type: String,
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
  grand_total: {
    type: Number,
    required: true,
  },
  customer_name: {
    type: String,
    required: true,
  },
  customer_phone: {
    type: String,
    required: false,
  },
  customer_address: {
    type: String,
    required: false,
  },
   customer_email: {
      type: String,
      trim: true,
    },
  payment_method: {
    type: String,
    required: true,
    enum: ["cash", "card", "online"],
  },
  order_type: {
    type: String,
    required: true,
    enum: ["delivery", "takeaway", "dine-in"],
  },
  status: {
    type: String,
    default: "pending",
  },
  time: {
    type: Date,
    default: Date.now,
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
  completion_time: {
    type: Date,
  },
  shop_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  branch_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  // New fields from ordering system
  delivery_charges: {
    type: Number,
    default: 0,
  },
  comment: {
    type: String,
    required: false,
  },
  source_system: {
    type: String,
    enum: ["pos", "ordering-system", "website", "mobile-app"],
    default: "pos",
  },
  ordering_system_id: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  // GST from ordering system (if different from tax)
  gst: {
    type: Number,
    required: false,
  },
  // Branch name (in addition to branch_id)
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;