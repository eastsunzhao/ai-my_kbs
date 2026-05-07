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
    <Link href={`/notes/${note.id}`} className="group block overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm shadow-indigo-100/60 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-ink group-hover:text-indigo-700">{note.title}</h3>
          <time className="shrink-0 rounded-full bg-slate-100 px          <time className="shrink-0 rounded-full bg-slate-100 px          <time classNa     </div>
        <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">{excerpt || "暂无内容"}</p>
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag          {note.tags.map((tag          {note.ta="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
