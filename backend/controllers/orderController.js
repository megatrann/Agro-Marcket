const mongoose = require("mongoose");
const { Cart, Order, OrderItem, Product } = require("../models");

const UPDATABLE_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const SELLER_ROLES = ["farmer", "vendor", "admin"];

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

const serializeBuyer = (buyer) => {
  if (!buyer) {
    return null;
  }

  return {
    id: buyer.id || buyer._id.toString(),
    name: buyer.name,
    email: buyer.email,
    role: buyer.role,
  };
};

const serializeProduct = (product) => {
  if (!product) {
    return null;
  }

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

const serializeOrderItem = (item) => ({
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
});

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
  buyer: order.userId && typeof order.userId === "object" ? serializeBuyer(order.userId) : null,
  items: (order.items || []).map(serializeOrderItem),
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

const createOrderFromCart = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let createdOrderId = null;

    await session.withTransaction(async () => {
      const cartItems = await Cart.find({ userId: req.user.id }).session(session);

      if (cartItems.length === 0) {
        throw new Error("CART_EMPTY");
      }

      const productIds = [...new Set(cartItems.map((item) => String(item.productId)))];
      const products = await Product.find({ _id: { $in: productIds } }).session(session);
      const productMap = new Map(products.map((product) => [String(product._id), product]));

      let totalAmount = 0;
      const orderItemsPayload = [];

      for (const cartItem of cartItems) {
        const product = productMap.get(String(cartItem.productId));

        if (!product) {
          throw new Error(`PRODUCT_MISSING:${cartItem.productId}`);
        }

        if (product.quantity < cartItem.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.title}`);
        }

        const priceAtPurchase = Number(product.retailPrice);
        totalAmount += priceAtPurchase * cartItem.quantity;

        orderItemsPayload.push({
          productId: product._id,
          quantity: cartItem.quantity,
          priceAtPurchase,
        });

        product.quantity -= cartItem.quantity;
        await product.save({ session });
      }

      const [order] = await Order.create(
        [
          {
            userId: req.user.id,
            totalAmount,
            status: "pending",
          },
        ],
        { session }
      );

      const itemsToCreate = orderItemsPayload.map((item) => ({
        ...item,
        orderId: order._id,
      }));

      await OrderItem.insertMany(itemsToCreate, { session });
      await Cart.deleteMany({ userId: req.user.id }).session(session);

      createdOrderId = order._id;
    });

    const createdOrder = await Order.findById(createdOrderId).populate(orderPopulate);

    return res.status(201).json({
      message: "Order created successfully",
      order: serializeOrder(createdOrder),
    });
  } catch (error) {
    if (error.message === "CART_EMPTY") {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (error.message.startsWith("PRODUCT_MISSING:")) {
      const productId = error.message.replace("PRODUCT_MISSING:", "");
      return res.status(400).json({
        message: `Product ${productId} is no longer available`,
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const title = error.message.replace("INSUFFICIENT_STOCK:", "");
      return res.status(400).json({
        message: `Insufficient quantity for product ${title}`,
      });
    }

    return res.status(500).json({ message: "Failed to create order" });
  } finally {
    session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate(orderPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    if (!SELLER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: "Only seller or admin can access seller orders" });
    }

    const allOrders = await Order.find({}).populate(orderPopulate).sort({ createdAt: -1 });

    const filteredOrders =
      req.user.role === "admin"
        ? allOrders
        : allOrders
            .map((order) => {
              const sellerItems = (order.items || []).filter(
                (item) => item.productId && String(item.productId.sellerId?._id || item.productId.sellerId) === req.user.id
              );
              if (sellerItems.length === 0) {
                return null;
              }
              order.items = sellerItems;
              return order;
            })
            .filter(Boolean);

    return res.status(200).json({
      count: filteredOrders.length,
      orders: filteredOrders.map(serializeOrder),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (!SELLER_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: "Only seller or admin can update order status" });
    }

    const orderId = req.params.id;
    const status = req.body.status;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Valid order id is required" });
    }

    if (!UPDATABLE_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${UPDATABLE_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId).populate(orderPopulate);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin") {
      const sellerOwnsAnyItem = (order.items || []).some(
        (item) => item.productId && String(item.productId.sellerId?._id || item.productId.sellerId) === req.user.id
      );

      if (!sellerOwnsAnyItem) {
        return res.status(403).json({ message: "Not authorized to update this order" });
      }
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(orderId).populate(orderPopulate);

    return res.status(200).json({
      message: "Order status updated successfully",
      order: serializeOrder(updatedOrder),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

module.exports = {
  createOrderFromCart,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
};
