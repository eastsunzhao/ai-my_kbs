import Link from "next/link";
import { NoteCard } from "@/components/NoteCard";
import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensure-db";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  await ensureDatabase();
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const where = query
    ? {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { tags: { some: { name: { contains: query } } } }
        ]
      }
    : undefined;

  const [notes, noteCount, tagCount, latestNote] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { tags: { orderBy: { name: "asc" } } }
    }),
    prisma.note.count(),
    prisma.tag.count(),
    prisma.note.findFirst({ orderBy: { updatedAt: "desc" } })
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">Knowledge Base</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">沉淀、检索、复用你的知识</h1>
            <p className="mt-4 max-w-2xl text-slate-200">一个本地优先的个人知识库，支持 Markdown、标签和全文搜索，适合记录项目经验、读书笔记和灵感。</p>
          </div>
          <Link className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-slate-900 transition hover:bg-slate-100" href="/notes/new">
            创建第一条笔记
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">笔记总数</p>
          <p className="mt-2 text-3xl font-bold">{noteCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">标签总数</p>
          <p className="mt-2 text-3xl font-bold">{tagCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">最近更新</p>
          <p className="mt-2 truncate text-xl font-semibold">{latestNote?.title ?? "暂无笔记"}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form className="flex flex-col gap-3 sm:flex-row" action="/">
          <input
            className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 outline-none ring-ink/10 focus:ring-4"
            name="q"
            defaultValue={query}
            placeholder="搜索标题、正文或标签..."
          />
          <button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white hover:bg-slate-700" type="submit">
            搜索
          </button>
          {query ? (
            <Link className="rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50" href="/">
              清除
            </Link>
          ) : null}
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{query ? `搜索结果：${query}` : "全部笔记"}</h2>
          <span className="text-sm text-slate-500">{notes.length} 条</span>
        </div>
        {notes.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            没有找到笔记。试试换个关键词，或新建一条笔记。
          </div>
        )}
      </section>
    </div>
  );
}
