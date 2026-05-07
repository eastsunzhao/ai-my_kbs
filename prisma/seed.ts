import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tags = ["Next.js", "Prisma", "Markdown"];

  await prisma.note.upsert({
    where: { id: "seed-welcome-note" },
    update: {},
    create: {
      id: "seed-welcome-note",
      title: "欢迎使用个人知识库",
      content: `# 欢迎使用个人知识库\n\n这是一个最小可用的知识库系统。\n\n- 使用 Markdown 记录想法\n- 用标签整理主题\n- 通过搜索快速找到笔记\n\n> 现在就创建第一条自己的笔记吧。`,
      tags: {
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name }
        }))
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
