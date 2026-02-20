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
  content: string;
  html: string;
};

type BlogFilter = {
  query?: string;
  tagPath?: string;
  tagPaths?: string[];
};

type CodeTokenType =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "type"
  | "function"
  | "operator"
  | "punctuation";

const BLOG_DIR = path.join(process.cwd(), "uploads", "blog-posts");

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "default",
  "break",
  "continue",
  "return",
  "try",
  "catch",
  "throw",
  "finally",
  "new",
  "delete",
  "class",
  "struct",
  "enum",
  "namespace",
  "public",
  "private",
  "protected",
  "static",
  "const",
  "constexpr",
  "let",
  "var",
  "fn",
  "impl",
  "trait",
  "match",
  "use",
  "mod",
  "pub",
  "async",
  "await",
  "yield",
  "typeof",
  "instanceof",
  "in",
  "of",
  "with",
  "from",
  "import",
  "export",
]);

const TYPES = new Set([
  "int",
  "long",
  "short",
  "float",
  "double",
  "bool",
  "char",
  "void",
  "string",
  "usize",
  "isize",
  "u8",
  "u16",
  "u32",
  "u64",
  "i8",
  "i16",
  "i32",
  "i64",
  "f32",
  "f64",
  "String",
  "Vec",
  "Option",
  "Result",
  "Self",
  "this",
  "super",
  "null",
  "nullptr",
  "undefined",
  "true",
  "false",
]);

const tokenClass = (type: CodeTokenType) => {
  if (type === "plain") return "";
  return `tok-${type}`;
};

const readWhile = (input: string, start: number, test: (ch: string) => boolean) => {
  let i = start;
  while (i < input.length && test(input[i])) {
    i += 1;
  }
  return i;
};

