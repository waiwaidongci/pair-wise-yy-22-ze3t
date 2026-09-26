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
- MaterialIssueStatus: `backend/src/constants/MaterialIssueStatus.ts`、`frontend/src/constants/MaterialIssueStatus.ts`（含中文文案表）、`frontend/src/constants/statusText.ts`、`backend/src/services/MaterialIssueService.ts`、`frontend/src/hooks/useMaterialIssueGuard.ts`、`frontend/src/components/common/MaterialIssueStatusBadge.tsx`、`frontend/src/pages/MaterialsPage.tsx`（列表筛选）、`frontend/src/pages/PlansPage.tsx`（方案进度）均有引用。

## 材料台账（MaterialBatch + MaterialIssue）

材料领用不再写进步骤备注，改为台账管理，贯穿 `database/init.sql` → 后端 routes/controllers/services/repositories/models/constructors/constants → 前端 api/stores/constructors/hooks/pages。

- **入库登记**：`POST /api/material-batch`，按批号登记总量（克）与有效期；批次台账展示总量、剩余量与有效期。
- **开单领用**：步骤开始后开领用单（`POST /api/material-issue`，单号 `MI-<步骤>-<轮次>`），操作人领用时记克数与开封时间（`POST /api/material-issue/:id/issue`）。页面与后端双重拦截并说明原因：
  - `MATERIAL_EXPIRED` 材料已过期，禁止领用；
  - `MATERIAL_OVER_ISSUED` 总领用量超过入库量（含已留档旧单的消耗）；
  - `MATERIAL_BATCH_OCCUPIED` 同批号仍被另一个未结方案占用。
- **复核**：完工后由另一名修复师按批号复核（`POST /api/material-issue/:id/review`），复核人与操作人相同会被 `MATERIAL_REVIEWER_CONFLICT` 挡住；复核通过才计入方案进度。
- **退回重审**：`POST /api/material-issue/plan/:planId/return` 将方案在途领用单留档（ARCHIVED），重开步骤另开新单（轮次递增），旧单在「已归档」列表追查。
- **列表**：材料台账页 `/materials` 提供待领用、待复核、已完成、已归档四个列表；修复方案页 `/plans` 展示各步骤领用单与方案进度。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
