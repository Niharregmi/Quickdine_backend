import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();
const userController = new UserController();

console.log(" USER ROUTES LOADED");

router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));

router.get("/whoami", authMiddleware, userController.whoami.bind(userController));

router.patch(
  "/update",
  authMiddleware,
  upload.single("profilePicture"),
  userController.updateProfile.bind(userController)
);
console.log("USER ROUTES FILE LOADED");

export default router;