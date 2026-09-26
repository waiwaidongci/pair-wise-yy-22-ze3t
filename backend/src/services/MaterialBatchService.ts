import { LOG_TEMPLATES } from "../constants/logTemplates";
import { materialBatchRepository } from "../repositories/MaterialBatchRepository";
import { createMaterialBatchDto } from "../constructors/MaterialBatchDtoFactory";
import type { MaterialBatch } from "../models/MaterialBatch";
import type { MaterialBatchPayload } from "../types/MaterialBatchPayload";

export const materialBatchService = {
  list: (): MaterialBatch[] => materialBatchRepository.findAll(),
  create: (payload: MaterialBatchPayload): MaterialBatch => {
    const row = createMaterialBatchDto({
      ...payload,
      id: materialBatchRepository.nextId(),
      total_quantity: Number(payload.total_quantity ?? 0),
      stocked_by: Number(payload.stocked_by ?? 0),
      stocked_at: payload.stocked_at ?? new Date().toISOString()
    }) as MaterialBatch;
    console.info(LOG_TEMPLATES.MaterialBatch[0], row.batch_no);
    return materialBatchRepository.save(row);
  }
};
