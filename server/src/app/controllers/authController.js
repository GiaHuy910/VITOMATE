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

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Sign in successful",
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
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          message: "Unauthorized",
        });
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
    res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
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

      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL,
          }),
        },
      );

      const tokenData = await tokenResponse.json();
      const githubAccessToken = tokenData.access_token;

      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubAccessToken}`,
        },
      });

      const githubUser = await githubUserResponse.json();

      const githubEmailResponse = await fetch(
        "https://api.github.com/user/emails",
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${githubAccessToken}`,
          },
        },
      );

      const githubEmails = await githubEmailResponse.json();

      const primaryEmail = githubEmails.find(
        (email) => email.primary && email.verified,
      );
      const email = primaryEmail?.email;

      let user = await User.findOne({
        githubId: String(githubUser.id),
      });

      if (!user) {
        user = await User.findOne({
          email,
        });

        if (user) {
          //link github vao acc hien tai
          user.githubId = String(githubUser.id);
          await user.save();
        } else {
          const userId = await getNextUserId();

          user = await User.create({
            userId,
            githubId: String(githubUser.id),
            username: githubUser.login,
            email,
          });
        }
      }
      // 11. Tạo JWT của VITOMATE
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
      // Redirect về FE
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      return res.redirect(`http://localhost:5173/`);
    } catch (error) {
      console.error("GITHUB authorization error :", error);

      return res.status(500).json({ message: "Github authorization failed!" });
    }
  }
}
module.exports = new AuthController();
