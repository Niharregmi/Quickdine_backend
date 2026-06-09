import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "API WORKING" });
});

app.use("/api/v1/auth", userRouter);

export default app;