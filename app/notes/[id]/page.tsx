import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteNote } from "@/app/actions";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: { tags: { orderBy: { name: "asc" } } }
  });

  if (!note) {
    notFound();
  }

  return (
    <article className="space-y-6">
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
          <div className="flex gap-2">
            <Link className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50" href={`/notes/${note.id}/edit`}>
              编辑
            </Link>
            <form action={deleteNote}>
              <input type="hidden" name="id" value={note.id} />
              <button className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700" type="submit">
                删除
              </button>
            </form>
          </div>
        </div>
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <MarkdownPreview content={note.content} />
      </section>
    </article>
  );
}
