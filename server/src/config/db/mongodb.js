const mongoose = require("mongoose");

const config = require("../config");
const dbUrlServer = config.database.serverUri;

async function connect() {
  try {
    await mongoose.connect(dbUrlServer);
    console.log("connect DB sucessfully");
  } catch (error) {
    console.error("Connect failed:", error);
  }
}
module.exports = { connect };
