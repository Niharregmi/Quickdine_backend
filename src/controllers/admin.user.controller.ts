import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";

export class AdminUserController {
  // GET /api/v1/admin/users
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const query: any = {};
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const total = await User.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return res.json({
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // GET /api/v1/admin/users/:id
  async getUser(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json({ data: user });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // POST /api/v1/admin/users
  async createUser(req: Request, res: Response) {
    try {
      const { fullName, email, password, phoneNumber, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        role: role || "user",
      });

      const userObject = user.toObject() as any;
      delete userObject.password;

      return res.status(201).json({ data: userObject });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // PUT/PATCH /api/v1/admin/users/:id
  async updateUser(req: Request, res: Response) {
    try {
      const { fullName, email, phoneNumber, role, password } = req.body;

      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (role) updateData.role = role;

      if (email) {
        const existingEmail = await User.findOne({
          email,
          _id: { $ne: req.params.id },
        });
        if (existingEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }
        updateData.email = email;
      }

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ message: "Password too short" });
        }
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      }).select("-password");

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json({ data: user });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // DELETE /api/v1/admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json({ message: "User deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }
}
