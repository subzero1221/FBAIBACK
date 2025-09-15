const express = require("express");
const { protect } = require("../controllers/authController");
const { createPaymentSession } = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-checkout-session/", protect, createPaymentSession);

module.exports = router;
