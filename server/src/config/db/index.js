const mongoose = require("mongoose");
async function connect() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("connect DB sucessfully");
  } catch (error) {
    console.error("Connect failed:", error);
  }
}
module.exports = { connect };
