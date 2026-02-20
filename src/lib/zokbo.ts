import { promises as fs } from "node:fs";
import path from "node:path";

export type ZokboPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  authorName: string;
  authorDesignation: string;
  attachments: Array<{ name: string; url: string }>;
  content: string;
  html: string;
};

const ZOKBO_DIR = path.join(process.cwd(), "public", "zokbo-posts");
const DEFAULT_ZOKBO_TAGS = ["알고리즘", "운영체제", "자료구조", "객체지향", "컴퓨터구조"];

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderInline = (line: string) => {
  const escaped = escapeHtml(line);
  return escaped
    .replace(/`([^`]+)`/g, "<code class=\"rounded bg-primary/10 px-1 py-0.5 text-primary\">$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="mb-8 w-full rounded-md" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
};

const markdownToHtml = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim().toUpperCase() || "TEXT";
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(
        `<div class="blog-code-wrap mb-8 overflow-hidden rounded-md"><div class="blog-code-toolbar"><span class="blog-code-lang">${escapeHtml(lang)}</span></div><pre class="blog-code overflow-x-auto p-4 text-sm"><code>${escapeHtml(codeLines.join("\n"))}</code></pre></div>`,
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      out.push(`<h${level} class="mb-4 font-bold text-black dark:text-white">${renderInline(headingMatch[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      out.push(`<blockquote class="mb-8 border-l-4 border-primary bg-primary/10 p-4 italic">${renderInline(line.slice(2))}</blockquote>`);
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      let index = i;
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(`<li>${renderInline(lines[index].trim().slice(2))}</li>`);
        index += 1;
      }
      out.push(`<ul class="mb-8 list-inside list-disc space-y-2">${items.join("")}</ul>`);
      i = index;
      continue;
    }

    out.push(`<p class="mb-6 text-base leading-relaxed">${renderInline(line)}</p>`);
    i += 1;
  }

  return out.join("\n");
};

const parseFrontmatter = (raw: string) => {
  if (!raw.startsWith("---\n")) return { meta: {}, content: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { meta: {}, content: raw };

  const frontmatter = raw.slice(4, end);
  const content = raw.slice(end + 5);
  const meta: Record<string, string> = {};

  for (const line of frontmatter.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }

  return { meta, content };
};

const extractAttachments = (markdown: string) => {
  const matches = markdown.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  const files: Array<{ name: string; url: string }> = [];
  for (const match of matches) {
    const name = (match[1] ?? "").trim();
    const url = (match[2] ?? "").trim();
    if (!name || !url) continue;
    if (!url.startsWith("/zokbo/")) {
      continue;
    }
    files.push({ name, url });
  }

  const unique = new Map<string, { name: string; url: string }>();
  for (const file of files) {
    unique.set(`${file.name}|${file.url}`, file);
  }
  return Array.from(unique.values());
};

const normalizePost = (slug: string, meta: Record<string, string>, content: string): ZokboPost => {
  const normalizedContent = content.trim();
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || "1970-01-01",
    tags: (meta.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    authorName: meta.authorName || "다솜 운영진",
    authorDesignation: meta.authorDesignation || "운영팀",
    attachments: extractAttachments(normalizedContent),
    content: normalizedContent,
    html: markdownToHtml(normalizedContent),
  };
};

export const getAllZokboPosts = async () => {
  try {
    const fileNames = await fs.readdir(ZOKBO_DIR);
    const markdownFiles = fileNames.filter((file) => file.endsWith(".md"));
    const posts = await Promise.all(
      markdownFiles.map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const raw = await fs.readFile(path.join(ZOKBO_DIR, fileName), "utf8");
        const { meta, content } = parseFrontmatter(raw);
        return normalizePost(slug, meta, content);
      }),
    );
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
};

export const getZokboPostBySlug = async (slug: string) => {
  try {
    const raw = await fs.readFile(path.join(ZOKBO_DIR, `${slug}.md`), "utf8");
    const { meta, content } = parseFrontmatter(raw);
    return normalizePost(slug, meta, content);
  } catch {
    return null;
  }
};

export const getAllZokboTags = (posts: ZokboPost[]) => {
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) tags.add(tag);
  }
  if (tags.size === 0) return DEFAULT_ZOKBO_TAGS;
  return Array.from(tags).sort((a, b) => a.localeCompare(b, "ko"));
};

export const filterZokboPostsByTag = (posts: ZokboPost[], tag?: string) => {
  const selected = (tag ?? "").trim().toLowerCase();
  if (!selected) return posts;
  return posts.filter((post) => post.tags.some((item) => item.toLowerCase() === selected));
};
