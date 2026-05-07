# 个人知识库（ai-my_kbs）

一个最小可用的个人知识库 Web 应用，支持本地运行，也可以部署到 Vercel 进行演示。技术栈：**Next.js App Router + TypeScript + Tailwind CSS + Prisma + SQLite**。

## 功能

- 新建、编辑、删除笔记
- Markdown 编辑与实时预览
- 标签系统（英文逗号分隔输入）
- 标题、正文、标签全文搜索
- 笔记详情页
- 首页仪表盘（笔记数、标签数、最近更新）
- Prisma + SQLite 本地数据库初始化与种子数据
- 基础 smoke test

## 项目结构

```text
app/                  Next.js App Router 页面与 Server Actions
components/           笔记卡片、编辑器、Markdown 预览组件
lib/                  Prisma 客户端、Markdown 渲染、标签解析工具
prisma/               Prisma schema 与 seed 脚本
scripts/              smoke test
```

## 本地安装

> 需要 Node.js 20+。推荐复制 `.env.example` 为 `.env`，默认使用 `prisma/dev.db`。

```bash
npm install
cp .env.example .env
npm run db:init
```

`npm run db:init` 会执行：

1. `prisma generate`
2. `prisma db push`
3. `npm run db:seed`


## npm install 失败排查

如果安装依赖时报 `403 Forbidden`，通常不是项目代码问题，而是当前网络、代理或 npm registry 访问策略阻止了下载包。可以按下面顺序排查：

1. 确认当前 registry：

   ```bash
   npm config get registry
   ```

2. 使用官方 registry 重试：

   ```bash
   npm install --registry=https://registry.npmjs.org/
   ```

3. 如果在公司网络、CI 或受限容器中运行，请检查代理环境变量，例如 `HTTP_PROXY`、`HTTPS_PROXY`、`npm_config_http_proxy`、`npm_config_https_proxy`。代理返回 `403 Forbidden` 时，需要更换网络、放行 registry，或配置可访问的内部 npm 镜像。

4. 如果使用内部 npm 镜像，请让镜像同步并放行本项目依赖，尤其是 `next`、`react`、`@prisma/client`、`prisma`、`typescript`、`eslint` 和 `tailwindcss`。

依赖没有安装成功时，系统无法本地启动或构建，因为 `npm run dev`、`npm run build`、`npm run lint` 和 `npm run typecheck` 都依赖 `node_modules` 中的 Next.js、Prisma、React 与 TypeScript 包。只要在可访问 npm registry 的环境中完成 `npm install` 和 `npm run db:init`，应用即可正常本地运行。

## 本地运行

```bash
npm run dev
```

打开 <http://localhost:3000>。

## 常用脚本

```bash
npm run lint       # 运行 Next.js/ESLint 检查
npm run typecheck  # 运行 TypeScript 类型检查
npm run test       # 运行 smoke test
npm run build      # 生成 Prisma Client 并构建 Next.js 应用
npm run db:init    # 初始化 SQLite 数据库并写入演示笔记
npm run db:seed    # 重新写入/更新演示笔记
```

## 部署到 Vercel

1. 将仓库推送到 GitHub/GitLab/Bitbucket。
2. 在 Vercel 新建项目并导入仓库。
3. 在 Vercel 环境变量中配置：

   ```text
   DATABASE_URL=file:./dev.db
   ```

4. Build Command 使用默认 `npm run build`。
5. 部署完成后访问 Vercel 域名。

### 关于 SQLite 和 Vercel 的说明

SQLite 文件数据库非常适合本地开发和个人离线使用。Vercel 的 Serverless 文件系统不适合保存长期可写数据，因此直接使用 SQLite 部署到 Vercel 更适合演示或只读场景。若要在生产环境长期保存笔记，建议把 Prisma datasource 切换到托管数据库（例如 PostgreSQL、Turso/libSQL 等）。

## 使用说明

1. 首页点击「新建笔记」。
2. 输入标题、标签和 Markdown 内容。
3. 右侧实时查看 Markdown 预览。
4. 保存后进入详情页。
5. 在详情页点击「编辑」修改内容，或点击「删除」移除笔记。
6. 回到首页，在搜索框输入关键词可搜索标题、正文和标签。

## 测试

```bash
npm run lint
npm run typecheck
npm run test
```

当前 smoke test 会检查关键项目文件、Prisma SQLite schema 和 npm 脚本是否齐全。
