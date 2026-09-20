const workerRouter = require("./workerRoutes");
const builderRouter = require("./builderRoutes");
const deployerRouter = require("./deployerRoutes");
const authenticate = require("../middleware/agentAuth");

function route(app) {
  app.use("/api", authenticate);

  app.use("/api/builders", builderRouter);
  app.use("/api/workers", workerRouter);
  app.use("/api/deployers", deployerRouter);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });
}

module.exports = route;
