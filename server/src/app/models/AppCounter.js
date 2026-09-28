const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppCounterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  sequence: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("AppCounter", AppCounterSchema);
