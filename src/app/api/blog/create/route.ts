import { promises as fs } from "node:fs";
import path from "node:path";
import { decodeSessionToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CreateBlogBody = {
  title?: string;
  tags?: string;
  coverImage?: string;
  content?: string;
};

const BLOG_DIR = path.join(process.cwd(), "blog");

const cleanLine = (value: string) => value.replace(/\r?\n/g, " ").trim();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const fallbackSlug = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `post-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const resolveUniqueSlug = async (baseSlug: string) => {
  let slug = baseSlug || fallbackSlug();
  let count = 2;

  while (true) {
    const fullPath = path.join(BLOG_DIR, `${slug}.md`);
    try {
      await fs.access(fullPath);
      slug = `${baseSlug || fallbackSlug()}-${count}`;
      count += 1;
    } catch {
      return slug;
    }
  }
};

export async function POST(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("dasom_session="))
    ?.replace("dasom_session=", "");
  const user = decodeSessionToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "로그인 후 글 작성이 가능합니다." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as CreateBlogBody;

  const title = cleanLine(body.title ?? "");
  const content = (body.content ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "본문을 입력해 주세요." }, { status: 400 });
  }

  const baseSlug = slugify(title);
  const slug = await resolveUniqueSlug(baseSlug);

  const tags = cleanLine(body.tags ?? "");
  const coverImage = cleanLine(body.coverImage ?? "");
  const date = new Date().toISOString().slice(0, 10);

  const frontmatterLines = [
    "---",
    `title: ${title}`,
    `date: ${date}`,
    `tags: ${tags}`,
    `authorName: ${cleanLine(user.name) || "다솜 운영진"}`,
    `authorDesignation: ${cleanLine(user.role) || "운영팀"}`,
  ];

  if (coverImage) {
    frontmatterLines.push(`coverImage: ${coverImage}`);
  }

  frontmatterLines.push("---", "");

  const fileBody = `${frontmatterLines.join("\n")}${content.endsWith("\n") ? content : `${content}\n`}`;
  const fileName = `${slug}.md`;
  const fullPath = path.join(BLOG_DIR, fileName);

  await fs.mkdir(BLOG_DIR, { recursive: true });
  await fs.writeFile(fullPath, fileBody, "utf8");

  return NextResponse.json({
    ok: true,
    slug,
    fileName,
    path: `blog/${fileName}`,
    detailUrl: `/blog/${slug}`,
  });
}
