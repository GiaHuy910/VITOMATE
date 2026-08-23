const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RepoCounterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },

  sequence: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("RepoCounter", RepoCounterSchema);
