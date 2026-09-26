import type { Request, Response } from "express";
import { materialStockService } from "../services/MaterialStockService";

export const materialStockController = {
  list: (_req: Request, res: Response) => res.json(materialStockService.list()),
  stockIn: (req: Request, res: Response) => res.status(201).json(materialStockService.stockIn(req.body))
};
