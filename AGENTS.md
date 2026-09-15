# Kana 项目协作指南

本文件适用于整个仓库。以当前任务中用户明确提出的要求为准。

## 沟通与工作方式

- 始终用中文沟通。以资深前端开发者的标准权衡实现、兼容性和维护成本。
- 编码前先阅读相关实现，明确陈述关键假设，不妄下断言或掩盖困惑。需求有不清楚的地方时，指出疑问并询问用户，不猜测影响行为的需求。
- 多步骤任务先简要说明计划，使用“1. [步骤] → 验证：[检查]”的格式。
- 优先完成用户要求的最小改动，不添加额外功能，不为一次性代码引入抽象，不处理不可能出现的错误情况。
- 最终回复说明改动、验证结果和未完成事项，并提供一个有用的其他视角或可选方案。
- 使用了 Skills 或规则时，在回复末尾说明。

## 项目与环境

- Kana 是日语假名练习工具，支持平假名、片假名、罗马音、翻卡、输入判题和复习。
- 技术栈：Next.js App Router、React、TypeScript 严格模式、Tailwind CSS 4、Radix UI、Framer Motion。
- 使用 Node.js 22；pnpm 版本以 `package.json` 的 `packageManager` 为准，当前为 `8.6.7`。
- 依赖实际版本以 `package.json` 和 `pnpm-lock.yaml` 为准。README 中的 pnpm 7 说明已经过时，不应据此降级。
- 使用 pnpm 管理依赖，不生成 npm 或 Yarn 锁文件。依赖修改必须同步更新 `pnpm-lock.yaml`。
- 部署平台为 Netlify。安全更新先核实官方公告及兼容要求，不直接采用未经核实的版本建议。

## 常用命令

```bash
pnpm install --frozen-lockfile  # 安装已锁定的依赖
pnpm dev                      # 启动开发服务
pnpm typecheck                # TypeScript 检查
pnpm test                     # 编译测试并运行 Node.js 内置测试运行器
pnpm build                    # 生产构建
pnpm start                    # 启动已构建的应用
```

主动更新依赖后使用 `pnpm install` 更新锁文件，再验证冻结锁文件安装。当前没有 lint 脚本，不要报告执行了不存在的检查。

## 代码位置与职责

- `app/page.tsx`：首页及设置、练习、汇总页面的组合。
- `app/layout.tsx`：页面元信息、字体、主题及全局脚本。
- `app/globals.css`：全局样式和响应式布局。
- `components/settings-panel.tsx`、`kana-grid.tsx`：练习配置及假名选择。
- `components/practice-panel.tsx`、`summary-panel.tsx`：练习交互及结果展示。
- `components/ui/`：可复用基础控件，优先使用现有组件。
- `lib/kana-data.ts`：假名数据及相关类型，是假名数据的统一来源。
- `lib/practice.ts`：筛选、洗牌、练习状态转换和答案判定等纯逻辑。
- `lib/use-practice.ts`：连接 React 状态、计时器和掌握标记更新。
- `lib/saved-settings.ts`：存档解析与恢复逻辑。
- `lib/use-saved-settings.ts`：浏览器存储读写与设置状态。
- `tests/*.test.ts`：业务逻辑测试，由 `tsconfig.test.json` 编译至 `.test-build/`。

## 修改约定

- 先检查 `git status` 和相关差异，保留用户已有的修改，不覆盖或顺带提交无关内容。
- 保持被编辑文件的现有风格，包括分号、引号和导入方式；不要为了统一格式修改相邻代码。
- 不重构没有问题的代码，不顺带调整无关注释、样式或配置。
- 删除因本次修改而不再使用的导入、变量和函数。已有的无关无效代码只指出，不擅自删除。
- 复用现有数据、基础控件和 `cn` 工具；跨目录导入可使用已配置的 `@/` 路径别名。
- 业务计算和状态转换保持在纯逻辑模块中，浏览器副作用由 Hook 或客户端组件处理。
- 使用 Hooks、事件或浏览器 API 的组件应遵守客户端边界。不要在服务端渲染时直接访问 `window` 或 `localStorage`。
- 保持现有深色主题和移动端布局，交互修改兼顾键盘、焦点、可访问名称及表单控件默认行为。
- 不提交 `.next/`、`.test-build/`、`node_modules/`、环境文件或密钥。
- 提交、推送或部署按照当前用户授权执行；生成或修改文件本身不代表自动获得推送授权。

## 业务约束

除非任务明确要求改变行为，修改时保持以下约束：

- 假名按字符身份区分，同音罗马音不能导致不同假名被合并。
- 题库每轮完整洗牌，轮内不重复；多张卡时轮次交界不连续重复。空范围不能开始练习。
- 有限轮次最后一题处理完成后结束；计时扣除暂停时间，过期计时器或重复事件不能重复记录结果。
- 输入模式关闭自动切题，保留当前答案归一化和同音假名判定规则。
- 跳过不覆盖掌握标记；正确率仅统计已提交答案，待复习列表按每个假名最后一次有效判定去重。
- 浏览器只恢复设置与掌握标记，不恢复正在进行的练习。存储不可用时仍能练习，并保留用户提示。
- 修改存档结构时考虑现有 `kana.practice.v1` 数据，明确兼容或版本迁移策略。

## 验证与交付

- 根据改动选择检查：业务逻辑修改运行 `pnpm test` 和 `pnpm typecheck`；依赖、构建配置或页面集成修改运行 `pnpm build`。
- 新增或改变业务行为时补充有意义的测试；纯文档和低影响样式改动不要求新增测试。
- UI 修改检查相关桌面、移动端及键盘交互。未实际验证的项目需明确说明。
- 完成前检查差异范围和 `git diff --check`。验证通过后不无故重复执行同一检查。
- 区分本地构建成功、推送成功和线上部署成功，不能用前者代替后者。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
