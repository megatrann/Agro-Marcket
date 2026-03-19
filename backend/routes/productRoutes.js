const express = require("express");
const {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, upload.array("images", 8), createProduct);
router.put("/:id", authMiddleware, upload.array("images", 8), updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
