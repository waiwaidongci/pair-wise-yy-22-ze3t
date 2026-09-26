import { Router } from "express";
import { materialRequisitionController } from "../controllers/MaterialRequisitionController";

const router = Router();
router.get("/", materialRequisitionController.list);
router.post("/", materialRequisitionController.issue);
router.post("/:id/review", materialRequisitionController.review);
router.post("/plan/:planId/archive", materialRequisitionController.archive);

export default router;
