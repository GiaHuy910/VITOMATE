const express = require("express");

const vmController = require("../controllers/vm.controller");

const router = express.Router();

router.post("/", vmController.createVM);

router.get("/", vmController.getAllVMs);

router.get("/:id", vmController.getVM);

router.patch("/:id", vmController.updateVM);

router.delete("/:id", vmController.deleteVM);

module.exports = router;
