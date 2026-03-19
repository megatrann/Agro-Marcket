const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");
const {
  getOverview,
  getSalesByCategory,
  getTopProducts,
  getTopFarmers,
  getLocationDemand,
} = require("../controllers/analyticsController");

const router = express.Router();

router.use(authMiddleware, adminAuth);

router.get("/overview", getOverview);
router.get("/sales-by-category", getSalesByCategory);
router.get("/top-products", getTopProducts);
router.get("/top-farmers", getTopFarmers);
router.get("/location-demand", getLocationDemand);

module.exports = router;
