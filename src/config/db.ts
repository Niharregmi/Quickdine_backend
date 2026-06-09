import mongoose from "mongoose";

export const connectToMongoDB = async () => {
  try {
    const MONGO_URI = "mongodb://127.0.0.1:27017/quickbite";

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};