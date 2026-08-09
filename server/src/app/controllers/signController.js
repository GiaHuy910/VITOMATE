const User = require("../models/User");
const {
  mongooseToObject,
  multipleMongooseToObject,
} = require("../../utils/mongoose");

class SignController {
  //[POST] /sign/signup
  signup(req, res, next) {
    const user = new User(req.body);
    user
      .save()
      .then((user) => {
        return res.status(201).json({
          user,
        });
      })
      .catch((error) => {
        if (error.code == 11000) {
          return res.status(409).json({ message: "Email has been used" });
        }
        next(error);
      });
  }
  //[POST] /sign/signin
  signin(req, res, next) {
    const { email, password } = req.body;

    User.findOne({ email, password })
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            message: "Email or password is incorrect!",
          });
        }

        return res.status(200).json({
          user: {
            username: user.username,
            email: user.email,
          },
        });
      })
      .catch(next);
  }
}
module.exports = new SignController();
