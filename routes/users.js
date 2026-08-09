const express = require('express')
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const userController = require("../controllers/userController");

router.post("/login", catchErrors(userController.login));
router.get("/profile", catchErrors(userController.profile));
// router.post("/register", catchErrors(userController.register));

module.exports = router;