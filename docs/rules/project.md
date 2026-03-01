# SPS 项目规则

## 1. 目标与范围

SPS 是一个基于 Tauri + SolidJS 的 Git 项目变更查看器，当前范围仅包含：

- 项目扫描与添加/移除
- 工作区变更列表与 Diff 展示
- 提交历史与提交级 Diff 展示
- 三栏界面布局（项目列表 / 文件列表 / 文件详情）

不在当前范围内：

- 提交、暂存、回滚等写操作
- 远程仓库同步（fetch/pull/push）
- 多用户、权限系统

## 2. 技术栈与目录规范

| 领域 | 技术/目录 | 说明 |
| --- | --- | --- |
| 前端 | `src/`（SolidJS + TypeScript + Vite） | 页面结构、状态管理、Tauri 调用封装 |
| 后端 | `src-tauri/src/`（Rust + Tauri v2 + git2） | Git 读操作、状态持久化、命令入口 |
| 规则文档 | `docs/rules/` | 项目与业务规则基线 |
| 临时文件 | `tmp/` | 临时脚本与临时文档，完成后删除 |
| 任务记录 | `tasks/` | 阶段任务与回顾 |

## 3. 模块职责与边界

| 模块 | 文件/目录 | 职责 | 边界 |
| --- | --- | --- | --- |
| 应用编排层 | `src/App.tsx` | 选择项目后的加载流程、轮询调度 | 不直接操作底层 git 细节 |
| 前端状态层 | `src/stores/*.ts` | UI 状态与异步加载动作 | 不直接拼接 Git 命令或读取本地文件 |
| 前端 API 适配层 | `src/lib/tauri.ts` | 统一管理 `invoke` 调用 | 不包含业务状态 |
| Tauri 命令层 | `src-tauri/src/commands/*.rs` | 薄层编排（参数透传、错误上抛） | 不实现复杂 Git 逻辑 |
| Git 领域层 | `src-tauri/src/git/*.rs` | 仓库扫描、状态计算、日志与 diff 解析 | 不处理 UI 相关逻辑 |
| 持久化层 | `src-tauri/src/state.rs` | 管理项目列表 JSON 持久化 | 不做 Git 计算 |

## 4. 数据来源与流转

| 数据类型 | 来源 | 处理链路 | 最终使用 |
| --- | --- | --- | --- |
| 项目信息 | 本地 Git 仓库 | `git::repo` -> `commands::project` -> `src/stores/projects.ts` | 侧边栏项目列表 |
| 工作区变更 | `git2::Repository::statuses` + diff 统计 | `git::status` -> `commands::status` -> `src/stores/changes.ts` | Working Changes 列表 |
| 历史提交 | `revwalk` | `git::log` -> `commands::history` -> `src/stores/changes.ts` | History 列表 |
| 文件 Diff | `diff_index_to_workdir` / `diff_tree_to_tree` | `git::diff` -> `commands::diff` -> `DiffView` 组件 | Diff 展示区 |

## 5. 关键机制规则

1. 命令分层规则：`commands` 仅做调用编排，Git 逻辑集中在 `git/*`。
2. 类型一致性规则：Rust `types.rs` 与前端 `src/lib/types.ts` 字段必须一一对应。
3. 扫描性能规则：目录扫描应维持可控深度并跳过大目录（如 `node_modules`、`target`）。
4. 持久化安全规则：仅持久化项目路径，不持久化敏感凭据。
5. 轮询规则：轮询只在工作区模式开启；模式切换、项目切换或项目取消选择时必须清理并重建定时器。
6. Diff 滚动规则：横向滚动条按“文件维度”提供，禁止按单行生成独立滚动容器。
7. Diff 高亮规则：语法高亮按文件类型启用，当前至少支持 Ruby（`.rb/.rake/.gemspec/.ru` 及 `Gemfile` 等）。

## 6. 依赖关系

- 前端依赖后端命令接口，不允许跨层直接依赖 Git 实现细节。
- `git::repo` 依赖 `git::status` 计算变更数；变更时需评估联动影响。
- `state.rs` 依赖 `git::repo::get_project_info` 在启动时恢复有效项目。

## 7. 验收标准

每次结构性改动后至少满足：

1. 目录与职责未越界（新增逻辑放到对应层）。
2. 前后端共享类型保持一致（字段名、枚举值一致）。
3. 基础构建可通过（`pnpm build`、`cargo check`）。
4. 规则文档同步更新（本目录下对应规则文件）。

## 8. ⚠️ 严禁事项

- 严禁在组件中直接调用 `invoke`，必须通过 `src/lib/tauri.ts`。
- 严禁在 `commands` 层堆叠复杂业务逻辑（应下沉到 `git/*`）。
- 严禁读取 `.env*`、`config/credentials*`、`secrets/**`。
- 严禁在未同步 `docs/rules` 的情况下合并结构性改动。
