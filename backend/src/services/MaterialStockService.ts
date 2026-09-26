import { materialStockRepository } from "../repositories/MaterialStockRepository";
import { materialRequisitionRepository } from "../repositories/MaterialRequisitionRepository";
import { createMaterialStockDto } from "../constructors/MaterialStockDtoFactory";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ServiceError, formatMessage } from "../utils/serviceError";
import type { MaterialStock } from "../models/MaterialStock";
import type { MaterialStockPayload } from "../types/MaterialStockPayload";

const nowIso = () => new Date().toISOString();

export const materialStockService = {
  list(): Array<MaterialStock & { used_amount: number; remaining_amount: number; expired: boolean }> {
    const today = new Date().toISOString().slice(0, 10);
    return materialStockRepository.findAll().map((stock) => {
      const used_amount = materialRequisitionRepository.sumActiveUsedByBatch(stock.batch_no);
      return {
        ...stock,
        used_amount,
        remaining_amount: stock.total_amount - used_amount,
        expired: stock.expire_date < today
      };
    });
  },

  stockIn(payload: MaterialStockPayload) {
    const material_name = String(payload.material_name ?? "").trim();
    const batch_no = String(payload.batch_no ?? "").trim();
    const total_amount = Number(payload.total_amount);
    const expire_date = String(payload.expire_date ?? "").trim();
    const unit = String(payload.unit ?? "g").trim() || "g";
    const stocked_in_by = Number(payload.stocked_in_by ?? 0);

    if (!material_name || !batch_no || !expire_date || !Number.isFinite(total_amount) || total_amount <= 0) {
      throw new ServiceError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    if (materialStockRepository.findByBatchNo(batch_no)) {
      throw new ServiceError(
        409,
        ERROR_CODES.MATERIAL_BATCH_DUPLICATE,
        formatMessage(ERROR_MESSAGES.MATERIAL_BATCH_DUPLICATE, { batchNo: batch_no })
      );
    }

    const stock = createMaterialStockDto({
      id: materialStockRepository.nextId(),
      material_name,
      batch_no,
      total_amount,
      unit,
      expire_date,
      stocked_in_at: nowIso(),
      stocked_in_by
    }) as MaterialStock;
    materialStockRepository.save(stock);

    // 与列表保持一致的台账视图：附带累计领用、剩余量与过期标记。
    const today = new Date().toISOString().slice(0, 10);
    return {
      ...stock,
      used_amount: materialRequisitionRepository.sumActiveUsedByBatch(stock.batch_no),
      remaining_amount: stock.total_amount,
      expired: stock.expire_date < today
    };
  }
};
