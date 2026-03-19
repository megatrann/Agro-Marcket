const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

orderSchema.virtual("items", {
  ref: "OrderItem",
  localField: "_id",
  foreignField: "orderId",
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
