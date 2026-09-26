import { seed } from "../seed";
import type { MaterialBatch } from "../models/MaterialBatch";

const rows = seed.materialBatch as unknown as MaterialBatch[];

export const materialBatchRepository = {
  findAll: (): MaterialBatch[] => rows,
  findById: (id: number): MaterialBatch | undefined => rows.find((row) => row.id === id),
  save: (row: MaterialBatch): MaterialBatch => { rows.push(row); return row; },
  nextId: (): number => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
};
