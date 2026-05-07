# 个人知识库（ai-my_kbs）

一个最小可用的个人知识库 Web 应用，支持本地运行，也可以部署到本机 Docker 或 Vercel。技术栈：**Next.js App Router + TypeScript + Tailwind CSS + Prisma + MySQL**。

## 功能

- 新建、编辑、删除笔记
- Markdown 编辑与实时预览
- 上传 Markdown、TXT 和基础 DOCX 文本文件导入笔记内容
- 标签系统（英文逗号分隔输入）
- 标题、正文、标签全文搜索
- 笔记详情页与返回首页/列表按钮
- 首页仪表盘（笔记数、标签数、最近更新）
- Prisma + MySQL 数据库初始化与种子数据
- 基础 smoke test

## 项目结构

```text
app/                  Next.js App Router 页面与 Server Actions
components/           笔记卡片、编辑器、Markdown 预览组件
docker/mysql/init/    MySQL 初始化 SQL
lib/                  Prisma 客户端、Markdown 渲染、标签解析工具
prisma/               Prisma schema 与 seed 脚本
scripts/              smoke test
```

## 需要什么权限、什么信息？

### 必需权限

- 本机可以运行 Docker / Docker Compose。
- 当前终端用户有 Docker 权限：macOS/Windows 通常启动 Docker Desktop 即可；Linux 通常需要加入 `docker` 用户组，或使用 `sudo docker compose ...`。
- 本机端口 `3306` 和 `3000` 未被占用；如果已被占用，需要修改 `docker-compose.yml` 里的端口映射。
- 首次启动需要能从 Docker Hub 拉取镜像：`mysql:8.0.25` 和 `node:20-bookworm-slim`。

### 已内置的信息

本仓库已经内置一套本机 Docker MySQL 单机版配置：

- MySQL 版本：`8.0.25`
- 数据库名：`my_kbs`
- 应用用户：`my_kbs`
- 应用用户密码：`admin123`
- 本机连接串：`mysql://my_kbs:admin123@localhost:3306/my_kbs`
- Docker Compose 内部连接串：`mysql://my_kbs:admin123@mysql:3306/my_kbs`
- 数据卷：`mysql_data`，用于长期落盘保存 MySQL 数据

> 注意：`admin123` 适合本机开发/演示。若要暴露到公网或生产环境，请改成强密码，并同步修改 `.env` 和 `docker-compose.yml`。

## 本机 Docker 部署（推荐）

这个方式会同时启动 MySQL 和 Web 应用。MySQL 数据存储在 Docker volume `mysql_data` 中，容器重启后数据仍会保留。

```bash
docker compose up -d --build
```

启动后访问：

```text
http://localhost:3000
```

查看容器状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f mysql
docker compose logs -f app
```

停止服务但保留数据：

```bash
docker compose down
```

彻底删除服务和 MySQL 数据卷（会删除所有笔记数据）：

```bash
docker compose down -v
```

## 只启动 Docker MySQL，本机运行 Next.js

如果你想让 MySQL 在 Docker 中运行，但 Next.js 仍在本机开发模式运行：

```bash
docker compose up -d mysql
cp .env.example .env
npm install
npm run db:init
npm run dev
```

打开 <http://localhost:3000>。

`.env.example` 默认提供：

```text
DATABASE_URL="mysql://my_kbs:admin123@localhost:3306/my_kbs"
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

依赖没有安装成功时，系统无法本地启动或构建，因为 `npm run dev`、`npm run build`、`npm run lint` 和 `npm run typecheck` 都依赖 `node_modules` 中的 Next.js、Prisma、React 与 TypeScript 包。

## 常用脚本

```bash
npm run lint       # 运行 Next.js/ESLint 检查
npm run typecheck  # 运行 TypeScript 类型检查
npm run test       # 运行 smoke test
npm run build      # 生成 Prisma Client 并构建 Next.js 应用
npm run db:init    # 初始化 MySQL 数据库表并写入演示笔记
npm run db:seed    # 重新写入/更新演示笔记
```

## 部署到 Vercel

当前 Prisma schema 使用 MySQL。部署到 Vercel 时，请使用可从 Vercel Serverless 访问的 MySQL 兼容托管数据库，例如 PlanetScale、TiDB Cloud、Aiven MySQL，或你自己维护的公网/内网可达 MySQL 服务。

在 Vercel 项目环境变量中配置类似：

```text
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
```

然后在数据库可达的环境中执行一次：

```bash
npm run db:init
```

> Vercel 不适合使用 SQLite 文件做长期可写数据存储。本项目已经切换到 MySQL，以便长期稳定保存笔记。

## 文件上传说明

在新建或编辑笔记页面，可以上传 `.md`、`.markdown`、`.txt` 和 `.docx` 文件导入正文内容：

- Markdown/TXT 会直接按纯文本读取。
- DOCX 会尝试读取 `word/document.xml` 中的正文文本，适合基础 Word 文档；复杂排版、图片、表格和批注不会被保留。
- 上传后仍可在编辑器中继续修改内容，再点击保存。

## 使用说明

1. 首页点击「新建笔记」。
2. 输入标题、标签和 Markdown 内容。
3. 右侧实时查看 Markdown 预览。
4. 保存后进入详情页；如果从详情页返回，可以点击「返回首页」或「返回列表」。
5. 在详情页点击「编辑」修改内容，或点击「删除」移除笔记。
6. 回到首页，在搜索框输入关键词可搜索标题、正文和标签。

## 测试

```bash
npm run lint
npm run typecheck
npm run test
```

当前 smoke test 会检查关键项目文件、Prisma MySQL schema、Docker MySQL 配置和 npm 脚本是否齐全。
