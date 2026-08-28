const workerRouter = require("./workerRoutes");
const builderRouter = require("./builderRoutes");
const deployRouter = require("./deployRoutes");

function route(app) {
  app.use("/api/builders", builderRouter);
  app.use("/api/workers", workerRouter);
  app.use("/api/deployments", deployRouter);
}

module.exports = route;
