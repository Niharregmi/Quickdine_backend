import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("=== [authMiddleware] Start ===");
    console.log("URL:", req.originalUrl || req.url);
    console.log("Method:", req.method);
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Error: No token provided or wrong format");
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);
    if (token === "null" || !token) {
      console.log("Error: Token is empty or 'null' string");
      return res.status(401).json({ message: "Token is empty, authorization denied" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.log("Error: JWT secret not configured");
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      console.log("Decoded Token ID:", decoded.id);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("Error: User not found in DB for ID:", decoded.id);
        return res.status(401).json({ message: "User not found, authorization denied" });
      }

      console.log("Auth Success. User ID:", user._id);
      req.user = user;
      next();
    } catch (jwtErr: any) {
      console.log("Error during jwt.verify:", jwtErr.message);
      return res.status(401).json({ message: "Token is not valid or has expired" });
    }
  } catch (err: any) {
    console.log("Error in authMiddleware:", err.message);
    return res.status(401).json({ message: "Token is not valid or has expired" });
  } finally {
    console.log("=== [authMiddleware] End ===");
  }
};
