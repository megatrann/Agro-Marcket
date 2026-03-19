const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { generateDescription } = require("../controllers/aiController");

const router = express.Router();

router.post("/generate-product-description", authMiddleware, generateDescription);

module.exports = router;
