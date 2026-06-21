import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();
const userController = new UserController();

console.log(" USER ROUTES LOADED");

router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
router.get("/me", authMiddleware, userController.getMe.bind(userController));
router.patch(
  "/me",
  authMiddleware,
  upload.single("profilePicture"),
  userController.updateMe.bind(userController)
);
console.log("USER ROUTES FILE LOADED");

export default router;