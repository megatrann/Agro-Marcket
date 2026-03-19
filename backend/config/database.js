const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true,
  });
};

module.exports = connectDatabase;
