export function parseTags(input: FormDataEntryValue | null) {
  if (typeof input !== "string") {
    return [];
  }

  return Array.from(
    new Set(
      input
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}
