# SPS - Git 项目变更查看器

## 实施进度

### Phase 1: 脚手架搭建
- [x] 初始化 Tauri v2 + SolidJS + Vite 项目
- [x] 配置 Cargo.toml (git2 vendored, serde, thiserror)
- [x] 配置 tauri.conf.json (1200x800, 最小窗口约束)
- [x] 配置 .gitignore, package.json, vite.config.ts, tsconfig.json
- [x] 验证：`pnpm tauri dev` 打开窗口

### Phase 2: Rust 后端 - Git 操作
- [x] error.rs: SpsError 枚举
- [x] types.rs: 所有共享结构体
- [x] git/ 模块: repo, status, log, diff, scan
- [x] commands/ 模块: 薄层封装
- [x] state.rs: 项目列表 JSON 持久化
- [x] lib.rs: 注册所有命令
- [x] 验证：cargo build 编译通过

### Phase 3: 前端 - 布局和状态
- [x] global.css: 主题变量与基础布局样式（当前为浅色）
- [x] lib/types.ts + lib/tauri.ts
- [x] stores/: projects + changes
- [x] App.tsx: 双栏布局
- [x] 验证：主题样式与双栏布局

### Phase 4: 前端 - 侧边栏
- [x] AddProject 组件
- [x] ProjectList + ProjectItem 组件
- [ ] 验证：添加/扫描/移除项目（需手动测试）

### Phase 5: 前端 - 工作区变更
- [x] ChangePanel + ModeToggle
- [x] WorkingChanges + FileItem
- [x] 点击文件展开 DiffView
- [ ] 验证：选中项目显示变更文件（需手动测试）

### Phase 6: 前端 - Diff 展示
- [x] DiffView / DiffHunk / DiffLine 组件
- [x] diff.module.css 样式
- [ ] 验证：diff 显示正确（需手动测试）

### Phase 7: 前端 - 提交历史
- [x] CommitHistory 组件
- [x] CommitFiles 组件（复用 FileItem + DiffView）
- [ ] 验证：浏览提交和 diff（需手动测试）

### Phase 8: 收尾
- [x] Loading/空状态/错误处理
- [x] 自动刷新 (5s 轮询)
- [ ] 窗口标题更新（未实现，优先级低）

### Phase 9: 结构治理补齐（2026-03-01）
- [x] 新增 `docs/rules/project.md`（项目结构与边界规则）
- [x] 新增 `docs/rules/业务规则配置规范.md`（业务配置项基线）
- [x] 完成项目结构评估并落地第一阶段修复

## 回顾（2026-03-01）

- 本次修复聚焦结构治理缺口，不改动运行逻辑，风险低。
- 当前已建立规则文档基线，后续代码改动可按规则同步更新。
- 下一步建议：补齐 `test/lint/typecheck` 脚本与 CI 门禁。
