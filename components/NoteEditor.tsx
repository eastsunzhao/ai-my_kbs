"use client";

import { useMemo, useState } from "react";
import { MarkdownPreview } from "@/components/MarkdownPreview";

type NoteEditorProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  note?: {
    id: string;
    title: string;
    content: string;
    tags: { name: string }[];
  };
};

export function NoteEditor({ action, submitLabel, note }: NoteEditorProps) {
  const [content, setContent] = useState(note?.content ?? "# 新笔记\n\n在这里写下你的想法...");
  const initialTags = useMemo(() => note?.tags.map((tag) => tag.name).join(", ") ?? "", [note]);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {note ? <input type="hidden" name="id" value={note.id} /> : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">标题</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none ring-ink/10 focus:ring-4"
              name="title"
              required
              defaultValue={note?.title ?? ""}
              placeholder="例如：读书笔记 / 项目灵感"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">标签（用英文逗号分隔）</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-ink/10 focus:ring-4"
              name="tags"
              defaultValue={initialTags}
              placeholder="Next.js, 工作, 阅读"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Markdown 内容</span>
            <textarea
              className="min-h-[420px] w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none ring-ink/10 focus:ring-4"
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
          <button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-slate-700" type="submit">
            {submitLabel}
          </button>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold">实时预览</h2>
          <span className="text-xs text-slate-500">Markdown</span>
        </div>
        <MarkdownPreview content={content} />
      </section>
    </form>
  );
}
