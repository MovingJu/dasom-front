import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ROOT_UPLOADS_DIR = path.join(process.cwd(), "uploads");

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".html": "text/html; charset=utf-8",
  ".ipynb": "application/json; charset=utf-8",
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const resolveFilePath = (parts: string[]) => {
  if (!parts || parts.length === 0) return null;

  const safeParts: string[] = [];
  for (const part of parts) {
    const decoded = decodeURIComponent(part);
    if (!decoded || decoded === "." || decoded === "..") return null;
    if (decoded.includes("/") || decoded.includes("\\")) return null;
    safeParts.push(decoded);
  }

  const fullPath = path.join(ROOT_UPLOADS_DIR, ...safeParts);
  if (!fullPath.startsWith(ROOT_UPLOADS_DIR)) return null;
  return fullPath;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path: parts } = await context.params;
  const fullPath = resolveFilePath(parts);
  if (!fullPath) {
    return NextResponse.json({ ok: false, error: "잘못된 경로입니다." }, { status: 400 });
  }

  try {
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) {
      return NextResponse.json({ ok: false, error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    const body = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
}
