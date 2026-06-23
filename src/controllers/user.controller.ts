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

  // GET /api/v1/auth/whoami
  async whoami(req: Request, res: Response) {
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

  // PATCH /api/v1/auth/update
  async updateProfile(req: Request, res: Response) {
    try {
      const authReq = req as any;
      if (!authReq.user) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const { fullName, email, phoneNumber, password, confirmPassword } = req.body;
      const userId = authReq.user._id;

      // Build update object from only the fields that were actually sent.
      const updateData: Record<string, any> = {};

      if (fullName !== undefined && fullName !== "") {
        updateData.fullName = fullName;
      }

      if (email !== undefined && email !== "" && email !== authReq.user.email) {
        const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: "Email already in use" });
        }
        updateData.email = email;
      }

      if (phoneNumber !== undefined && phoneNumber !== "") {
        updateData.phoneNumber = phoneNumber;
      }

      // Password change (used by the "change password" form).
      if (password !== undefined && password !== "") {
        if (password.length < 6) {
          return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }
        if (confirmPassword !== undefined && password !== confirmPassword) {
          return res.status(400).json({ success: false, message: "Passwords do not match" });
        }
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Profile picture upload (multer puts the saved file info on req.file).
      if (authReq.file) {
        updateData.profilePicture = authReq.file.filename;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: "No fields to update" });
      }

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: this.formatUser(req, user),
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}