const express = require("express");

const config = require("./config");

const vmRouter = require("./routes/vm.routes");
const agentRouter = require("./routes/agent.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "vitomate-platform",
    status: "ok",
  });
});

app.use("/api/vms", vmRouter);

app.use("/api/agents", agentRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(config.port, () => {
  console.log(`VITOMATE Platform is running on port ${config.port}`);
});
