const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShiftSchema = new Schema({
  branch_id: {
    type: String,
    required: true,
  },
  day_number: {
    type: Number,
    required: true,
  },
  opening_time: {
    type: String,
    required: true,
  },
  closing_time: {
    type: String,
    required: true,
  },
  shift_status: {
    type: Boolean,
    default: false,
  },
});

const Shift = mongoose.model("Shift", ShiftSchema);

module.exports = Shift;
