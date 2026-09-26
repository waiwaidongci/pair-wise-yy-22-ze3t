import { useEffect, useState } from "react";
import { useMaterialStockStore } from "../../stores/MaterialStockStore";
import { MaterialBatchTag } from "./MaterialBatchTag";
import { formatGrams } from "../../utils/formatters";

type StockInForm = {
  material_name: string;
  batch_no: string;
  total_amount: number | "";
  unit: string;
  expire_date: string;
  stocked_in_by: number;
};

const emptyForm: StockInForm = {
  material_name: "",
  batch_no: "",
  total_amount: "",
  unit: "g",
  expire_date: "",
  stocked_in_by: 3
};

// 材料台账：入库时按批号登记总量与有效期；展示累计领用与剩余量。
export function MaterialStockCard() {
  const { rows, loading, load, stockIn } = useMaterialStockStore();
  const [form, setForm] = useState<StockInForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!form.material_name || !form.batch_no || !form.total_amount || !form.expire_date) {
      setError("请填写材料名称、批号、入库总量与有效期");
      return;
    }
    try {
      const created = await stockIn({
        material_name: form.material_name,
        batch_no: form.batch_no,
        total_amount: Number(form.total_amount),
        unit: form.unit || "g",
        expire_date: form.expire_date,
        stocked_in_by: Number(form.stocked_in_by)
      });
      setSuccess(`批号 ${created.batch_no} 已入库，共 ${formatGrams(created.total_amount, created.unit)}`);
      setForm(emptyForm);
      void load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="panel">
      <h2>材料台账（按批号入库）</h2>
      {loading && <p className="mat-hint">加载中…</p>}
      <div className="table mat-table">
        <div className="row mat-row mat-head-row">
          <span>批号 / 材料</span>
          <span>入库总量</span>
          <span>累计领用</span>
          <span>剩余量</span>
          <span>有效期至</span>
        </div>
        {rows.map((stock) => (
          <div key={stock.id} className="row mat-row">
            <span>
              <MaterialBatchTag batchNo={stock.batch_no} expired={stock.expired} />
              <em className="mat-name">{stock.material_name}</em>
            </span>
            <span>{formatGrams(stock.total_amount, stock.unit)}</span>
            <span>{formatGrams(stock.used_amount ?? 0, stock.unit)}</span>
            <span className={stock.remaining_amount !== undefined && stock.remaining_amount <= 10 ? "danger" : ""}>
              {formatGrams(stock.remaining_amount ?? stock.total_amount, stock.unit)}
            </span>
            <span className={stock.expired ? "danger" : ""}>{stock.expire_date}</span>
          </div>
        ))}
      </div>

      <h3 className="mat-form-title">新批次入库登记</h3>
      <div className="mat-form">
        <label>
          材料名称
          <input type="text" value={form.material_name} onChange={(e) => setForm({ ...form, material_name: e.target.value })} placeholder="如：环氧树脂 E-44" />
        </label>
        <label>
          批号
          <input type="text" value={form.batch_no} onChange={(e) => setForm({ ...form, batch_no: e.target.value })} placeholder="如：B-2026-05" />
        </label>
        <label>
          入库总量
          <input type="number" min={0} value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value === "" ? "" : Number(e.target.value) })} />
        </label>
        <label>
          单位
          <input type="text" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </label>
        <label>
          有效期至
          <input type="date" value={form.expire_date} onChange={(e) => setForm({ ...form, expire_date: e.target.value })} />
        </label>
        <label>
          登记人编号
          <input type="number" min={1} value={form.stocked_in_by} onChange={(e) => setForm({ ...form, stocked_in_by: Number(e.target.value) })} />
        </label>
      </div>
      {error && <div className="guard guard-error" role="alert"><strong>登记失败</strong><span>{error}</span></div>}
      {success && <div className="guard guard-ok" role="status"><span>{success}</span></div>}
      <div className="mat-actions">
        <button className="btn primary" onClick={submit}>登记入库</button>
      </div>
    </section>
  );
}
