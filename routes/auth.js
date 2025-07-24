var express = require("express");
var router = express.Router();
const authController = require("../controllers/auth")

router.post("/signUp", authController.signUp)
router.post("/login", authController.login)
router.post("/changePassword", authController.changePassword)
router.post("/forgetPassword", authController.forgetPassword)

module.exports = router