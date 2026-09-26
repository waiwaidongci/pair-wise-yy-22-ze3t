import { seed } from "../seed";
import type { MaterialIssue } from "../models/MaterialIssue";

const rows = seed.materialIssue as unknown as MaterialIssue[];

export const materialIssueRepository = {
  findAll: (): MaterialIssue[] => rows,
  findById: (id: number): MaterialIssue | undefined => rows.find((row) => row.id === id),
  save: (row: MaterialIssue): MaterialIssue => { rows.push(row); return row; },
  update: (id: number, patch: Partial<MaterialIssue>): MaterialIssue | undefined => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  },
  nextId: (): number => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  nextRound: (stepId: number): number => rows.filter((row) => row.step_id === stepId).reduce((max, row) => Math.max(max, row.round), 0) + 1
};
