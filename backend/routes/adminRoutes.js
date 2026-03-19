const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  updateOrder,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminAuth);

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);

router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrder);

module.exports = router;
