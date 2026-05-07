import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "app/page.tsx",
  "app/notes/new/page.tsx",
  "app/notes/[id]/page.tsx",
  "app/notes/[id]/edit/page.tsx",
  "components/NoteEditor.tsx",
  "components/MarkdownPreview.tsx",
  "lib/markdown.ts",
  "lib/ensure-db.ts",
  "prisma/schema.prisma",
  "prisma/seed.ts",
  "docker-compose.yml",
  "docker/mysql/init/01-create-my-kbs-user.sql"
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const schema = readFileSync(join(root, "prisma/schema.prisma"), "utf8");
for (const token of ["model Note", "model Tag", "provider = \"mysql\""]) {
  if (!schema.includes(token)) {
    throw new Error(`Prisma schema does not include ${token}`);
  }
}


const noteEditor = readFileSync(join(root, "components/NoteEditor.tsx"), "utf8");
for (const token of ["type=\"file\"", ".docx", "extractDocxText"]) {
  if (!noteEditor.includes(token)) {
    throw new Error(`Note editor upload support is missing ${token}`);
  }
}

const compose = readFileSync(join(root, "docker-compose.yml"), "utf8");
for (const token of ["mysql:8.0.25", "my_kbs", "admin123", "mysql_data"]) {
  if (!compose.includes(token)) {
    throw new Error(`Docker Compose MySQL setup is missing ${token}`);
  }
}

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
for (const script of ["dev", "build", "lint", "typecheck", "test", "db:init"]) {
  if (!packageJson.scripts?.[script]) {
    throw new Error(`Missing npm script: ${script}`);
  }
}

console.log("Smoke test passed: project structure, Prisma schema, and npm scripts are present.");
