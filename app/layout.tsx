import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "个人知识库",
  description: "本地优先的个人知识库 Web 应用"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
<<<<<<< HEAD
      <body className="min-h-screen bg-paper text-ink antialiased">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              个人知识库
            </Link>
            <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <Link className="rounded-full px-3 py-2 hover:bg-slate-100" href="/">
                仪表盘
              </Link>
              <Link className="rounded-full bg-ink px-4 py-2 text-white hover:bg-slate-700" href="/notes/new">
=======
      <body className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_32rem),linear-gradient(180deg,#f8fafc,#eef6ff)] text-ink antialiased">
        <header className="border-b border-indigo-100 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="bg-gradient-to-r from-indigo-700 to-sky-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              个人知识库
            </Link>
            <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <Link className="rounded-full px-3 py-2 text-indigo-700 hover:bg-indigo-50" href="/">
                仪表盘
              </Link>
              <Link className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2 text-white shadow-sm hover:from-indigo-700 hover:to-sky-700" href="/notes/new">
>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb
                新建笔记
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
