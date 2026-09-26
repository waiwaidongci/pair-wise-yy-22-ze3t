import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";

const router = Router();
router.get("/", restorationPlanController.list);
router.post("/", restorationPlanController.create);
router.get("/:id/progress", restorationPlanController.progress);
router.post("/:id/reject", restorationPlanController.reject);

export default router;
