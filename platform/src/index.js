const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const config = require("./config");
const route = require("./routes");
const { reassignTimedOutDeployJobs } = require("./services/buildJobService");
const db = require("./config/db/mongodb");

const app = express();

//connect to env
dotenv.config();

// Connect to the database
db.connect();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

route(app);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

setInterval(() => {
  reassignTimedOutDeployJobs(30).catch((err) =>
    console.error("[Watchdog Error]:", err.message),
  );
}, 10000);

app.listen(config.port, () => {
  console.log(`VITOMATE Platform is running on port ${config.port}`);
});
