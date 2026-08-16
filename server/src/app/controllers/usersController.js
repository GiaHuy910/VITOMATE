const User = require("../models/User");
// const {
//   mongooseToObject,
//   multipleMongooseToObject,
// } = require("../../utils/mongoose");

class UsersController {
  //[GET] /users/me
  async me(req, res, next) {
    try {
      const user = await User.findOne(
        { userId: req.user.sub },
        { _id: 0, userId: 1, displayname: 1, username: 1, email: 1 },
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Get user info error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}

module.exports = new UsersController();
