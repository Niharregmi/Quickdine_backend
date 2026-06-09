import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

console.log(" USER ROUTES LOADED");

router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
console.log("USER ROUTES FILE LOADED");

export default router;