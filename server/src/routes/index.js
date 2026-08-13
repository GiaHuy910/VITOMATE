const authRouter = require("./auth");
const dashboardRouter = require("./dashboard");
function route(app) {
  app.use("/auth", authRouter);
  app.use("/", dashboardRouter);
}
module.exports = route;
