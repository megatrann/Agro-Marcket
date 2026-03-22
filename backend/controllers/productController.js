const mongoose = require("mongoose");
const { Product } = require("../models");

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Seeds",
  "Fertilizer",
  "Equipment",
  "Vehicles",
];

const CREATOR_ROLES = ["farmer", "vendor", "admin"];

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }

  return null;
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildUploadBaseUrl = (req) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const protocol = forwardedProto ? String(forwardedProto).split(",")[0].trim() : req.protocol;
  const host = forwardedHost ? String(forwardedHost).split(",")[0].trim() : req.get("host");
  return `${protocol}://${host}`;
};

const parseImages = (bodyImages, files, req) => {
  const uploadBaseUrl = buildUploadBaseUrl(req);
  const uploadedUrls = (files || []).map(
    (file) => `${uploadBaseUrl}/uploads/${file.filename}`
  );

  if (!bodyImages) {
    return uploadedUrls;
  }

  let providedImages = [];
  if (Array.isArray(bodyImages)) {
    providedImages = bodyImages;
  } else if (typeof bodyImages === "string") {
    try {
      const parsed = JSON.parse(bodyImages);
      if (Array.isArray(parsed)) {
        providedImages = parsed;
      }
    } catch (error) {
      providedImages = bodyImages
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }

  return [...providedImages, ...uploadedUrls];
};

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

const sanitizeProduct = (product) => {
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
    isArchived: Boolean(product.isArchived),
    seller: serializeSeller(sellerDoc),
  };
};

const validateProductInput = (payload, isPartial = false) => {
  const errors = [];

  const requiredFields = [
    "title",
    "description",
    "category",
    "retailPrice",
    "wholesalePrice",
    "minWholesaleQty",
    "quantity",
    "location",
    "organic",
  ];

  if (!isPartial) {
    requiredFields.forEach((field) => {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        errors.push(`${field} is required`);
      }
    });
  }

  if (payload.category !== undefined && !CATEGORIES.includes(payload.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  }

  if (payload.retailPrice !== undefined && payload.retailPrice !== null && payload.retailPrice < 0) {
    errors.push("retailPrice must be >= 0");
  }

  if (
    payload.wholesalePrice !== undefined &&
    payload.wholesalePrice !== null &&
    payload.wholesalePrice < 0
  ) {
    errors.push("wholesalePrice must be >= 0");
  }

  if (
    payload.minWholesaleQty !== undefined &&
    payload.minWholesaleQty !== null &&
    (!Number.isInteger(payload.minWholesaleQty) || payload.minWholesaleQty < 1)
  ) {
    errors.push("minWholesaleQty must be an integer >= 1");
  }

  if (
    payload.quantity !== undefined &&
    payload.quantity !== null &&
    (!Number.isInteger(payload.quantity) || payload.quantity < 0)
  ) {
    errors.push("quantity must be an integer >= 0");
  }

  if (payload.organic !== undefined && typeof payload.organic !== "boolean") {
    errors.push("organic must be true or false");
  }

  return errors;
};

const createProduct = async (req, res) => {
  try {
    if (!CREATOR_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        message: "Only farmers, vendors, or admins can create products",
      });
    }

    const payload = {
      title: req.body.title ? String(req.body.title).trim() : undefined,
      description: req.body.description ? String(req.body.description).trim() : undefined,
      category: req.body.category ? String(req.body.category).trim() : undefined,
      subcategory: req.body.subcategory ? String(req.body.subcategory).trim() : null,
      organic: parseBoolean(req.body.organic),
      retailPrice: parseNumber(req.body.retailPrice),
      wholesalePrice: parseNumber(req.body.wholesalePrice),
      minWholesaleQty: parseNumber(req.body.minWholesaleQty),
      quantity: parseNumber(req.body.quantity),
      location: req.body.location ? String(req.body.location).trim() : undefined,
      images: parseImages(req.body.images, req.files, req),
      sellerId: req.user.id,
    };

    if (payload.minWholesaleQty !== null) {
      payload.minWholesaleQty = Math.trunc(payload.minWholesaleQty);
    }
    if (payload.quantity !== null) {
      payload.quantity = Math.trunc(payload.quantity);
    }

    const validationErrors = validateProductInput(payload);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const product = await Product.create(payload);
    await product.populate("sellerId", "name email role");

    return res.status(201).json({
      message: "Product created successfully",
      product: sanitizeProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create product" });
  }
};

