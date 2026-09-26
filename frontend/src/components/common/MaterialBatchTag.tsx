// 批号标签：过期批号以红色警示样式呈现，防止过期胶料上场。
export function MaterialBatchTag({ batchNo, expired }: { batchNo: string; expired?: boolean }) {
  return (
    <span className={"badge" + (expired ? " badge-danger" : " badge-batch")} title={expired ? "该批号已过有效期" : undefined}>
      批号 {batchNo}{expired ? " · 已过期" : ""}
    </span>
  );
}
