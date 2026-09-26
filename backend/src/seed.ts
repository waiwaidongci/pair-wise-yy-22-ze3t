export const seed = {
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
      "approval_status": "SUBMITTED",
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
    }
  ],
  "restorationStep": [
    {
      "id": 1,
      "plan_id": 1,
      "step_order": "step order 1",
      "technique": "technique 1",
      "material_used": "material used 1",
      "operator_id": 1,
      "step_status": "SUBMITTED",
      "finished_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "plan_id": 2,
      "step_order": "step order 2",
      "technique": "technique 2",
      "material_used": "material used 2",
      "operator_id": 2,
      "step_status": "APPROVED",
      "finished_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "plan_id": 3,
      "step_order": "step order 3",
      "technique": "technique 3",
      "material_used": "material used 3",
      "operator_id": 3,
      "step_status": "DRAFT",
      "finished_at": "2026-06-13T09:00:00Z"
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
  "materialBatch": [
    {
      "id": 1,
      "batch_no": "B72-2026-041",
      "material_name": "Paraloid B72 加固胶",
      "total_quantity": 500,
      "unit": "g",
      "expiry_date": "2027-03-31T00:00:00Z",
      "stocked_by": 4,
      "stocked_at": "2026-08-01T09:00:00Z",
      "note": "避光密封保存"
    },
    {
      "id": 2,
      "batch_no": "EA-2025-013",
      "material_name": "环氧树脂粘接剂",
      "total_quantity": 200,
      "unit": "g",
      "expiry_date": "2026-05-31T00:00:00Z",
      "stocked_by": 4,
      "stocked_at": "2025-12-10T09:00:00Z",
      "note": "已过有效期，禁止上场"
    },
    {
      "id": 3,
      "batch_no": "CY-2026-077",
      "material_name": "虫胶封护剂",
      "total_quantity": 100,
      "unit": "g",
      "expiry_date": "2027-01-15T00:00:00Z",
      "stocked_by": 4,
      "stocked_at": "2026-07-15T09:00:00Z",
      "note": "余量紧张"
    },
    {
      "id": 4,
      "batch_no": "BF-2026-105",
      "material_name": "补缺石膏粉",
      "total_quantity": 300,
      "unit": "g",
      "expiry_date": "2027-06-30T00:00:00Z",
      "stocked_by": 4,
      "stocked_at": "2026-08-20T09:00:00Z",
      "note": "方案 2 正在使用"
    }
  ],
  "materialIssue": [
    {
      "id": 1,
      "issue_no": "MI-1-1",
      "batch_id": 1,
      "step_id": 1,
      "plan_id": 1,
      "operator_id": 1,
      "quantity": 120,
      "opened_at": "2026-09-10T09:30:00Z",
      "status": "COMPLETED",
      "reviewer_id": 2,
      "reviewed_at": "2026-09-12T15:00:00Z",
      "review_note": "用量与现场记录一致",
      "round": 1,
      "created_at": "2026-09-10T09:00:00Z",
      "archived_at": null
    },
    {
      "id": 2,
      "issue_no": "MI-2-1",
      "batch_id": 3,
      "step_id": 2,
      "plan_id": 2,
      "operator_id": 2,
      "quantity": 90,
      "opened_at": "2026-09-20T10:00:00Z",
      "status": "PENDING_REVIEW",
      "reviewer_id": null,
      "reviewed_at": null,
      "review_note": "",
      "round": 1,
      "created_at": "2026-09-20T09:00:00Z",
      "archived_at": null
    },
    {
      "id": 3,
      "issue_no": "MI-2-2",
      "batch_id": 4,
      "step_id": 2,
      "plan_id": 2,
      "operator_id": 2,
      "quantity": null,
      "opened_at": null,
      "status": "PENDING_ISSUE",
      "reviewer_id": null,
      "reviewed_at": null,
      "review_note": "",
      "round": 2,
      "created_at": "2026-09-22T09:00:00Z",
      "archived_at": null
    },
    {
      "id": 4,
      "issue_no": "MI-3-1",
      "batch_id": 1,
      "step_id": 3,
      "plan_id": 3,
      "operator_id": 3,
      "quantity": 30,
      "opened_at": "2026-09-05T14:00:00Z",
      "status": "ARCHIVED",
      "reviewer_id": 2,
      "reviewed_at": "2026-09-08T10:00:00Z",
      "review_note": "方案退回重审，领用记录留档",
      "round": 1,
      "created_at": "2026-09-05T13:30:00Z",
      "archived_at": "2026-09-08T10:00:00Z"
    },
    {
      "id": 5,
      "issue_no": "MI-3-2",
      "batch_id": 2,
      "step_id": 3,
      "plan_id": 3,
      "operator_id": 3,
      "quantity": null,
      "opened_at": null,
      "status": "PENDING_ISSUE",
      "reviewer_id": null,
      "reviewed_at": null,
      "review_note": "",
      "round": 2,
      "created_at": "2026-09-24T09:00:00Z",
      "archived_at": null
    }
  ]
} as const;
