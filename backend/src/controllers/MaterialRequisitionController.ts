import type { Request, Response } from "express";
import { materialRequisitionService } from "../services/MaterialRequisitionService";

export const materialRequisitionController = {
  list: (req: Request, res: Response) => res.json(materialRequisitionService.list(String(req.query.bucket ?? ""))),
  issue: (req: Request, res: Response) => res.status(201).json(materialRequisitionService.issue(req.body)),
  review: (req: Request, res: Response) =>
    res.json(materialRequisitionService.review(Number(req.params.id), req.body)),
  archive: (req: Request, res: Response) =>
    res.json(materialRequisitionService.archiveForPlan(Number(req.params.planId), req.body?.reopen_step_ids ?? []))
};
