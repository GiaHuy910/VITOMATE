const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const config = require("./config/config");
const route = require("./routes");
const { reassignTimedOutDeployJobs } = require("./services/buildJobService");
const db = require("./config/db/mongodb");

const app = express();

// Connect to the database
db.connect();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

route(app);

setInterval(() => {
  reassignTimedOutDeployJobs(30).catch((err) =>
    console.error("[Watchdog Error]:", err.message),
  );
}, 10000);

app.listen(config.master.port, () => {
  console.log(`VITOMATE Platform is running on port ${config.master.port}`);
});
