const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDatabase = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch (_error) {
    return null;
  }
};

const allowedOriginSet = new Set(
  allowedOrigins
    .map((origin) => normalizeOrigin(origin) || origin)
    .filter(Boolean)
);

const isTrustedPreviewOrigin = (origin) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) {
    return false;
  }

  try {
    const { hostname } = new URL(normalized);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".vercel.app")
    );
  } catch (_error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, mobile apps, server-to-server).
      if (!origin) {
        return callback(null, true);
      }

      const normalizedRequestOrigin = normalizeOrigin(origin) || origin;

      // If CLIENT_URL is not configured, allow all origins to avoid blocking dev/test.
      if (
        allowedOrigins.length === 0 ||
        allowedOriginSet.has(normalizedRequestOrigin) ||
        isTrustedPreviewOrigin(normalizedRequestOrigin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Farmer Market backend is running",
    health: "/api/health",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image file size must be 5MB or less" });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

let dbConnectPromise = null;

const ensureDatabaseConnection = async () => {
  if (!dbConnectPromise) {
    dbConnectPromise = connectDatabase().catch((error) => {
      dbConnectPromise = null;
      throw error;
    });
  }

  return dbConnectPromise;
};

if (process.env.VERCEL === "1") {
  module.exports = async (req, res) => {
    try {
      await ensureDatabaseConnection();
      return app(req, res);
    } catch (error) {
      console.error("Failed to handle request:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
} else {
  startServer();
}
