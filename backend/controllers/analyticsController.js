const { User, Product, Order, OrderItem } = require("../models");

const toNumber = (value) => Number(value || 0);

const getOverview = async (_req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalProducts,
      totalOrders,
      totalRevenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["farmer", "vendor"] } }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      totalUsers,
      totalFarmers,
      totalProducts,
      totalOrders,
      totalRevenue: toNumber(totalRevenueAgg[0]?.totalRevenue),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch analytics overview" });
  }
};

const getSalesByCategory = async (_req, res) => {
  try {
    const rows = await OrderItem.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: { $toLower: "$product.category" },
          unitsSold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$quantity", "$priceAtPurchase"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return res.status(200).json({
      salesByCategory: rows.map((row) => ({
        category: row._id,
        unitsSold: toNumber(row.unitsSold),
        revenue: toNumber(row.revenue),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch sales by category" });
  }
};

const getTopProducts = async (_req, res) => {
  try {
    const rows = await OrderItem.aggregate([
      {
        $group: {
          _id: "$productId",
          unitsSold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$quantity", "$priceAtPurchase"] } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          id: { $toString: "$product._id" },
          title: "$product.title",
          category: "$product.category",
          location: "$product.location",
          unitsSold: "$unitsSold",
          revenue: "$revenue",
        },
      },
    ]);

    return res.status(200).json({
      topProducts: rows.map((row) => ({
        ...row,
        unitsSold: toNumber(row.unitsSold),
        revenue: toNumber(row.revenue),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch top products" });
  }
};

const getTopFarmers = async (_req, res) => {
  try {
    const rows = await OrderItem.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "users",
          localField: "product.sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $match: {
          "seller.role": { $in: ["farmer", "vendor"] },
        },
      },
      {
        $group: {
          _id: "$seller._id",
          name: { $first: "$seller.name" },
          email: { $first: "$seller.email" },
          unitsSold: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$quantity", "$priceAtPurchase"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          name: 1,
          email: 1,
          unitsSold: 1,
          revenue: 1,
        },
      },
    ]);

    return res.status(200).json({
      topFarmers: rows.map((row) => ({
        ...row,
        unitsSold: toNumber(row.unitsSold),
        revenue: toNumber(row.revenue),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch top farmers" });
  }
};

const getLocationDemand = async (_req, res) => {
  try {
    const rows = await OrderItem.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.location": { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$product.location",
          orderSet: { $addToSet: "$orderId" },
          unitsDemanded: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$quantity", "$priceAtPurchase"] } },
        },
      },
      {
        $project: {
          _id: 0,
          location: "$_id",
          orderCount: { $size: "$orderSet" },
          unitsDemanded: 1,
          revenue: 1,
        },
      },
      { $sort: { orderCount: -1, unitsDemanded: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      locationDemand: rows.map((row) => ({
        location: row.location,
        orderCount: toNumber(row.orderCount),
        unitsDemanded: toNumber(row.unitsDemanded),
        revenue: toNumber(row.revenue),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch location demand" });
  }
};

module.exports = {
  getOverview,
  getSalesByCategory,
  getTopProducts,
  getTopFarmers,
  getLocationDemand,
};
