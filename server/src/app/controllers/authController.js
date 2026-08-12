const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
// const {
//   mongooseToObject,
//   multipleMongooseToObject,
// } = require("../../utils/mongoose");
const { getNextUserId } = require("../../utils/getNextUserId");

class AuthController {
  //[POST] /auth/signup
  async signup(req, res, next) {
    try {
      const { username, email, password } = req.body;

      //business validation
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

      const userId = await getNextUserId();

      //tao user
      const user = await User.create({
        userId,
        username,
        email,
        password: passwordHash,
      });

      return res.status(201).json({
        message: "Account created successfully",
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  //[POST] /auth/signin
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
      const token = jwt.sign(
        {
          sub: user.userId,
        },
        process.env.JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "1h",
        },
      );

      return res.status(200).json({
        message: "Sign in successful",
        token,
        user: {
          userId: user.userId,
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
  //[GET] /auth/me
  async me(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const token = authHeader.slice(7);
      if (!token) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ userId: decodedPayload.sub });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      return res.status(200).json({
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
  }
}
module.exports = new AuthController();
