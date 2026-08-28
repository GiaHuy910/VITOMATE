const authRouter = require("./auth");
const dashboardRouter = require("./dashboard");
const usersRouter = require("./users");
const repoRouter = require("./repo");
function route(app) {
  app.use("/auth", authRouter);
  app.use("/repo", repoRouter);
  app.use("/users", usersRouter);
  app.use("/", dashboardRouter);
}
module.exports = route;
