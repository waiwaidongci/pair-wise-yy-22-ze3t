import type { Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";

export const restorationPlanController = {
  list: (_req: Request, res: Response) => res.json(restorationPlanService.list()),
  create: (req: Request, res: Response) => res.status(201).json(restorationPlanService.create(req.body)),
  progress: (req: Request, res: Response) => res.json(restorationPlanService.progress(Number(req.params.id))),
  reject: (req: Request, res: Response) =>
    res.json(restorationPlanService.reject(Number(req.params.id), req.body?.reopen_step_ids ?? []))
};
