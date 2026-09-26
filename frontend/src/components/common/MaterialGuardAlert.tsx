import type { MaterialGuardBlock } from "../../hooks/useMaterialGuard";

// 拦截提示：材料过期 / 超量 / 批号被其他未结方案占用 / 同人复核时挡住操作并说明原因。
export function MaterialGuardAlert({ block }: { block: MaterialGuardBlock | null }) {
  if (!block) return null;
  return (
    <div className="guard guard-error" role="alert">
      <strong>无法领用</strong>
      <span>{block.message}</span>
    </div>
  );
}
