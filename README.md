# SPS

<p align="center">
  <strong>一个基于 Tauri + SolidJS 的 Git 变更查看器</strong><br/>
  聚焦本地仓库的工作区变更、提交历史与 Diff 细读体验。
</p>

<p align="center">
  <img alt="tauri" src="https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white" />
  <img alt="solidjs" src="https://img.shields.io/badge/SolidJS-1.9-2C4F7C?logo=solid&logoColor=white" />
  <img alt="typescript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img alt="rust" src="https://img.shields.io/badge/Rust-stable-000000?logo=rust&logoColor=white" />
  <img alt="vite" src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white" />
</p>

## Introduction

SPS 用于快速浏览本地 Git 仓库状态，提供三栏式界面：

- 左栏：项目列表（扫描/添加/移除）
- 中栏：文件列表（Working Changes 或 History）
- 右栏：文件 Diff 详情（支持单文件横向滚动）

当前目标是“高可读的变更审阅”，不包含提交、暂存、回滚、推拉远程等写操作。

## Features

- 多项目管理：扫描目录自动发现 Git 仓库
- Working Changes：按文件查看状态、增删行统计
- Commit History：查看提交列表、提交内文件变更
- 三栏布局：列表与详情解耦，审阅路径更清晰
- Diff 体验优化：
  - 每个文件一个横向滚动条（非逐行滚动条）
  - Ruby 语法高亮（`.rb/.rake/.gemspec/.ru`、`Gemfile`、`Rakefile`、`config.ru`）
- 轮询刷新优化：减少无变化重渲染，避免阅读时视图跳动

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Rust stable
- Tauri v2 运行依赖（按平台安装）

### Install

```bash
pnpm install
```

### Run in Dev

```bash
pnpm tauri dev
```

### Build Frontend

```bash
pnpm build
```

### Check Rust Backend

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

## Usage

1. 启动应用后在左栏添加或扫描项目目录
2. 选择项目后默认进入 `Working Changes`
3. 在中栏点击文件查看右栏 Diff
4. 切换到 `History` 可查看提交与提交内文件 Diff

## Project Structure

```text
.
├── src/                  # SolidJS 前端
│   ├── components/       # 侧边栏、变更列表、Diff 组件
│   ├── stores/           # 前端状态管理
│   ├── lib/              # 类型与 Tauri API 封装
│   └── styles/           # 全局样式与 Diff 样式
├── src-tauri/src/        # Rust + Tauri 后端
│   ├── commands/         # Tauri 命令入口（薄层）
│   ├── git/              # Git 读取逻辑（status/log/diff/scan）
│   └── state.rs          # 项目持久化
└── docs/rules/           # 项目规则与业务配置规范
```

## Architecture

- 前端通过 `src/lib/tauri.ts` 统一调用后端命令
- 后端 `commands/*` 只做编排，核心 Git 逻辑在 `git/*`
- 前后端共享类型需保持一致（Rust `types.rs` ↔ TS `src/lib/types.ts`）

## Development Notes

- 轮询仅在 `Working Changes` 模式启用（默认 5 秒）
- Diff 渲染采用文件级滚动容器，避免逐行滚动条
- 对超长 Ruby 行会降级为纯文本，减少高亮性能开销

## Roadmap

- [ ] 更多语言语法高亮（JS/TS/Go/Rust 等）
- [ ] 提交/暂存等写操作（需额外安全设计）
- [ ] 搜索过滤与更完整的 Diff 导航
- [ ] 自动化测试与 CI 门禁补齐

## Contributing

欢迎提交 Issue / PR。

建议流程：

1. 先描述问题与复现步骤
2. 小步改动并附验证结果（`pnpm build`、`cargo check`）
3. 同步更新 `docs/rules/` 中相关规则文档

## License

当前仓库尚未声明正式 License；如需开源发布，建议补充 LICENSE 文件。
