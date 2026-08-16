const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const usersController = require("../app/controllers/usersController");

router.patch("/me", authenticate, usersController.updateUser);
router.get("/me", authenticate, usersController.me);

module.exports = router;
