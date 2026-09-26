CREATE TABLE IF NOT EXISTS relic_item (
  id INTEGER PRIMARY KEY,
  relic_code TEXT,
  name TEXT,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT
);

CREATE TABLE IF NOT EXISTS damage_record (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_type TEXT,
  position_desc TEXT,
  severity TEXT,
  discovered_by TEXT,
  discovered_at TEXT,
  image_url TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_record_id TEXT,
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT,
  owner_id TEXT
);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id TEXT,
  step_order TEXT,
  technique TEXT,
  material_used TEXT,
  operator_id TEXT,
  step_status TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  plan_id TEXT,
  version_no TEXT,
  image_type TEXT,
  file_path TEXT,
  capture_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);

-- 材料台账：入库时按批号登记总量与有效期
CREATE TABLE IF NOT EXISTS material_stock (
  id INTEGER PRIMARY KEY,
  material_name TEXT,
  batch_no TEXT UNIQUE,
  total_amount REAL,
  unit TEXT,
  expire_date TEXT,
  stocked_in_at TEXT,
  stocked_in_by TEXT
);

-- 材料领用单：步骤开始后由操作人领用，完工后由另一名修复师按批号复核
-- status: PENDING_PICKUP / ISSUED / PENDING_REVIEW / REVIEWED / ARCHIVED
CREATE TABLE IF NOT EXISTS material_requisition (
  id INTEGER PRIMARY KEY,
  requisition_no TEXT,
  plan_id TEXT,
  step_id TEXT,
  batch_no TEXT,
  material_name TEXT,
  used_amount REAL,
  unit TEXT,
  opened_at TEXT,
  operator_id TEXT,
  status TEXT,
  completed_at TEXT,
  reviewer_id TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  replaced_requisition_id TEXT,
  archived_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_material_requisition_batch ON material_requisition (batch_no);
CREATE INDEX IF NOT EXISTS idx_material_requisition_plan_step ON material_requisition (plan_id, step_id);
CREATE INDEX IF NOT EXISTS idx_material_requisition_status ON material_requisition (status);
