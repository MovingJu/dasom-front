import { promises as fs } from "node:fs";
import path from "node:path";
import { cleanLine } from "@/lib/frontmatter";

export type ZokboTagCatalog = {
  professorTags: string[];
  courseTags: string[];
};

const TAG_FILE_PATH = path.join(process.cwd(), "public", "zokbo-tags.json");

const DEFAULT_CATALOG: ZokboTagCatalog = {
  professorTags: ["교수님 미정"],
  courseTags: ["알고리즘", "운영체제", "자료구조", "객체지향", "컴퓨터구조"],
};

const normalizeTags = (tags: unknown) => {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .map((item) => cleanLine(String(item ?? "")))
        .filter(Boolean),
    ),
  );
};

const normalizeCatalog = (raw: unknown): ZokboTagCatalog => {
  const source = (raw ?? {}) as Partial<ZokboTagCatalog>;
  const professorTags = normalizeTags(source.professorTags);
  const courseTags = normalizeTags(source.courseTags);

  return {
    professorTags: professorTags.length > 0 ? professorTags : DEFAULT_CATALOG.professorTags,
    courseTags: courseTags.length > 0 ? courseTags : DEFAULT_CATALOG.courseTags,
  };
};

export const getZokboTagCatalog = async (): Promise<ZokboTagCatalog> => {
  try {
    const raw = await fs.readFile(TAG_FILE_PATH, "utf8");
    return normalizeCatalog(JSON.parse(raw));
  } catch {
    return DEFAULT_CATALOG;
  }
};

export const writeZokboTagCatalog = async (catalog: ZokboTagCatalog) => {
  const normalized = normalizeCatalog(catalog);
  await fs.writeFile(TAG_FILE_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
};
