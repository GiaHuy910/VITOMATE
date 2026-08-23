const User = require("../models/User");
// const {
//   mongooseToObject,
//   multipleMongooseToObject,
// } = require("../../utils/mongoose");

const cloudinary = require("../../config/cloudinary");
const { uploadToCloudinary } = require("../services/cloudinaryService");

class UsersController {
  //[GET] /users/me
  async me(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findOne(
        { userId },
        { _id: 0, userId: 1, displayname: 1, username: 1, email: 1, avatar: 1 },
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
  //[PATCH] /users/me
  async updateUser(req, res) {
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
          avatar: user.avatar,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  //[PATCH] /users/me/theme
  async updateUserTheme(req, res) {
    try {
      const { theme } = req.body;
      const userId = req.user.userId;
      if (!["Light", "Dark", "System"].includes(theme)) {
        return res.status(400).json({
          message: "Invalid theme",
        });
      }

      const user = await User.findOneAndUpdate(
        { userId },
        { theme },
        { returnDocument: "after" },
      );
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        message: "Theme updated",
        theme: user.theme,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  //[PATCH] /users/me/avatar
  async updateUserAvatar(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Avatar is required",
        });
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "vitomate/avatars",
        public_id: `user_${userId}`,
        overwrite: true,
        resource_type: "image",
      });

      //Lưu thông tin ảnh vào mongodb
      user.avatar = {
        url: result.secure_url,
        publicId: result.public_id,
      };
      await user.save();

      return res.status(200).json({
        message: "Avatar updated successfully",
        user: {
          userId: user.userId,
          displayname: user.displayname,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("Update avatar error:", error);
      return res.status(500).json({
        message: "Failed to update avatar",
      });
    }
  }
  //[DELETE] /users/me/avatar
  async deleteUserAvatar(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (!user.avatar?.publicId) {
        return res.status(404).json({
          message: "Avatar not found",
        });
      }

      await cloudinary.uploader.destroy(user.avatar.publicId);
      user.avatar.url = null;
      user.avatar.publicId = null;
      await user.save();

      return res.status(200).json({
        message: "Avatar deleted successfully",
        user: {
          userId: user.userId,
          displayname: user.displayname,
          username: user.username,
          email: user.email,
          avatar: {
            url: user.avatar.url,
            publicId: user.avatar.publicId,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}

module.exports = new UsersController();
