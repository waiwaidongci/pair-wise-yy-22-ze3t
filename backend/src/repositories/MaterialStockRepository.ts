import { seed } from "../seed";
import type { MaterialStock } from "../models/MaterialStock";

// 复制种子数据，运行期入库/领用在内存中累积，重启后回到种子状态。
const rows: MaterialStock[] = seed.materialStock.map((row) => ({ ...row }));

export const materialStockRepository = {
  findAll: (): MaterialStock[] => rows,
  findByBatchNo: (batchNo: string): MaterialStock | undefined => rows.find((row) => row.batch_no === batchNo),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  save: (row: MaterialStock): MaterialStock => {
    rows.push(row);
    return row;
  }
};
