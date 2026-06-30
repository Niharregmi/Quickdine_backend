import { Request, Response } from "express";
import { Blog } from "../models/blog.model";

export class BlogController {
  async getBlogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 10;
      const search = req.query.search as string;

      const query: any = {};
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      const totalItems = await Blog.countDocuments(query);
      const totalPages = Math.ceil(totalItems / size);

      const blogs = await Blog.find(query)
        .populate("authorId", "email fullName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size);

      return res.json({
        success: true,
        data: blogs,
        pagination: { page, size, totalPages, totalItems },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async getBlog(req: Request, res: Response) {
    try {
      const blog = await Blog.findById(req.params.id).populate(
        "authorId",
        "email fullName"
      );
      if (!blog)
        return res.status(404).json({ success: false, message: "Blog not found" });

      return res.json({ success: true, data: blog });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async createBlog(req: Request, res: Response) {
    try {
      const { title, content } = req.body;
      const authorId = (req as any).user?.id;

      const blog = await Blog.create({ title, content, authorId });

      return res.status(201).json({ success: true, data: blog });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateBlog(req: Request, res: Response) {
    try {
      const { title, content } = req.body;
      const updateData: any = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;

      const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });

      if (!blog)
        return res.status(404).json({ success: false, message: "Blog not found" });

      return res.json({ success: true, data: blog });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async deleteBlog(req: Request, res: Response) {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);
      if (!blog)
        return res.status(404).json({ success: false, message: "Blog not found" });

      return res.json({ success: true, message: "Blog deleted successfully" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
