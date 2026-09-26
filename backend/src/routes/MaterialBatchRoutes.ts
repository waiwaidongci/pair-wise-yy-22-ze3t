import { Router } from "express";
import { materialBatchController } from "../controllers/MaterialBatchController";
const router = Router();
router.get("/", materialBatchController.list);
router.post("/", materialBatchController.create);
export default router;
