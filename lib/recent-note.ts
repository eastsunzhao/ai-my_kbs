export const RECENT_NOTE_COOKIE = "ai_my_kbs_recent_note";

export type RecentNoteCookie = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: { name: string }[];
};

export function toRecentNoteCookie(note: {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  tags: { name: string }[];
}): RecentNoteCookie {
  return {
    id: note.id,
    title: note.title,
    content: note.content.slice(0, 2800),
    updatedAt: note.updatedAt.toISOString(),
    tags: note.tags.map((tag) => ({ name: tag.name }))
  };
}

export function encodeRecentNoteCookie(note: RecentNoteCookie) {
  return Buffer.from(JSON.stringify(note), "utf8").toString("base64url");
}

export function decodeRecentNoteCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as RecentNoteCookie;
  } catch {
    return null;
  }
}
