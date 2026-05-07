# 个人知识库（ai-my_kbs）

一个最小可用的个人知识库 Web 应用，支持本地运行，也可以部署到 Vercel 进行演示。技术栈：**Next.js App Router + TypeScript + Tailwind CSS + Prisma + SQLite**。

## 功能

- 新建、编辑、删除笔记
- Markdown 编辑与实时预览
- 上传 Markdown、TXT 和基础 DOCX 文本文件导入笔记内容
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


## 当前可运行状态与依赖清单

当前代码已经包含应用源码、配置、Prisma schema、数据库初始化脚本和 smoke test。要真正启动 Web 应用，还必须先安装 `package.json` 中声明的 npm 依赖，并初始化 SQLite 数据库。

运行所需信息：

- Node.js 20 或更高版本
- 可访问 npm registry 的网络或可用的内部 npm 镜像
- `.env` 文件中的 `DATABASE_URL`，本地默认可使用 `.env.example` 提供的 `file:./dev.db`
- 首次运行前执行 `npm run db:init`，生成 Prisma Client、创建 SQLite 表并写入演示数据

核心运行依赖在 `package.json` 中维护，包括 `next`、`react`、`react-dom`、`prisma` 和 `@prisma/client`；开发检查依赖包括 TypeScript、ESLint、Tailwind CSS、PostCSS、Autoprefixer 和类型声明包。

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

Vercel 支持通过 Git 集成、CLI、Deploy Hooks 或 REST API 创建部署。最省心的方式是把仓库导入 Vercel 并让每次 push 自动触发部署；如果要由命令行部署，需要 Vercel CLI 和具备部署权限的 `VERCEL_TOKEN`。仅提供 Vercel 用户 ID 不能完成部署，因为用户 ID 不能用于认证或授权。

### 方式 A：Git 导入部署（推荐）

1. 将仓库推送到 GitHub/GitLab/Bitbucket/Azure DevOps。
2. 在 Vercel 新建项目并导入仓库。
3. 在 Vercel 项目环境变量中配置：

   ```text
   DATABASE_URL=file:/tmp/ai-my-kbs.db
   ```

4. Build Command 使用默认 `npm run build`。
5. 部署完成后访问 Vercel 生成的域名。

### 方式 B：Vercel CLI 部署

在已安装依赖、已登录或已提供 token 的环境中运行：

```bash
npm install
npm run db:init
npx vercel --yes --token "$VERCEL_TOKEN"
npx vercel --prod --yes --token "$VERCEL_TOKEN"
```

如需先在 Vercel 项目中写入环境变量，可使用：

```bash
npx vercel env add DATABASE_URL production --token "$VERCEL_TOKEN"
```

如果项目属于团队，还需要使用 Vercel 的 team slug/账号 scope，例如 `--scope your-team-slug`。


### `DATABASE_URL` 应该填什么？

当前项目的 Prisma schema 使用 SQLite，因此本地或 Vercel 演示部署可以使用：

```text
DATABASE_URL=file:./dev.db
```

Vercel 演示部署建议使用：

```text
DATABASE_URL=file:/tmp/ai-my-kbs.db
```

应用会在每次 SQLite 查询前检查 `Note`、`Tag` 和 `_NoteTags` 表是否存在；如果 Vercel 冷启动拿到的是新的 `/tmp` 数据库，会自动创建所需表和演示数据，避免 Vercel Serverless 运行时报 `Error code 14: Unable to open the database file` 或 `P2021: The table main.Note does not exist in the current database`。

但这些 SQLite 值只适合本地开发或 Vercel 演示。SQLite 是文件数据库，Vercel Serverless 运行环境不适合作为长期可写的文件数据库存储；部署后新增/编辑的笔记不应依赖该 SQLite 文件做生产级持久化。

如果要在 Vercel 上长期保存真实笔记，需要先创建一个托管数据库并使用它提供的连接串。Vercel Marketplace 可以创建或连接 Postgres 等数据库，并把凭据注入为项目环境变量。注意：如果改用 Postgres，当前 `prisma/schema.prisma` 里的 datasource provider 也要从 `sqlite` 改为 `postgresql`，并重新执行 Prisma 初始化/迁移；不能只把 Postgres 连接串填进当前 SQLite schema。

我不能直接替你“提供”一个生产 `DATABASE_URL`，因为它包含数据库账号、密码、主机和库名，必须由你的数据库服务商或 Vercel Marketplace 在你的账号下生成。

### 关于 SQLite 和 Vercel 的说明

SQLite 文件数据库非常适合本地开发和个人离线使用。Vercel 的 Serverless 文件系统不适合保存长期可写数据，因此直接使用 SQLite 部署到 Vercel 更适合演示或只读场景。若要在生产环境长期保存笔记，建议把 Prisma datasource 切换到托管数据库（例如 PostgreSQL、Turso/libSQL 等）。

## 文件上传说明

在新建或编辑笔记页面，可以上传 `.md`、`.markdown`、`.txt` 和 `.docx` 文件导入正文内容：

- Markdown/TXT 会直接按纯文本读取。
- DOCX 会尝试读取 `word/document.xml` 中的正文文本，适合基础 Word 文档；复杂排版、图片、表格和批注不会被保留。
- 上传后仍可在编辑器中继续修改内容，再点击保存。

## 使用说明

1. 首页点击「新建笔记」。
2. 输入标题、标签和 Markdown 内容。
3. 右侧实时查看 Markdown 预览。
4. 本地保存后进入详情页；Vercel SQLite 演示环境保存后会回到首页，并在首页列表中展示刚保存的笔记。
5. 如果 Vercel 临时 SQLite 文件被切换到新实例，首页会使用短期保存回执临时展示刚保存的笔记，方便确认保存结果。
6. 在详情页点击「返回首页」或「返回列表」回到首页，也可以点击「编辑」修改内容，或点击「删除」移除笔记。
7. 回到首页，在搜索框输入关键词可搜索标题、正文和标签。

## 测试

```bash
npm run lint
npm run typecheck
npm run test
```

当前 smoke test 会检查关键项目文件、Prisma SQLite schema 和 npm 脚本是否齐全。
