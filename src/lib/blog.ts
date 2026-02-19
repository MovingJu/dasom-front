import { promises as fs } from "node:fs";
import path from "node:path";

export type BlogAuthor = {
  name: string;
  image: string;
  designation: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  author: BlogAuthor;
  coverImage: string;
  content: string;
  html: string;
};

type BlogFilter = {
  query?: string;
  tag?: string;
};

const BLOG_DIR = path.join(process.cwd(), "blog");

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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
};

const markdownToHtml = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  const pushParagraph = (start: number) => {
    const parts: string[] = [];
    let index = start;
    while (index < lines.length) {
      const line = lines[index].trim();
      if (!line) break;
      if (
        /^#{1,6}\s/.test(line) ||
        line.startsWith("- ") ||
        /^\d+\.\s/.test(line) ||
        line.startsWith("> ") ||
        line.startsWith("```")
      ) {
        break;
      }
      parts.push(renderInline(line));
      index += 1;
    }

    if (parts.length > 0) {
      out.push(`<p class=\"mb-6 text-base leading-relaxed text-body-color sm:text-lg\">${parts.join(" ")}</p>`);
    }

    return index;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(
        `<pre class=\"mb-8 overflow-x-auto rounded-md bg-[#1d1d1d] p-4 text-sm text-[#e7e7e7]\"><code class=\"language-${escapeHtml(lang || "text")}\">${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = renderInline(headingMatch[2]);
      const classNameByLevel: Record<number, string> = {
        1: "mb-6 text-4xl font-bold text-black dark:text-white",
        2: "mb-4 text-3xl font-bold text-black dark:text-white",
        3: "mb-4 text-2xl font-bold text-black dark:text-white",
        4: "mb-3 text-xl font-bold text-black dark:text-white",
        5: "mb-3 text-lg font-bold text-black dark:text-white",
        6: "mb-3 text-base font-bold text-black dark:text-white",
      };
      out.push(
        `<h${level} class=\"${classNameByLevel[level]}\">${text}</h${level}>`,
      );
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      out.push(`<blockquote class=\"mb-8 border-l-4 border-primary bg-primary/10 p-4 text-body-color italic\">${renderInline(line.slice(2))}</blockquote>`);
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
      out.push(`<ul class=\"mb-8 list-inside list-disc space-y-2 text-body-color\">${items.join("")}</ul>`);
      i = index;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      let index = i;
      while (index < lines.length && /^\d+\.\s/.test(lines[index].trim())) {
        items.push(`<li>${renderInline(lines[index].trim().replace(/^\d+\.\s/, ""))}</li>`);
        index += 1;
      }
      out.push(`<ol class=\"mb-8 list-inside list-decimal space-y-2 text-body-color\">${items.join("")}</ol>`);
      i = index;
      continue;
    }

    i = pushParagraph(i);
  }

  return out.join("\n");
};

const parseFrontmatter = (raw: string) => {
  if (!raw.startsWith("---\n")) {
    return { meta: {}, content: raw };
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { meta: {}, content: raw };
  }

  const frontmatter = raw.slice(4, end);
  const content = raw.slice(end + 5);
  const meta: Record<string, string> = {};

  for (const line of frontmatter.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    meta[key] = value;
  }

  return { meta, content };
};

const slugFromFileName = (fileName: string) => fileName.replace(/\.md$/, "");

const normalizePost = (slug: string, meta: Record<string, string>, content: string): BlogPost => {
  const title = meta.title || slug;
  const excerpt = meta.excerpt || "";
  const date = meta.date || "1970-01-01";
  const tags = (meta.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    slug,
    title,
    excerpt,
    date,
    tags,
    author: {
      name: meta.authorName || "다솜 운영진",
      image: meta.authorImage || "/images/blog/author-03.png",
      designation: meta.authorDesignation || "운영팀",
    },
    coverImage: meta.coverImage || "/images/blog/blog-01.jpg",
    content,
    html: markdownToHtml(content),
  };
};

export const getAllBlogPosts = async () => {
  const fileNames = await fs.readdir(BLOG_DIR);
  const markdownFiles = fileNames.filter((file) => file.endsWith(".md"));

  const posts = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const slug = slugFromFileName(fileName);
      const fullPath = path.join(BLOG_DIR, fileName);
      const raw = await fs.readFile(fullPath, "utf8");
      const { meta, content } = parseFrontmatter(raw);
      return normalizePost(slug, meta, content.trim());
    }),
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = async (slug: string) => {
  const fullPath = path.join(BLOG_DIR, `${slug}.md`);
  try {
    const raw = await fs.readFile(fullPath, "utf8");
    const { meta, content } = parseFrontmatter(raw);
    return normalizePost(slug, meta, content.trim());
  } catch {
    return null;
  }
};

const normalize = (value: string) => value.trim().toLowerCase();

export const filterBlogPosts = (posts: BlogPost[], filter: BlogFilter) => {
  const query = normalize(filter.query ?? "");
  const tag = normalize(filter.tag ?? "");

  return posts.filter((post) => {
    const byTag =
      !tag || post.tags.some((postTag) => normalize(postTag) === tag);

    if (!byTag) return false;

    if (!query) return true;

    const haystack = [
      post.title,
      post.excerpt,
      post.content,
      post.author.name,
      post.author.designation,
      post.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
};

export const getAllBlogTags = (posts: BlogPost[]) => {
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (tag.trim()) {
        tags.add(tag.trim());
      }
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b, "ko"));
};
