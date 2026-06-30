import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const blogController = new BlogController();

router.use(authMiddleware);
router.get("/", blogController.getBlogs.bind(blogController));
router.post("/", blogController.createBlog.bind(blogController));
router.get("/:id", blogController.getBlog.bind(blogController));
router.patch("/:id", blogController.updateBlog.bind(blogController));
router.delete("/:id", blogController.deleteBlog.bind(blogController));

export default router;
