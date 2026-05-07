"use server";

import { revalidatePath } from "next/cache";
<<<<<<< HEAD
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/tags";
=======
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/tags";
import { ensureDatabase } from "@/lib/ensure-db";
import { RECENT_NOTE_COOKIE, encodeRecentNoteCookie, toRecentNoteCookie } from "@/lib/recent-note";
>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb

function readNoteForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const tagNames = parseTags(formData.get("tags"));

  if (!title) {
    throw new Error("标题不能为空");
  }

  return { title, content, tagNames };
}

function tagConnections(tagNames: string[]) {
  return tagNames.map((name) => ({
    where: { name },
    create: { name }
  }));
}

<<<<<<< HEAD
export async function createNote(formData: FormData) {
=======
function shouldReturnHomeAfterMutation() {
  return process.env.VERCEL === "1" && (process.env.DATABASE_URL ?? "").startsWith("file:");
}

async function rememberRecentNote(note: {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  tags: { name: string }[];
}) {
  const cookieStore = await cookies();
  cookieStore.set(RECENT_NOTE_COOKIE, encodeRecentNoteCookie(toRecentNoteCookie(note)), {
    httpOnly: true,
    maxAge: 60 * 30,
    path: "/",
    sameSite: "lax"
  });
}

export async function createNote(formData: FormData) {
  await ensureDatabase();
>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb
  const { title, content, tagNames } = readNoteForm(formData);

  const note = await prisma.note.create({
    data: {
      title,
      content,
      tags: {
        connectOrCreate: tagConnections(tagNames)
      }
<<<<<<< HEAD
    }
  });

  revalidatePath("/");
  revalidatePath("/notes");
=======
    },
    include: { tags: { orderBy: { name: "asc" } } }
  });

  await rememberRecentNote(note);
  revalidatePath("/");
  revalidatePath("/notes");
  if (shouldReturnHomeAfterMutation()) {
    redirect("/?saved=1");
  }

>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb
  redirect(`/notes/${note.id}`);
}

export async function updateNote(formData: FormData) {
<<<<<<< HEAD
  const id = String(formData.get("id") ?? "");
  const { title, content, tagNames } = readNoteForm(formData);

  await prisma.note.update({
=======
  await ensureDatabase();
  const id = String(formData.get("id") ?? "");
  const { title, content, tagNames } = readNoteForm(formData);

  const note = await prisma.note.update({
>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb
    where: { id },
    data: {
      title,
      content,
      tags: {
        set: [],
        connectOrCreate: tagConnections(tagNames)
      }
<<<<<<< HEAD
    }
  });

  revalidatePath("/");
  revalidatePath(`/notes/${id}`);
=======
    },
    include: { tags: { orderBy: { name: "asc" } } }
  });

  await rememberRecentNote(note);
  revalidatePath("/");
  revalidatePath(`/notes/${id}`);
  if (shouldReturnHomeAfterMutation()) {
    redirect("/?saved=1");
  }

>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb
  redirect(`/notes/${id}`);
}

export async function deleteNote(formData: FormData) {
<<<<<<< HEAD
  const id = String(formData.get("id") ?? "");

  await prisma.note.delete({ where: { id } });
=======
  await ensureDatabase();
  const id = String(formData.get("id") ?? "");

  await prisma.note.delete({ where: { id } });
  const cookieStore = await cookies();
  cookieStore.delete(RECENT_NOTE_COOKIE);
>>>>>>> codex/create-personal-knowledge-base-system-n5lcnb

  revalidatePath("/");
  redirect("/");
}
