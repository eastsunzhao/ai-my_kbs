import { NoteEditor } from "@/components/NoteEditor";
import { createNote } from "@/app/actions";

export default function NewNotePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">New Note</p>
        <h1 className="mt-2 text-3xl font-bold">新建笔记</h1>
      </div>
      <NoteEditor action={createNote} submitLabel="保存笔记" />
    </div>
  );
}
