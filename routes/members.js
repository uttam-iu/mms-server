const express = require('express')
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const memberController = require("../controllers/memberController");

router.get("/", catchErrors(memberController.members));

module.exports = router;