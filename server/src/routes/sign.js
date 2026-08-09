const express = require("express");
const router = express.Router();

const signController = require("../app/controllers/signController");

router.post("/signup", signController.signup);
router.post("/signin", signController.signin);

module.exports = router;
