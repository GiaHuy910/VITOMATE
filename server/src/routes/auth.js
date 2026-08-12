const express = require("express");
const router = express.Router();

const { signupSchema, signinSchema } = require("../app/models/Auth");
const { validate } = require("../middlewares/validate");

const authController = require("../app/controllers/authController");

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/signin", validate(signinSchema), authController.signin);
router.get("/github/callback", authController.githubCallback);
router.get("/github", authController.github);
router.get("/me", authController.me);

module.exports = router;
