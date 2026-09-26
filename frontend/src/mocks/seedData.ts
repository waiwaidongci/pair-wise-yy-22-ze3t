import type { MaterialStock } from "../types/MaterialStock";
import type { MaterialRequisition } from "../types/MaterialRequisition";

export const mockData = {
  "relicItem": [
    {
      "id": 1,
      "relic_code": "relic code 1",
      "name": "name 1",
      "era": "era 1",
      "material": "material 1",
      "collection_level": "LOW",
      "storage_location": "storage location 1",
      "current_condition": "current condition 1"
    },
    {
      "id": 2,
      "relic_code": "relic code 2",
      "name": "name 2",
      "era": "era 2",
      "material": "material 2",
      "collection_level": "MEDIUM",
      "storage_location": "storage location 2",
      "current_condition": "current condition 2"
    },
    {
      "id": 3,
      "relic_code": "relic code 3",
      "name": "name 3",
      "era": "era 3",
      "material": "material 3",
      "collection_level": "HIGH",
      "storage_location": "storage location 3",
      "current_condition": "current condition 3"
    }
  ],
  "damageRecord": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_type": "FRAGILE",
      "position_desc": "position desc 1",
      "severity": "severity 1",
      "discovered_by": "discovered by 1",
      "discovered_at": "2026-06-11T09:00:00Z",
      "image_url": "/mock/image_url-1.png",
      "status": "SUBMITTED"
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_type": "DAMAGED",
      "position_desc": "position desc 2",
      "severity": "severity 2",
      "discovered_by": "discovered by 2",
      "discovered_at": "2026-06-12T09:00:00Z",
      "image_url": "/mock/image_url-2.png",
      "status": "APPROVED"
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_type": "IN_RESTORATION",
      "position_desc": "position desc 3",
      "severity": "severity 3",
      "discovered_by": "discovered by 3",
      "discovered_at": "2026-06-13T09:00:00Z",
      "image_url": "/mock/image_url-3.png",
      "status": "DRAFT"
    }
  ],
  "restorationPlan": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_record_id": 1,
      "plan_title": "plan title 1",
      "method": "method 1",
      "risk_assessment": "risk assessment 1",
      "approval_status": "APPROVED",
      "owner_id": 1
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_record_id": 2,
      "plan_title": "plan title 2",
      "method": "method 2",
      "risk_assessment": "risk assessment 2",
      "approval_status": "APPROVED",
      "owner_id": 2
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_record_id": 3,
      "plan_title": "plan title 3",
      "method": "method 3",
      "risk_assessment": "risk assessment 3",
      "approval_status": "DRAFT",
      "owner_id": 3
    },
    {
      "id": 4,
      "relic_id": 1,
      "damage_record_id": 1,
      "plan_title": "plan title 4（退回重审）",
      "method": "method 4",
      "risk_assessment": "risk assessment 4",
      "approval_status": "REJECTED",
      "owner_id": 1
    }
  ],
  "restorationStep": [
    {
      "id": 1,
      "plan_id": 1,
      "step_order": "1",
      "technique": "清理与脱盐",
      "material_used": "",
      "operator_id": 1,
      "step_status": "PENDING_PICKUP",
      "finished_at": ""
    },
    {
      "id": 2,
      "plan_id": 1,
      "step_order": "2",
      "technique": "裂缝注胶加固",
      "material_used": "金箔胶（见领用单 MR-2026-0002）",
      "operator_id": 1,
      "step_status": "IN_PROGRESS",
      "finished_at": ""
    },
    {
      "id": 3,
      "plan_id": 1,
      "step_order": "3",
      "technique": "缺损补配",
      "material_used": "环氧树脂（见领用单 MR-2026-0001）",
      "operator_id": 1,
      "step_status": "COMPLETED",
      "finished_at": "2026-09-20T16:30:00Z"
    },
    {
      "id": 4,
      "plan_id": 2,
      "step_order": "1",
      "technique": "漆膜回贴",
      "material_used": "虫胶漆片（见领用单 MR-2026-0003）",
      "operator_id": 2,
      "step_status": "COMPLETED",
      "finished_at": "2026-09-24T11:00:00Z"
    },
    {
      "id": 5,
      "plan_id": 4,
      "step_order": "1",
      "technique": "旧版加固工艺（方案退回）",
      "material_used": "环氧树脂（旧单 MR-2025-0901 已留档）",
      "operator_id": 1,
      "step_status": "ARCHIVED",
      "finished_at": "2025-11-02T10:00:00Z"
    }
  ],
  "imageVersion": [
    {
      "id": 1,
      "relic_id": 1,
      "plan_id": 1,
      "version_no": "version no 1",
      "image_type": "FRAGILE",
      "file_path": "file path 1",
      "capture_at": "2026-06-11T09:00:00Z",
      "note": "note 1"
    },
    {
      "id": 2,
      "relic_id": 2,
      "plan_id": 2,
      "version_no": "version no 2",
      "image_type": "DAMAGED",
      "file_path": "file path 2",
      "capture_at": "2026-06-12T09:00:00Z",
      "note": "note 2"
    },
    {
      "id": 3,
      "relic_id": 3,
      "plan_id": 3,
      "version_no": "version no 3",
      "image_type": "IN_RESTORATION",
      "file_path": "file path 3",
      "capture_at": "2026-06-13T09:00:00Z",
      "note": "note 3"
    }
  ],
  "materialStock": [
    {
      "id": 1,
      "material_name": "环氧树脂 E-44",
      "batch_no": "B-2026-01",
      "total_amount": 500,
      "unit": "g",
      "expire_date": "2027-12-31",
      "stocked_in_at": "2026-01-10T08:30:00Z",
      "stocked_in_by": 3,
      "used_amount": 90,
      "remaining_amount": 410,
      "expired": false
    },
    {
      "id": 2,
      "material_name": "矿物颜料（石青）",
      "batch_no": "B-2026-02",
      "total_amount": 300,
      "unit": "g",
      "expire_date": "2026-06-30",
      "stocked_in_at": "2026-01-12T08:30:00Z",
      "stocked_in_by": 3,
      "used_amount": 0,
      "remaining_amount": 300,
      "expired": true
    },
    {
      "id": 3,
      "material_name": "金箔胶",
      "batch_no": "B-2026-03",
      "total_amount": 100,
      "unit": "g",
      "expire_date": "2027-06-30",
      "stocked_in_at": "2026-02-02T08:30:00Z",
      "stocked_in_by": 3,
      "used_amount": 90,
      "remaining_amount": 10,
      "expired": false
    },
    {
      "id": 4,
      "material_name": "虫胶漆片",
      "batch_no": "B-2026-04",
      "total_amount": 200,
      "unit": "g",
      "expire_date": "2028-01-01",
      "stocked_in_at": "2026-03-18T08:30:00Z",
      "stocked_in_by": 3,
      "used_amount": 80,
      "remaining_amount": 120,
      "expired": false
    },
    {
      "id": 5,
      "material_name": "糯米浆糊",
      "batch_no": "B-2025-09",
      "total_amount": 250,
      "unit": "g",
      "expire_date": "2026-03-01",
      "stocked_in_at": "2025-09-01T08:30:00Z",
      "stocked_in_by": 3,
      "used_amount": 0,
      "remaining_amount": 250,
      "expired": true
    }
  ] as MaterialStock[],
  "materialRequisition": [
    {
      "id": 1,
      "requisition_no": "MR-2026-0001",
      "plan_id": 1,
      "step_id": 3,
      "batch_no": "B-2026-01",
      "material_name": "环氧树脂 E-44",
      "used_amount": 60,
      "unit": "g",
      "opened_at": "2026-09-18T09:05:00Z",
      "operator_id": 1,
      "status": "REVIEWED",
      "completed_at": "2026-09-20T16:30:00Z",
      "reviewer_id": 2,
      "reviewed_at": "2026-09-21T10:00:00Z",
      "review_note": "批号、克数与剩余量核对无误",
      "replaced_requisition_id": null,
      "replaced_requisition_no": null,
      "archived_at": null,
      "list_bucket": "DONE"
    },
    {
      "id": 2,
      "requisition_no": "MR-2026-0002",
      "plan_id": 1,
      "step_id": 2,
      "batch_no": "B-2026-03",
      "material_name": "金箔胶",
      "used_amount": 90,
      "unit": "g",
      "opened_at": "2026-09-25T14:20:00Z",
      "operator_id": 1,
      "status": "ISSUED",
      "completed_at": "",
      "reviewer_id": null,
      "reviewed_at": null,
      "review_note": "",
      "replaced_requisition_id": null,
      "replaced_requisition_no": null,
      "archived_at": null,
      "list_bucket": "TO_REVIEW"
    },
    {
      "id": 3,
      "requisition_no": "MR-2026-0003",
      "plan_id": 2,
      "step_id": 4,
      "batch_no": "B-2026-04",
      "material_name": "虫胶漆片",
      "used_amount": 80,
      "unit": "g",
      "opened_at": "2026-09-22T09:40:00Z",
      "operator_id": 2,
      "status": "PENDING_REVIEW",
      "completed_at": "2026-09-24T11:00:00Z",
      "reviewer_id": null,
      "reviewed_at": null,
      "review_note": "",
      "replaced_requisition_id": null,
      "replaced_requisition_no": null,
      "archived_at": null,
      "list_bucket": "TO_REVIEW"
    },
    {
      "id": 4,
      "requisition_no": "MR-2025-0901",
      "plan_id": 4,
      "step_id": 5,
      "batch_no": "B-2026-01",
      "material_name": "环氧树脂 E-44",
      "used_amount": 30,
      "unit": "g",
      "opened_at": "2025-10-28T09:00:00Z",
      "operator_id": 1,
      "status": "ARCHIVED",
      "completed_at": "2025-11-02T10:00:00Z",
      "reviewer_id": null,
      "reviewed_at": null,
      "review_note": "方案退回重审，领用记录留档备查；重开步骤须另开新单",
      "replaced_requisition_id": null,
      "replaced_requisition_no": null,
      "archived_at": "2025-11-10T15:00:00Z",
      "list_bucket": "DONE"
    }
  ] as MaterialRequisition[]
};
