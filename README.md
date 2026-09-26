# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition: constants/RelicCondition、types/RelicCondition、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanApprovalStatus: constants/PlanApprovalStatus、types/PlanApprovalStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- DamageSeverity: constants/DamageSeverity、types/DamageSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- MaterialRequisitionStatus: `backend/src/constants/MaterialRequisitionStatus.ts`、`frontend/src/constants/MaterialRequisitionStatus.ts`（含中文文案）、`types/MaterialRequisition`、`constructors/MaterialRequisition*`、`constants/statusText`、`constants/logTemplates`、`constants/errorMessages`/`errorCodes`（MATERIAL_REVIEW_SELF 等）、`utils/formatters`、`components/common/MaterialRequisitionPanel`、`MaterialBatchTag`、领用列表三段筛选（待领用/待复核/已完成）均有引用。
- RestorationStepStatus: `backend/src/constants/RestorationStepStatus.ts`、种子数据、RestorationStep 模型/仓储/服务、`MaterialRequisitionService`（步骤开工/完工/重开流转）、前端步骤状态徽标。
- MaterialRequisitionBucket: `backend/src/constants/MaterialRequisitionBucket.ts`、`frontend/src/constants/MaterialRequisitionBucket.ts`、领用列表 `?bucket=` 过滤、`MaterialRequisitionPanel` 标签页。

## 材料台账与领用流程

1. **入库登记**：`POST /api/material-stock`，按批号（batch_no 唯一）登记材料名称、入库总量（克）、有效期。台账列表返回累计领用与剩余量，并标记是否过期。
2. **步骤现场领用**：`POST /api/material-requisition`，步骤开始后由操作人选择批号、填写克数与开封时间。命中以下任一情况后端直接 409 挡住并返回原因：材料已过期（MATERIAL_EXPIRED）、总领用量超过入库量（MATERIAL_OVERDRAWN）、同批号仍被另一个未结方案占用（MATERIAL_BATCH_OCCUPIED）。前端 `useMaterialGuard` 会在提交前同步预检并禁用按钮。
3. **完工送复核**：`POST /api/restoration-step/:id/complete`，已领用单据进入 PENDING_REVIEW。
4. **他人按批号复核**：`POST /api/material-requisition/:id/review`，复核人不得与领用人同人（MATERIAL_REVIEW_SELF），复核通过（REVIEWED）才计入方案进度（`GET /api/restoration-plan/:id/progress`）。
5. **退回重审留档**：`POST /api/material-requisition/plan/:planId/archive`（或 `POST /api/restoration-plan/:id/reject`），领用单置为 ARCHIVED 留档不删除；被重开的步骤回到待领用，再次领用另开新单，可通过 `replaced_requisition_id` 关联旧单、凭旧单号追查。
6. **列表三段**：待领用（TO_PICKUP，无活动领用单的步骤）、待复核（TO_REVIEW，ISSUED/PENDING_REVIEW）、已完成（DONE，REVIEWED/ARCHIVED），页面见「材料台账与领用」，「修复方案」页按方案复用同一现场面板。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
