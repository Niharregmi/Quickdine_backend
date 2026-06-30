import express from "express";
import cors from "cors";
import path from "path";
import userRouter from "./routes/user.route";
import adminUserRouter from "./routes/admin.user.route";
import blogRouter from "./routes/blog.route";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.get("/health", (req, res) => {
  res.json({ status: "API WORKING" });
});
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin/users", adminUserRouter);
app.use("/api/v1/blogs", blogRouter);
export default app;
