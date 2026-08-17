const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");
const usersController = require("../app/controllers/usersController");

router.delete("/me/avatar", authenticate, usersController.deleteUserAvatar);
router.patch(
  "/me/avatar",
  authenticate,
  upload.single("avatar"),
  usersController.updateUserAvatar,
);
router.patch("/me", authenticate, usersController.updateUser);
router.get("/me", authenticate, usersController.me);

module.exports = router;
