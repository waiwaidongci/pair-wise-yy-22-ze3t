import { Router } from "express";
import { materialStockController } from "../controllers/MaterialStockController";

const router = Router();
router.get("/", materialStockController.list);
router.post("/", materialStockController.stockIn);

export default router;
