const User = require("../models/User");
const {
  mongooseToObject,
  multipleMongooseToObject,
} = require("../../utils/mongoose");

class UserController {
  //[POST] /users/store
  store(req, res, next) {
    const user = new User(req.body);
    user
      .save()
      .then(() => res.redirect("/"))
      .catch(next);
  }
}
module.exports = new UserController();
