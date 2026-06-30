import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();
const adminUserController = new AdminUserController();

router.use(authMiddleware, adminMiddleware);

router.get("/", adminUserController.getUsers.bind(adminUserController));
router.post("/", adminUserController.createUser.bind(adminUserController));
router.get("/:id", adminUserController.getUser.bind(adminUserController));
router.patch("/:id", adminUserController.updateUser.bind(adminUserController));
router.put("/:id", adminUserController.updateUser.bind(adminUserController));
router.delete("/:id", adminUserController.deleteUser.bind(adminUserController));

export default router;
