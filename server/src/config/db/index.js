const mongoose = require("mongoose");
async function connect() {
  try {
    await mongoose.connect("mongodb://localhost:27017/VITOMATE");
    console.log("connect sucessfully");
  } catch (error) {
    console.error("Connect failed:", error);
  }
}
module.exports = { connect };
