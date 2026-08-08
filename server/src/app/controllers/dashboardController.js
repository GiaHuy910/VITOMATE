const User = require("../models/User");
// const {
//   mongooseToObject,
//   multipleMongooseToObject,
// } = require("../../utils/mongoose");

class DashboardController {
  //[GET] /
  index(req, res, next) {
    res.json({ message: "This is dashboard" });
  }
}
module.exports = new DashboardController();
