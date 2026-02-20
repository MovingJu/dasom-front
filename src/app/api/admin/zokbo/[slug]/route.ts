import { getAdminUserFromRequest } from "@/lib/adminApi";
import { cleanLine, parseFrontmatter, stringifyFrontmatter } from "@/lib/frontmatter";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ZOKBO_DIR = path.join(process.cwd(), "uploads", "zokbo-posts");

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type UpdateZokboBody = {
  title?: string;
  content?: string;
  date?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const admin = getAdminUserFromRequest(request);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { slug } = await context.params;
  const fullPath = path.join(ZOKBO_DIR, `${slug}.md`);

  let raw = "";
  try {
    raw = await fs.readFile(fullPath, "utf8");
  } catch {
    return NextResponse.json({ ok: false, error: "족보 글을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = (await request.json()) as UpdateZokboBody;
  const title = cleanLine(body.title ?? "");
  const content = (body.content ?? "").trim();
  const date = cleanLine(body.date ?? "");

  if (!title || !content) {
    return NextResponse.json({ ok: false, error: "제목과 본문은 필수입니다." }, { status: 400 });
  }

  const { meta, metaOrder } = parseFrontmatter(raw);
  const nextMeta = {
    ...meta,
    title,
    date: date || meta.date || new Date().toISOString().slice(0, 10),
  };

  const nextRaw = stringifyFrontmatter(nextMeta, content, metaOrder);
  await fs.writeFile(fullPath, nextRaw, "utf8");

  return NextResponse.json({
    ok: true,
    slug,
    path: `uploads/zokbo-posts/${slug}.md`,
  });
}
