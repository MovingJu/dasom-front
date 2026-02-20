import { promises as fs } from "node:fs";
import path from "node:path";
import { cleanLine } from "@/lib/frontmatter";

export interface BlogTagNode {
  [key: string]: BlogTagNode;
}

export type BlogTagCatalog = {
  tags: BlogTagNode;
};

const TAG_FILE_PATH = path.join(process.cwd(), "public", "blog-tags.json");

const DEFAULT_CATALOG: BlogTagCatalog = {
  tags: {
    공지: {},
    스터디: {},
    테스트: {
      태그: {
        기능: {},
      },
    },
  },
};

const normalizeTagPart = (value: string) =>
  cleanLine(value).replace(/^#+/, "").replaceAll("/", "").trim();

export const splitBlogTagPath = (value: string) =>
  value
    .split("/")
    .map((part) => normalizeTagPart(part))
    .filter(Boolean);

const normalizeTagNode = (raw: unknown): BlogTagNode => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const source = raw as Record<string, unknown>;
  const normalized: BlogTagNode = {};

  for (const [rawKey, rawChildren] of Object.entries(source)) {
    const key = normalizeTagPart(rawKey);
    if (!key) continue;
    normalized[key] = normalizeTagNode(rawChildren);
  }

  return normalized;
};

const normalizeCatalog = (raw: unknown): BlogTagCatalog => {
  const source = raw as Partial<BlogTagCatalog> | null;
  const tags = normalizeTagNode(source?.tags);
  return {
    tags: Object.keys(tags).length > 0 ? tags : DEFAULT_CATALOG.tags,
  };
};

export const getBlogTagCatalog = async (): Promise<BlogTagCatalog> => {
  try {
    const raw = await fs.readFile(TAG_FILE_PATH, "utf8");
    return normalizeCatalog(JSON.parse(raw));
  } catch {
    return DEFAULT_CATALOG;
  }
};

export const writeBlogTagCatalog = async (catalog: BlogTagCatalog) => {
  const normalized = normalizeCatalog(catalog);
  await fs.writeFile(TAG_FILE_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
};

const resolveNode = (catalog: BlogTagCatalog, pathParts: string[]) => {
  let node: BlogTagNode = catalog.tags;
  for (const part of pathParts) {
    const next = node[part];
    if (!next) {
      return null;
    }
    node = next;
  }
  return node;
};

export const hasBlogTagPath = (catalog: BlogTagCatalog, pathParts: string[]) =>
  resolveNode(catalog, pathParts) !== null;

export const getBlogTagChildren = (catalog: BlogTagCatalog, pathParts: string[]) => {
  const node = resolveNode(catalog, pathParts);
  if (!node) return [];
  return Object.keys(node).sort((a, b) => a.localeCompare(b, "ko"));
};

export const addBlogTagPaths = async (paths: string[]) => {
  const catalog = await getBlogTagCatalog();
  let updated = false;

  for (const rawPath of paths) {
    const parts = splitBlogTagPath(rawPath);
    if (parts.length === 0) continue;

    let node = catalog.tags;
    for (const part of parts) {
      if (!node[part]) {
        node[part] = {};
        updated = true;
      }
      node = node[part];
    }
  }

  if (updated) {
    await writeBlogTagCatalog(catalog);
  }

  return catalog;
};
