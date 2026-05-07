"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/tags";

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

export async function createNote(formData: FormData) {
  const { title, content, tagNames } = readNoteForm(formData);

  const note = await prisma.note.create({
    data: {
      title,
      content,
      tags: {
        connectOrCreate: tagConnections(tagNames)
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function updateNote(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { title, content, tagNames } = readNoteForm(formData);

  await prisma.note.update({
    where: { id },
    data: {
      title,
      content,
      tags: {
        set: [],
        connectOrCreate: tagConnections(tagNames)
      }
    }
  });

  revalidatePath("/");
  revalidatePath(`/notes/${id}`);
  redirect(`/notes/${id}`);
}

export async function deleteNote(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  await prisma.note.delete({ where: { id } });

  revalidatePath("/");
  redirect("/");
}
