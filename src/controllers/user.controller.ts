import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
export class UserController {
  private getProfilePictureUrl(req: Request, profilePicture: string | null | undefined): string | null {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
      const parts = profilePicture.split("/uploads/");
      if (parts.length > 1) {
        const filename = parts[1];
        return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
      }
      return profilePicture;
    }
    const filename = profilePicture.startsWith("/uploads/") 
      ? profilePicture.substring("/uploads/".length) 
      : profilePicture;
    return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
  }

  private formatUser(req: Request, user: any) {
    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: this.getProfilePictureUrl(req, user.profilePicture),
    };
  }

  async register(req: Request, res: Response) {
    try {
      const { fullName, email, password, phoneNumber } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
      });

      return res.status(201).json({
        message: "User created successfully",
        user: this.formatUser(req, user),
      });
    } catch (err: any) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }

      const token = jwt.sign({ id: user._id }, secret, {
        expiresIn: "7d",
      });

      return res.json({
        message: "Login successful",
        token,
        user: this.formatUser(req, user),
      });
    } catch (err: any) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const authReq = req as any;
      if (!authReq.user) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      return res.json({
        success: true,
        data: this.formatUser(req, authReq.user),
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      const authReq = req as any;
      if (!authReq.user) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      if (!authReq.file) {
        return res.status(400).json({ success: false, message: "No image file uploaded" });
      }

      const user = await User.findByIdAndUpdate(
        authReq.user._id,
        { profilePicture: authReq.file.filename },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.json({
        success: true,
        message: "Profile picture updated successfully",
        data: {
          profilePicture: this.getProfilePictureUrl(req, user.profilePicture),
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}