const highlightCode = (code: string) => {
  const chunks: string[] = [];
  let i = 0;

  while (i < code.length) {
    const rest = code.slice(i);

    if (rest.startsWith("//")) {
      const end = code.indexOf("\n", i);
      const text = end === -1 ? code.slice(i) : code.slice(i, end);
      chunks.push(`<span class=\"${tokenClass("comment")}\">${escapeHtml(text)}</span>`);
      i = end === -1 ? code.length : end;
      continue;
    }

    if (rest.startsWith("/*")) {
      const end = code.indexOf("*/", i + 2);
      const text = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      chunks.push(`<span class=\"${tokenClass("comment")}\">${escapeHtml(text)}</span>`);
      i = end === -1 ? code.length : end + 2;
      continue;
    }

    if (rest[0] === '"' || rest[0] === "'" || rest[0] === "`") {
      const quote = rest[0];
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2;
          continue;
        }
        if (code[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      const text = code.slice(i, j);
      chunks.push(`<span class=\"${tokenClass("string")}\">${escapeHtml(text)}</span>`);
      i = j;
      continue;
    }

    if (/\s/.test(rest[0])) {
      const j = readWhile(code, i, (ch) => /\s/.test(ch));
      chunks.push(escapeHtml(code.slice(i, j)));
      i = j;
      continue;
    }

    if (/\d/.test(rest[0])) {
      const j = readWhile(code, i, (ch) => /[\d._xXa-fA-F]/.test(ch));
      chunks.push(`<span class=\"${tokenClass("number")}\">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    if (/[A-Za-z_]/.test(rest[0])) {
      const j = readWhile(code, i, (ch) => /[A-Za-z0-9_]/.test(ch));
      const word = code.slice(i, j);
      const after = code.slice(j);

      if (KEYWORDS.has(word)) {
        chunks.push(`<span class=\"${tokenClass("keyword")}\">${escapeHtml(word)}</span>`);
      } else if (TYPES.has(word)) {
        chunks.push(`<span class=\"${tokenClass("type")}\">${escapeHtml(word)}</span>`);
      } else if (/^\s*\(/.test(after)) {
        chunks.push(`<span class=\"${tokenClass("function")}\">${escapeHtml(word)}</span>`);
      } else {
        chunks.push(escapeHtml(word));
      }

      i = j;
      continue;
    }

    if (/[+\-*/%=!<>|&^~?:]/.test(rest[0])) {
      const j = readWhile(code, i, (ch) => /[+\-*/%=!<>|&^~?:]/.test(ch));
      chunks.push(`<span class=\"${tokenClass("operator")}\">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    if (/[()[\]{}.,;]/.test(rest[0])) {
      chunks.push(`<span class=\"${tokenClass("punctuation")}\">${escapeHtml(rest[0])}</span>`);
      i += 1;
      continue;
    }

    chunks.push(escapeHtml(rest[0]));
    i += 1;
  }

  return chunks.join("");
};

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
      out.push(`<p class=\"mb-6 text-base leading-relaxed text-[#2f1d30] dark:text-white/90 sm:text-lg\">${parts.join(" ")}</p>`);
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
      const language = (lang || "text").toLowerCase();
      const languageLabel = language === "cpp" ? "C++" : language.toUpperCase();
      const highlighted = highlightCode(codeLines.join("\n"));
      out.push(
        `<div class=\"blog-code-wrap mb-8 overflow-hidden rounded-md\"><div class=\"blog-code-toolbar\"><span class=\"blog-code-lang\">${escapeHtml(languageLabel)}</span><button type=\"button\" class=\"blog-copy-btn\">복사</button></div><pre class=\"blog-code overflow-x-auto p-4 text-sm\"><code class=\"language-${escapeHtml(language)}\">${highlighted}</code></pre></div>`,
      );
      continue;
    }

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      out.push(
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="mb-8 w-full rounded-md border border-body-color/10 dark:border-white/10" loading="lazy" />`,
      );
      i += 1;
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
      out.push(`<blockquote class=\"mb-8 border-l-4 border-primary bg-primary/10 p-4 text-[#2f1d30] italic dark:text-white/90\">${renderInline(line.slice(2))}</blockquote>`);
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
      out.push(`<ul class=\"mb-8 list-inside list-disc space-y-2 text-[#2f1d30] dark:text-white/90\">${items.join("")}</ul>`);
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
      out.push(`<ol class=\"mb-8 list-inside list-decimal space-y-2 text-[#2f1d30] dark:text-white/90\">${items.join("")}</ol>`);
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
const nonEmpty = (value?: string) => (value?.trim() ? value.trim() : undefined);

const normalizePost = (slug: string, meta: Record<string, string>, content: string): BlogPost => {
  const title = meta.title || slug;
  const excerpt = meta.excerpt || "";
  const date = meta.date || "1970-01-01";
  const tags = (meta.tags || "")
    .split(",")
    .map((tag) => tag.trim().replace(/^#+/, "").trim())
    .filter(Boolean);

  return {
    slug,
    title,
    excerpt,
    date,
    tags,
    author: {
      name: nonEmpty(meta.authorName) || "다솜 운영진",
      image: nonEmpty(meta.authorImage) || "/images/blog/author-default.png",
      designation: nonEmpty(meta.authorDesignation) || "운영팀",
    },
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

export const splitBlogTagPath = (tag: string) =>
  tag
    .trim()
    .replace(/^#+/, "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

export const getBlogTagRoot = (tag: string) => splitBlogTagPath(tag)[0] ?? "";

export const getBlogTagChildPath = (tag: string) => {
  const parts = splitBlogTagPath(tag);
  if (parts.length <= 1) return "";
  return parts.slice(1).join("/");
};

export const filterBlogPosts = (posts: BlogPost[], filter: BlogFilter) => {
  const query = normalize(filter.query ?? "");
  const requestedPaths = filter.tagPaths?.length
    ? filter.tagPaths
    : filter.tagPath
      ? [filter.tagPath]
      : [];

  const selectedPathPartsList = requestedPaths
    .map((path) => splitBlogTagPath(path).map((part) => normalize(part)))
    .filter((parts) => parts.length > 0);

  return posts.filter((post) => {
    const byTag =
      selectedPathPartsList.length === 0
        ? true
        : post.tags.some((postTag) => {
            const tagParts = splitBlogTagPath(postTag).map((part) => normalize(part));
            return selectedPathPartsList.some((selectedPathParts) => {
              if (tagParts.length < selectedPathParts.length) return false;
              return selectedPathParts.every((part, index) => tagParts[index] === part);
            });
          });

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
      const cleaned = tag.trim().replace(/^#+/, "").trim();
      if (cleaned) {
        tags.add(cleaned);
      }
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b, "ko"));
};

export const getBlogTagHierarchy = (posts: BlogPost[]) => {
  const roots = new Set<string>();
  const childrenMap = new Map<string, Set<string>>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const root = getBlogTagRoot(tag);
      if (!root) continue;
      roots.add(root);

      const childPath = getBlogTagChildPath(tag);
      if (!childPath) continue;

      const children = childrenMap.get(root) ?? new Set<string>();
      children.add(childPath);
      childrenMap.set(root, children);
    }
  }

  const sortedRoots = Array.from(roots).sort((a, b) => a.localeCompare(b, "ko"));
  const childrenByRoot: Record<string, string[]> = {};

  for (const root of sortedRoots) {
    childrenByRoot[root] = Array.from(childrenMap.get(root) ?? []).sort((a, b) =>
      a.localeCompare(b, "ko"),
    );
  }

  return {
    roots: sortedRoots,
    childrenByRoot,
  };
};
