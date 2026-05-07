"use client";

import type { ChangeEvent } from "react";
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

type UploadStatus = {
  tone: "info" | "success" | "error";
  message: string;
};

const supportedUploadTypes = ".md,.markdown,.txt,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function decodeXmlEntities(value: string) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function copyToArrayBuffer(data: Uint8Array) {
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  return buffer;
}

async function inflateRaw(data: Uint8Array) {
  if (!("DecompressionStream" in globalThis)) {
    throw new Error("当前浏览器不支持解析 docx 压缩内容，请先转换为 Markdown 或 TXT 后上传。");
  }

  const stream = new Blob([copyToArrayBuffer(data)]).stream().pipeThrough(new DecompressionStream("deflate-raw" as CompressionFormat));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function extractDocxText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  let offset = 0;

  while (offset + 30 < bytes.length) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) {
      break;
    }

    const compressionMethod = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const fileNameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    const fileName = new TextDecoder().decode(bytes.slice(nameStart, nameEnd));

    if (fileName === "word/document.xml") {
      const compressed = bytes.slice(dataStart, dataEnd);
      const xmlBytes = compressionMethod === 0 ? compressed : await inflateRaw(compressed);
      const xml = new TextDecoder().decode(xmlBytes);
      const text = Array.from(xml.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g), (match) => decodeXmlEntities(match[1])).join("");

      if (!text.trim()) {
        throw new Error("未能从 docx 中读取到正文内容。");
      }

      return text;
    }

    offset = dataEnd;
  }

  throw new Error("未找到 docx 正文内容，请确认文件未损坏。");
}

function isDocx(file: File) {
  return file.name.toLowerCase().endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

function titleFromFile(fileName: string) {
  return fileName.replace(/\.(md|markdown|txt|docx)$/i, "").trim();
}

export function NoteEditor({ action, submitLabel, note }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "# 新笔记\n\n在这里写下你的想法...");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    tone: "info",
    message: "支持上传 Markdown、TXT 和基础 DOCX 文本文件。"
  });
  const initialTags = useMemo(() => note?.tags.map((tag) => tag.name).join(", ") ?? "", [note]);

  async function handleUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      setUploadStatus({ tone: "info", message: `正在读取 ${file.name}...` });
      const text = isDocx(file) ? await extractDocxText(file) : await file.text();
      setContent(text);

      if (!title.trim()) {
        setTitle(titleFromFile(file.name));
      }

      setUploadStatus({ tone: "success", message: `已导入 ${file.name}，可以继续编辑后保存。` });
    } catch (error) {
      setUploadStatus({ tone: "error", message: error instanceof Error ? error.message : "文件读取失败，请换一个文件重试。" });
    }
  }

  const uploadToneClass = {
    info: "border-sky-200 bg-sky-50 text-sky-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-red-200 bg-red-50 text-red-700"
  }[uploadStatus.tone];

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {note ? <input type="hidden" name="id" value={note.id} /> : null}
      <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-100/60">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">标题</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none ring-indigo-500/10 focus:border-indigo-400 focus:ring-4"
              name="title"
              required
              value={title}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
              placeholder="例如：读书笔记 / 项目灵感"
            />
          </label>
          <label className="block rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4">
            <span className="mb-2 block text-sm font-semibold text-indigo-800">上传文本文件</span>
            <input
              className="block w-full cursor-pointer rounded-xl border border-indigo-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-indigo-600 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-indigo-700"
              type="file"
              accept={supportedUploadTypes}
              onChange={(event: ChangeEvent<HTMLInputElement>) => void handleUpload(event.target.files?.[0])}
            />
            <p className={`mt-3 rounded-xl border px-3 py-2 text-xs ${uploadToneClass}`}>{uploadStatus.message}</p>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">标签（用英文逗号分隔）</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-indigo-500/10 focus:border-indigo-400 focus:ring-4"
              name="tags"
              defaultValue={initialTags}
              placeholder="Next.js, 工作, 阅读"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Markdown 内容</span>
            <textarea
              className="min-h-[420px] w-full rounded-xl border border-slate-300 bg-slate-50/60 px-4 py-3 font-mono text-sm outline-none ring-indigo-500/10 focus:border-indigo-400 focus:bg-white focus:ring-4"
              name="content"
              value={content}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setContent(event.target.value)}
            />
          </label>
          <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-5 py-3 font-semibold text-white shadow-sm shadow-indigo-200 transition hover:from-indigo-700 hover:to-sky-700" type="submit">
            {submitLabel}
          </button>
        </div>
      </section>
      <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/60">
        <div className="mb-4 flex items-center justify-between border-b border-sky-100 pb-3">
          <h2 className="text-lg font-semibold text-sky-900">实时预览</h2>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Markdown</span>
        </div>
        <MarkdownPreview content={content} />
      </section>
    </form>
  );
}
