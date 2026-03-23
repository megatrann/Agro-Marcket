const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, default: null, trim: true },
    organic: { type: Boolean, default: false },
    retailPrice: { type: Number, required: false, min: 0 },
    wholesalePrice: { type: Number, required: false, min: 0 },
    minWholesaleQty: { type: Number, default: 1, min: 1 },
    quantity: { type: Number, default: 0, min: 0 },
    location: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
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

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
