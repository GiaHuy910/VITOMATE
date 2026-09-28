const bcrypt = require("bcrypt");

const User = require("../models/User");
const { getNextUserId } = require("../../utils/getNextUserId");
const { getGithubUserInfo } = require("../services/githubService");
const { createJwt } = require("../../utils/jwt");
const { createCbc } = require("../../utils/cbc");
const config = require("../../config/config");
const githubUrl = config.github.url;
const clientUrlDev = config.app.clientUrlDev;

class AuthController {
  //[POST] /auth/signup
  async signup(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const display_name = username;

      //business validation
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(409).json({
          message: "Email or username already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user_id = await getNextUserId();

      const user = await User.create({
        display_name,
        user_id,
        username,
        email,
        password: passwordHash,
      });

      return res.status(201).json({
        message: "Account created successfully",
        user: {
          user_id: user.user_id,
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
      const token = createJwt(user.user_id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Sign in successful",
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          avatar: {
            url: user.avatar.url,
          },
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
      const user_id = req.user.user_id;
      const user = await User.findOne({ user_id });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      return res.status(200).json({
        user: {
          display_name: user.display_name,
          username: user.username,
          email: user.email,
          avatar: {
            url: user.avatar.url,
          },
          theme: user.theme,
        },
      });
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
  }
  //[POST] /auth/logout
  logout(req, res) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logout succesfully" });
  }
  //[GET] /auth/github
  github(req, res) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      scope: "read:user user:email",
    });
    res.redirect(`${githubUrl}/login/oauth/authorize?${params.toString()}`);
  }
  //[GET] /auth/github/callback
  async githubCallback(req, res) {
    try {
      const { code } = req.query;
      if (!code) {
        return res
          .status(400)
          .json({ message: "Authorization code is missing!" });
      }

      const githubUser = await getGithubUserInfo(code);
      const accessToken = githubUser.accessToken;
      //ma hoa cbc
      const encryptedCbc = createCbc(accessToken);

      let user = await User.findOne({
        github_id: githubUser.github_id,
      });

      if (!user) {
        user = await User.findOne({
          email: githubUser.email,
        });
        if (user) {
          //link github vao acc hien tai
          user.github_id = githubUser.github_id;
          await user.save();
        } else {
          const user_id = await getNextUserId();
          user = await User.create({
            display_name: githubUser.username,
            user_id,
            github_id: githubUser.github_id,
            username: githubUser.username,
            email: githubUser.email,
            encrypted_token: encryptedCbc,
          });
        }
      }
      const token = createJwt(user.user_id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, //1 gio
      });
      return res.redirect(`${clientUrlDev}/dashboard`);
    } catch (error) {
      console.error("GITHUB authorization error :", error);
      return res.status(500).json({ message: "Github authorization failed!" });
    }
  }
}
module.exports = new AuthController();
