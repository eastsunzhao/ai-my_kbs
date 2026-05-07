import Link from "next/link";

type NoteCardProps = {
  note: {
    id: string;
    title: string;
    content: string;
    updatedAt: Date;
    tags: { id: string; name: string }[];
  };
};

export function NoteCard({ note }: NoteCardProps) {
  const excerpt = note.content.replace(/[#>*_`-]/g, "").slice(0, 140);

  return (
    <Link href={`/notes/${note.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-ink">{note.title}</h3>
        <time className="shrink-0 text-xs text-slate-500">{note.updatedAt.toLocaleDateString("zh-CN")}</time>
      </div>
      <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">{excerpt || "暂无内容"}</p>
      <div className="flex flex-wrap gap-2">
        {note.tags.map((tag) => (
          <span key={tag.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            #{tag.name}
          </span>
        ))}
      </div>
    </Link>
  );
}
