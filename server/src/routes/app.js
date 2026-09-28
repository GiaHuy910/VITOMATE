const express = require("express");
const router = express.Router();

const AppController = require("../app/controllers/appController");

router.post("/deploy", AppController.deploy);

module.exports = router;
