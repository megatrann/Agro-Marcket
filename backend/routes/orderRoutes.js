const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createOrderFromCart,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

router.use(authMiddleware);

router.post("/create", createOrderFromCart);
router.get("/my-orders", getMyOrders);
router.get("/seller-orders", getSellerOrders);
router.put("/update-status/:id", updateOrderStatus);

module.exports = router;