const listProducts = async (req, res) => {
  try {
    const { category, location, organic, minPrice, maxPrice } = req.query;
    const where = { isArchived: { $ne: true } };

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = { $regex: String(location), $options: "i" };
    }

    const parsedOrganic = parseBoolean(organic);
    if (parsedOrganic !== null) {
      where.organic = parsedOrganic;
    }

    const parsedMinPrice = parseNumber(minPrice);
    const parsedMaxPrice = parseNumber(maxPrice);
    if (parsedMinPrice !== null || parsedMaxPrice !== null) {
      where.retailPrice = {};
      if (parsedMinPrice !== null) {
        where.retailPrice.$gte = parsedMinPrice;
      }
      if (parsedMaxPrice !== null) {
        where.retailPrice.$lte = parsedMaxPrice;
      }
    }

    const products = await Product.find(where)
      .populate("sellerId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: products.length,
      products: products.map(sanitizeProduct),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

const listMyProducts = async (req, res) => {
  try {
    if (!CREATOR_ROLES.includes(req.user.role) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only farmers, vendors, or admins can access this" });
    }

    const where = req.user.role === "admin"
      ? { isArchived: { $ne: true } }
      : { sellerId: req.user.id, isArchived: { $ne: true } };

    const products = await Product.find(where)
      .populate("sellerId", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: products.length,
      products: products.map(sanitizeProduct),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch my products" });
  }
};

const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isArchived: { $ne: true },
    }).populate("sellerId", "name email role");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      product: sanitizeProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findOne({ _id: req.params.id, isArchived: { $ne: true } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const isOwner = String(product.sellerId) === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "Only product owner can edit this product" });
    }

    const payload = {
      title: req.body.title !== undefined ? String(req.body.title).trim() : undefined,
      description:
        req.body.description !== undefined ? String(req.body.description).trim() : undefined,
      category: req.body.category !== undefined ? String(req.body.category).trim() : undefined,
      subcategory:
        req.body.subcategory !== undefined ? String(req.body.subcategory).trim() : undefined,
      organic: req.body.organic !== undefined ? parseBoolean(req.body.organic) : undefined,
      retailPrice: req.body.retailPrice !== undefined ? parseNumber(req.body.retailPrice) : undefined,
      wholesalePrice:
        req.body.wholesalePrice !== undefined ? parseNumber(req.body.wholesalePrice) : undefined,
      minWholesaleQty:
        req.body.minWholesaleQty !== undefined ? parseNumber(req.body.minWholesaleQty) : undefined,
      quantity: req.body.quantity !== undefined ? parseNumber(req.body.quantity) : undefined,
      location: req.body.location !== undefined ? String(req.body.location).trim() : undefined,
    };

    if (payload.minWholesaleQty !== undefined && payload.minWholesaleQty !== null) {
      payload.minWholesaleQty = Math.trunc(payload.minWholesaleQty);
    }
    if (payload.quantity !== undefined && payload.quantity !== null) {
      payload.quantity = Math.trunc(payload.quantity);
    }

    if (req.body.images !== undefined || (req.files && req.files.length > 0)) {
      payload.images = parseImages(req.body.images, req.files, req);
    }

    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(cleanPayload).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    const validationErrors = validateProductInput(cleanPayload, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    Object.assign(product, cleanPayload);
    await product.save();
    await product.populate("sellerId", "name email role");

    return res.status(200).json({
      message: "Product updated successfully",
      product: sanitizeProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findOne({ _id: req.params.id, isArchived: { $ne: true } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const isOwner = String(product.sellerId) === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Only product owner or admin can delete this product",
      });
    }

    product.isArchived = true;
    await product.save();
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = {
  createProduct,
  listProducts,
  listMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
