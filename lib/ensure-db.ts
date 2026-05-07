import { prisma } from "@/lib/db";

const demoNote = {
  id: "seed-welcome-note",
  title: "欢迎使用个人知识库",
  content: `# 欢迎使用个人知识库\n\n这是一个最小可用的知识库系统。\n\n- 使用 Markdown 记录想法\n- 用标签整理主题\n- 通过搜索快速找到笔记\n\n> 现在就创建第一条自己的笔记吧。`
};

type SqliteTableRow = {
  name: string;
};

function shouldEnsureSqliteSchema() {
  return (process.env.DATABASE_URL ?? "").startsWith("file:");
}

async function hasRequiredSqliteTables() {
  const rows = await prisma.$queryRawUnsafe<SqliteTableRow[]>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('Note', 'Tag', '_NoteTags');`
  );
  const tableNames = new Set(rows.map((row: SqliteTableRow) => row.name));

  return tableNames.has("Note") && tableNames.has("Tag") && tableNames.has("_NoteTags");
}

async function createSqliteSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Note" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Tag" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_NoteTags" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      CONSTRAINT "_NoteTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "_NoteTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Note_updatedAt_idx" ON "Note"("updatedAt");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Note_title_idx" ON "Note"("title");`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "_NoteTags_AB_unique" ON "_NoteTags"("A", "B");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "_NoteTags_B_index" ON "_NoteTags"("B");`);
}

async function seedDemoNote() {
  await prisma.note.upsert({
    where: { id: demoNote.id },
    update: {},
    create: {
      ...demoNote,
      tags: {
        connectOrCreate: ["Next.js", "Prisma", "Markdown"].map((name) => ({
          where: { name },
          create: { name }
        }))
      }
    }
  });
}

const globalForEnsure = globalThis as unknown as { ensureDatabasePromise?: Promise<void> };

async function createAndSeedSqliteSchema() {
  await createSqliteSchema();
  await seedDemoNote();
}

export async function ensureDatabase() {
  if (!shouldEnsureSqliteSchema()) {
    return;
  }

  if (await hasRequiredSqliteTables()) {
    return;
  }

  globalForEnsure.ensureDatabasePromise ??= createAndSeedSqliteSchema().finally(() => {
    globalForEnsure.ensureDatabasePromise = undefined;
  });

  await globalForEnsure.ensureDatabasePromise;

  if (!(await hasRequiredSqliteTables())) {
    throw new Error("SQLite schema initialization failed: required tables were not created.");
  }
}
