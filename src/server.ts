import app from "./app";
import dotenv from "dotenv";
import { connectToMongoDB } from "./config/db";

dotenv.config();

console.log("SERVER LOADED");

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectToMongoDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`Local access: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server failed:", err);
    process.exit(1);
  }
};

start();