const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const repoController = require("../app/controllers/repoController");

router.get("/getrepo", repoController.getrepo);
router.post("/check", repoController.check);
router.post("/store", authenticate, repoController.store);

module.exports = router;
