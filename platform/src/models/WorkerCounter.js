const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkerCounterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  sequence: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("WorkerCounter", WorkerCounterSchema);
