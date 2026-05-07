import { markdownToHtml } from "@/lib/markdown";

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <article
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content || "_暂无内容_") }}
    />
  );
}
