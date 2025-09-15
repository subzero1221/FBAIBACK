const express = require("express");
const { protect } = require("../controllers/authController");
const { getMe, updateMe } = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMe);
router.post("/updateMe", protect, updateMe);

module.exports = router;
