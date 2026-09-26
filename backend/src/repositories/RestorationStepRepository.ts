import { seed } from "../seed";
import type { RestorationStep } from "../models/RestorationStep";

const rows: RestorationStep[] = seed.restorationStep.map((row) => ({ ...row }));

export const restorationStepRepository = {
  findAll: (): RestorationStep[] => rows,
  findById: (id: number): RestorationStep | undefined => rows.find((row) => row.id === id),
  save: (row: RestorationStep): RestorationStep => {
    rows.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RestorationStep>): RestorationStep | undefined => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
