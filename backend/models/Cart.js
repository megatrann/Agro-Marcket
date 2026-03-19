const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    quantity: { type: Number, required: true, default: 1, min: 1 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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

cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
