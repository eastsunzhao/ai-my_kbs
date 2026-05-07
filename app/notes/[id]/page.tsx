import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { deleteNote } from "@/app/actions";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { prisma } from "@/lib/db";
import { ensureDatabase } from "@/lib/ensure-db";
import { RECENT_NOTE_COOKIE, decodeRecentNoteCookie } from "@/lib/recent-note";

export const dynamic = "force-dynamic";

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  await ensureDatabase();
  const { id } = await params;
  const [dbNote, cookieStore] = await Promise.all([
    prisma.note.findUnique({
      where: { id },
      include: { tags: { orderBy: { name: "asc" } } }
    }),
    cookies()
  ]);
  const recentNote = decodeRecentNoteCookie(cookieStore.get(RECENT_NOTE_COOKIE)?.value);
  const recoveredNote =
    recentNote?.id === id
      ? {
          id: recentNote.id,
          title: recentNote.title,
          content: recentNote.content,
          updatedAt: new Date(recentNote.updatedAt),
          tags: recentNote.tags.map((tag) => ({ id: `${recentNote.id}-${tag.name}`, name: tag.name }))
        }
      : null;
  const note = dbNote ?? recoveredNote;
  const isRecoveredNote = !dbNote && Boolean(recoveredNote);

  if (!note) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between">
        <Link className="rounded-xl border border-indigo-200 bg-white px-4 py-2 font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50" href="/">
          ← 返回首页
        </Link>
      </div>
      {isRecoveredNote ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800 shadow-sm">
          当前详情来自刚保存的浏览器回执。Vercel 临时 SQLite 实例同步后，可在首页列表中继续查看完整数据库记录。
        </div>
      ) : null}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-500">最后更新：{note.updatedAt.toLocaleString("zh-CN")}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{note.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span key={tag.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-xl border border-indigo-200 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-50" href="/">
              返回列表
            </Link>
            {!isRecoveredNote ? (
              <>
                <Link className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50" href={`/notes/${note.id}/edit`}>
                  编辑
                </Link>
                <form action={deleteNote}>
                  <input type="hidden" name="id" value={note.id} />
                  <button className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700" type="submit">
                    删除
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <MarkdownPreview content={note.content} />
      </section>
    </article>
  );
}
