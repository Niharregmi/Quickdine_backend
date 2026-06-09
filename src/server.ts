import app from "./app";
import dotenv from "dotenv";
import { connectToMongoDB } from "./config/db";

dotenv.config();
console.log("SERVER.TS LOADED");
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectToMongoDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("Server failed:", err);
  process.exit(1);
});