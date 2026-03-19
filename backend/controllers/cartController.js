const mongoose = require("mongoose");
const { Cart, Product } = require("../models");

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

const sanitizeCartItem = (item) => ({
  id: item.id || item._id.toString(),
  userId: String(item.userId),
  productId:
    item.productId && typeof item.productId === "object"
      ? item.productId.id || item.productId._id.toString()
      : String(item.productId),
  quantity: item.quantity,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  product: item.productId && typeof item.productId === "object" ? serializeProduct(item.productId) : null,
});

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = Number(req.body.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid productId is required" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be an integer greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = await Cart.findOne({
      userId: req.user.id,
      productId,
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        return res.status(400).json({ message: "Insufficient product stock" });
      }

      existingItem.quantity = newQuantity;
      await existingItem.save();

      const updatedItem = await Cart.findById(existingItem._id).populate({
        path: "productId",
        populate: { path: "sellerId", select: "name email role" },
      });

      return res.status(200).json({
        message: "Cart item quantity updated",
        cartItem: sanitizeCartItem(updatedItem),
      });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ message: "Insufficient product stock" });
    }

    const cartItem = await Cart.create({
      userId: req.user.id,
      productId,
      quantity,
    });

    const createdItem = await Cart.findById(cartItem._id).populate({
      path: "productId",
      populate: { path: "sellerId", select: "name email role" },
    });

    return res.status(201).json({
      message: "Product added to cart",
      cartItem: sanitizeCartItem(createdItem),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add product to cart" });
  }
};

const getCartItems = async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.user.id })
      .populate({
        path: "productId",
        populate: { path: "sellerId", select: "name email role" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: items.length,
      items: items.map(sanitizeCartItem),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cart items" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const cartId = req.params.id;
    const quantity = Number(req.body.quantity);

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({ message: "Valid cart item id is required" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be an integer greater than 0" });
    }

    const item = await Cart.findOne({
      _id: cartId,
      userId: req.user.id,
    }).populate("productId");

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity > item.productId.quantity) {
      return res.status(400).json({ message: "Insufficient product stock" });
    }

    item.quantity = quantity;
    await item.save();

    const updatedItem = await Cart.findById(item._id).populate({
      path: "productId",
      populate: { path: "sellerId", select: "name email role" },
    });

    return res.status(200).json({
      message: "Cart item updated successfully",
      cartItem: sanitizeCartItem(updatedItem),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update cart item" });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cartId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({ message: "Valid cart item id is required" });
    }

    const deleted = await Cart.findOneAndDelete({
      _id: cartId,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({ message: "Cart item removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove cart item" });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
};
