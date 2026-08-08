const express = require("express");
const router = express.Router();

const signController = require("../app/controllers/signController");

router.post("/store", signController.store);

module.exports = router;
