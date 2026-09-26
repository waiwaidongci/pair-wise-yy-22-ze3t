import type { NextFunction, Request, Response } from "express";
import { materialBatchService } from "../services/MaterialBatchService";

const wrap = (fn: (req: Request, res: Response) => unknown) => (req: Request, res: Response, next: NextFunction) => {
  try { fn(req, res); } catch (err) { next(err); }
};

export const materialBatchController = {
  list: wrap((_req, res) => res.json(materialBatchService.list())),
  create: wrap((req, res) => res.status(201).json(materialBatchService.create(req.body)))
};
