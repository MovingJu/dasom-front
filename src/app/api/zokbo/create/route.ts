import { promises as fs } from "node:fs";
import path from "node:path";
import { decodeSessionToken } from "@/lib/auth";
import { getAllZokboPosts, getAllZokboTags } from "@/lib/zokbo";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CreateZokboBody = {
  title?: string;
  tags?: string[];
  content?: string;
  attachments?: Array<{
    name?: string;
    url?: string;
  }>;
};

const ZOKBO_DIR = path.join(process.cwd(), "public", "zokbo-posts");
const PUBLIC_DIR = path.join(process.cwd(), "public");

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
  return `zokbo-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const resolveUniqueSlug = async (baseSlug: string) => {
  let slug = baseSlug || fallbackSlug();
  let count = 2;

  while (true) {
    try {
      await fs.access(path.join(ZOKBO_DIR, `${slug}.md`));
      slug = `${baseSlug || fallbackSlug()}-${count}`;
      count += 1;
    } catch {
      return slug;
    }
  }
};

const resolvePublicPath = (urlPath: string) => {
  if (!urlPath.startsWith("/")) return null;
  let normalizedUrl = "";
  try {
    normalizedUrl = decodeURIComponent(urlPath.trim());
  } catch {
    return null;
  }
  const publicPrefix = "/zokbo/";
  const fileNameRaw = normalizedUrl.startsWith(publicPrefix)
    ? normalizedUrl.slice(publicPrefix.length)
    : null;
  if (!fileNameRaw) return null;

  const safeFileName = path.basename(fileNameRaw);
  if (!safeFileName || safeFileName !== fileNameRaw) return null;

  const fullPath = path.join(PUBLIC_DIR, "zokbo", safeFileName);
  if (!fullPath.startsWith(PUBLIC_DIR)) return null;
  return fullPath;
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
    return NextResponse.json({ error: "로그인 후 글 작성이 가능합니다." }, { status: 401 });
  }

  const body = (await request.json()) as CreateZokboBody;
  const title = cleanLine(body.title ?? "");
  const content = (body.content ?? "").trim();
  const incomingTags = Array.isArray(body.tags)
    ? body.tags.map((item) => cleanLine(item)).filter(Boolean)
    : [];
  const attachments = Array.isArray(body.attachments)
    ? body.attachments
        .map((item) => ({
          name: cleanLine(item.name ?? ""),
          url: cleanLine(item.url ?? ""),
        }))
        .filter((item) => item.name && item.url)
    : [];

  if (!title) {
    return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "본문을 입력해 주세요." }, { status: 400 });
  }
  if (incomingTags.length === 0) {
    return NextResponse.json({ error: "태그를 1개 이상 선택해 주세요." }, { status: 400 });
  }
  if (attachments.length === 0) {
    return NextResponse.json({ error: "파일을 1개 이상 업로드해 주세요." }, { status: 400 });
  }

  const allowedTags = new Set(getAllZokboTags(await getAllZokboPosts()));
  const invalidTag = incomingTags.find((tag) => !allowedTags.has(tag));
  if (invalidTag) {
    return NextResponse.json({ error: `허용되지 않은 태그입니다: ${invalidTag}` }, { status: 400 });
  }

  for (const attachment of attachments) {
    const publicPath = resolvePublicPath(attachment.url);
    if (!publicPath) {
      return NextResponse.json({ error: `허용되지 않은 첨부파일 경로입니다: ${attachment.url}` }, { status: 400 });
    }
    try {
      await fs.access(publicPath);
    } catch {
      return NextResponse.json({ error: `첨부파일을 찾을 수 없습니다: ${attachment.name}` }, { status: 400 });
    }
  }

  const slug = await resolveUniqueSlug(slugify(title));
  const date = new Date().toISOString().slice(0, 10);

  const frontmatterLines = [
    "---",
    `title: ${title}`,
    `date: ${date}`,
    `tags: ${incomingTags.join(",")}`,
    `authorName: ${cleanLine(user.name) || "다솜 운영진"}`,
    `authorDesignation: ${cleanLine(user.role) || "운영팀"}`,
    "---",
    "",
  ];

  const finalContent = content;

  await fs.mkdir(ZOKBO_DIR, { recursive: true });
  const fileName = `${slug}.md`;
  const fullPath = path.join(ZOKBO_DIR, fileName);
  await fs.writeFile(
    fullPath,
    `${frontmatterLines.join("\n")}${finalContent.endsWith("\n") ? finalContent : `${finalContent}\n`}`,
    "utf8",
  );

  return NextResponse.json({
    ok: true,
    slug,
    fileName,
    path: `public/zokbo-posts/${fileName}`,
    detailUrl: `/zokbo/${slug}`,
    attachments,
  });
}
