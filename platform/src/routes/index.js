const workerRouter = require("./workerRoutes");
const builderRouter = require("./builderRoutes");
const deployerRouter = require("./deployerRoutes");

function route(app) {
  app.use("/api/builders", builderRouter);
  app.use("/api/workers", workerRouter);
  app.use("/api/deployers", deployerRouter);
}

module.exports = route;
