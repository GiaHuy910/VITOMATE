const authRouter = require("./auth");
const dashboardRouter = require("./dashboard");
const usersRouter = require("./users");
function route(app) {
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/", dashboardRouter);
}
module.exports = route;
