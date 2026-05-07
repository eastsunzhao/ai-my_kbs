import { notFound } from "next/navigation";
import { updateNote } from "@/app/actions";
import { NoteEditor } from "@/components/NoteEditor";
import { prisma } from "@/lib/db";
<<<<<<< HEAD
=======
import { ensureDatabase } from "@/lib/ensure-db";
>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb

export const dynamic = "force-dynamic";

type EditNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
<<<<<<< HEAD
=======
  await ensureDatabase();
>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: { tags: { orderBy: { name: "asc" } } }
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Edit Note</p>
        <h1 className="mt-2 text-3xl font-bold">编辑笔记</h1>
      </div>
      <NoteEditor
        action={updateNote}
        note={{ id: note.id, title: note.title, content: note.content, tags: note.tags }}
        submitLabel="更新笔记"
      />
    </div>
  );
}
