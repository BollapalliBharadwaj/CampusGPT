const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MongoDB Connection Error: MONGO_URI or MONGODB_URI is not set in Environment Variables.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
}

module.exports = connectDB;