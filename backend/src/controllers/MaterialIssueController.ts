import type { NextFunction, Request, Response } from "express";
import { materialIssueService } from "../services/MaterialIssueService";

const wrap = (fn: (req: Request, res: Response) => unknown) => (req: Request, res: Response, next: NextFunction) => {
  try { fn(req, res); } catch (err) { next(err); }
};

export const materialIssueController = {
  list: wrap((_req, res) => res.json(materialIssueService.list())),
  create: wrap((req, res) => res.status(201).json(materialIssueService.create(req.body))),
  issue: wrap((req, res) => res.json(materialIssueService.issue(Number(req.params.id), req.body))),
  review: wrap((req, res) => res.json(materialIssueService.review(Number(req.params.id), req.body))),
  archiveByPlan: wrap((req, res) => res.json({ archived: materialIssueService.archiveByPlan(Number(req.params.planId), req.body) })),
  planProgress: wrap((req, res) => res.json(materialIssueService.planProgress(Number(req.params.planId))))
};
