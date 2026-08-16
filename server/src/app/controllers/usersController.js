const User = require("../models/User");
// const {
//   mongooseToObject,
//   multipleMongooseToObject,
// } = require("../../utils/mongoose");

class UsersController {
  //[GET] /users/me
  async me(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await User.findOne(
        { userId },
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
  async updateUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const { displayname, username, email } = req.body;

      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (displayname !== undefined) {
        user.displayname = displayname;
      }
      if (username !== undefined) {
        user.username = username;
      }
      if (email !== undefined) {
        user.email = email;
      }
      await user.save();

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          userId: user.userId,
          displayname: user.displayname,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new UsersController();
