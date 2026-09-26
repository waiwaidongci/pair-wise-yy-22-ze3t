import { Router } from "express";
import { restorationStepController } from "../controllers/RestorationStepController";

const router = Router();
router.get("/", restorationStepController.list);
router.post("/", restorationStepController.create);
router.post("/:id/complete", restorationStepController.complete);

export default router;
