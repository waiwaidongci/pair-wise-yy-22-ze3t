import { MaterialStockCard } from "../components/common/MaterialStockCard";
import { MaterialRequisitionPanel } from "../components/common/MaterialRequisitionPanel";

export function MaterialsPage() {
  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>材料台账与领用</h1>
          <p className="mat-hint">
            入库按批号登记总量与有效期；步骤开始后由操作人领用并记克数与开封时间；完工后另一名修复师按批号复核，通过才计入方案进度。
          </p>
        </div>
      </section>
      <MaterialStockCard />
      <MaterialRequisitionPanel />
    </main>
  );
}
