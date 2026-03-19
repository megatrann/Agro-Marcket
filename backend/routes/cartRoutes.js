const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cartController");

const router = express.Router();

router.use(authMiddleware);

router.post("/add", addToCart);
router.get("/", getCartItems);
router.put("/update/:id", updateCartItem);
router.delete("/remove/:id", removeCartItem);

module.exports = router;
