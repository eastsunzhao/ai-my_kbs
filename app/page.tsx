import Link from "next/link";
import { cookies } from "next/headers";
import { NoteCard } from "@/components/NoteCard";
import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensure-db";
import { RECENT_NOTE_COOKIE, decodeRecentNoteCookie } from "@/lib/recent-note";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{ q?: string; saved?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  await ensureDatabase();
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const saved = params?.saved === "1";
  const where = query
    ? {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { tags: { some: { name: { contains: query } } } }
        ]
      }
    : undefined;

  const [notes, noteCount, tagCount, latestNote, cookieStore] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { tags: { orderBy: { name: "asc" } } }
    }),
    prisma.note.count(),
    prisma.tag.count(),
    prisma.note.findFirst({ orderBy: { updatedAt: "desc" } }),
    cookies()
  ]);
  const recentNote = saved ? decodeRecentNoteCookie(cookieStore.get(RECENT_NOTE_COOKIE)?.value) : null;
  const recentNoteCard = recentNote
    ? {
        id: recentNote.id,
        title: recentNote.title,
        content: recentNote.content,
        updatedAt: new Date(recentNote.updatedAt),
        tags: recentNote.tags.map((tag) => ({ id: `${recentNote.id}-${tag.name}`, name: tag.name }))
      }
    : null;
  const shouldShowRecentNote = Boolean(recentNoteCard && !notes.some((note) => note.id === recentNoteCard.id));
  const displayedNotes = shouldShowRecentNote && recentNoteCard ? [recentNoteCard, ...notes] : notes;
  const displayNoteCount = shouldShowRecentNote ? noteCount + 1 : noteCount;
  const displayLatestNote = shouldShowRecentNote && recentNoteCard ? recentNoteCard : latestNote;

  return (
    <div className="space-y-8">
      {saved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800 shadow-sm">
          笔记已保存，首页列表已更新。{shouldShowRecentNote ? "如果当前 Vercel 实例暂时读不到临时 SQLite 文件，本页会先展示刚保存的笔记。" : ""}
        </div>
      ) : null}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-800 p-8 text-white shadow-sm shadow-indigo-200">
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
        <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-100/60">
          <p className="text-sm text-slate-500">笔记总数</p>
          <p className="mt-2 text-3xl font-bold">{displayNoteCount}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/60">
          <p className="text-sm text-slate-500">标签总数</p>
          <p className="mt-2 text-3xl font-bold">{tagCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm shadow-amber-100/60">
          <p className="text-sm text-slate-500">最近更新</p>
          <p className="mt-2 truncate text-xl font-semibold">{displayLatestNote?.title ?? "暂无笔记"}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-100/60">
        <form className="flex flex-col gap-3 sm:flex-row" action="/">
          <input
            className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 outline-none ring-ink/10 focus:ring-4"
            name="q"
            defaultValue={query}
            placeholder="搜索标题、正文或标签..."
          />
          <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700" type="submit">
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
          <span className="text-sm text-slate-500">{displayedNotes.length} 条</span>
        </div>
        {displayedNotes.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {displayedNotes.map((note) => (
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
