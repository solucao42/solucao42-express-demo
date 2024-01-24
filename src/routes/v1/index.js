const express = require("express");

const { InfoController, PagesController } = require("../../controllers");

const router = express.Router();

router.get("/info", InfoController.info);
router.get("/pages", (req, res) => PagesController.index(req, res));
router.post("/pages", (req, res) => PagesController.create(req, res));

module.exports = router;
