const bcrypt = require("bcrypt");

const User = require("../models/User");
const {
  mongooseToObject,
  multipleMongooseToObject,
} = require("../../utils/mongoose");

class AuthController {
  //[POST] /sign/signup
  async signup(req, res, next) {
    try {
      const { username, email, password } = req.body;

      //bussiness validation
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(409).json({
          message: "Email or username already exists",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      //tao user
      const user = await User.create({
        username,
        email,
        password: passwordHash,
      });

      return res.status(201).json({
        message: "Account created successfully",
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  //[POST] /sign/signin
  async signin(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      //Jwt,session o day

      return res.status(200).json({
        message: "Sign in successful",
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
module.exports = new AuthController();
