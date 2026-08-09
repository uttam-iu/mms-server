const express = require('express')
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const menuController = require("../controllers/menuController");

router.get("/", catchErrors(menuController.menus));

module.exports = router;