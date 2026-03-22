const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerStatus: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    productSnapshot: {
      title: { type: String, default: "" },
      category: { type: String, default: "" },
      subcategory: { type: String, default: null },
      organic: { type: Boolean, default: false },
      location: { type: String, default: "" },
      images: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.models.OrderItem || mongoose.model("OrderItem", orderItemSchema);
