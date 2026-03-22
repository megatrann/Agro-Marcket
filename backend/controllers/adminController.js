const mongoose = require("mongoose");
const { User, Product, Order } = require("../models");

const ALLOWED_ROLE_UPDATES = ["customer", "farmer", "vendor", "admin"];
const ALLOWED_ORDER_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const serializeUser = (user) => ({
  id: user.id || user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const serializeSeller = (seller) => {
  if (!seller) {
    return null;
  }

  return {
    id: seller.id || seller._id.toString(),
    name: seller.name,
    email: seller.email,
    role: seller.role,
  };
};

const serializeProduct = (product) => {
  const sellerDoc = product.sellerId && typeof product.sellerId === "object" ? product.sellerId : null;

  return {
    id: product.id || product._id.toString(),
    title: product.title,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    organic: product.organic,
    retailPrice: product.retailPrice,
    wholesalePrice: product.wholesalePrice,
    minWholesaleQty: product.minWholesaleQty,
    quantity: product.quantity,
    location: product.location,
    images: product.images,
    sellerId: sellerDoc ? sellerDoc.id || sellerDoc._id.toString() : String(product.sellerId),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    seller: serializeSeller(sellerDoc),
  };
};

const serializeOrder = (order) => ({
  id: order.id || order._id.toString(),
  userId:
    order.userId && typeof order.userId === "object"
      ? order.userId.id || order.userId._id.toString()
      : String(order.userId),
  totalAmount: order.totalAmount,
  status: order.status,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  buyer:
    order.userId && typeof order.userId === "object"
      ? {
          id: order.userId.id || order.userId._id.toString(),
          name: order.userId.name,
          email: order.userId.email,
          role: order.userId.role,
        }
      : null,
  items: (order.items || []).map((item) => ({
    id: item.id || item._id.toString(),
    orderId: String(item.orderId),
    productId:
      item.productId && typeof item.productId === "object"
        ? item.productId.id || item.productId._id.toString()
        : String(item.productId),
    quantity: item.quantity,
    priceAtPurchase: item.priceAtPurchase,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    product: item.productId && typeof item.productId === "object" ? serializeProduct(item.productId) : null,
  })),
});

const orderPopulate = [
  { path: "userId", select: "name email role" },
  {
    path: "items",
    populate: {
      path: "productId",
      populate: {
        path: "sellerId",
        select: "name email role",
      },
    },
  },
];

const getDashboardStats = async (_req, res) => {
  try {
    const [totalUsers, totalFarmerVendors, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ["farmer", "vendor"] } }),
      Product.countDocuments({ isArchived: { $ne: true } }),
      Order.countDocuments(),
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalFarmerVendors,
        totalProducts,
        totalOrders,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      count: users.length,
      users: users.map(serializeUser),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: "Admin cannot delete own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: userId });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const role = String(req.body.role || "").trim();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    if (!ALLOWED_ROLE_UPDATES.includes(role)) {
      return res.status(400).json({
        message: `Role must be one of: ${ALLOWED_ROLE_UPDATES.join(", ")}`,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      message: "User role updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user role" });
  }
};

const getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find({ isArchived: { $ne: true } })
      .populate("sellerId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: products.length,
      products: products.map(serializeProduct),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product id is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isArchived = true;
    await product.save();

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
};

const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find({}).populate(orderPopulate).sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const status = String(req.body.status || "").trim();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Valid order id is required" });
    }

    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(orderId).populate(orderPopulate);

    return res.status(200).json({
      message: "Order updated successfully",
      order: serializeOrder(updatedOrder),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order" });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  updateOrder,
};
