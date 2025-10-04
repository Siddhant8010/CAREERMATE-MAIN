const express = require("express");
const router = express.Router();
const { Signup, Login} = require("../controller/authcontroller");
const { userVerification } = require("../middleware/authmiddleware");

router.post("/signup", Signup);
router.post("/login", Login);
router.post('/',userVerification)


module.exports = router;