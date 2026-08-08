const signRouter = require("./sign");
const dashboardRouter = require("./dashboard");
function route(app) {
  app.use("/sign", signRouter);
  app.use("/", dashboardRouter);
}
module.exports = route;
