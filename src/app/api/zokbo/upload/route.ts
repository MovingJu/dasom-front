import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { decodeSessionToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "zokbo");
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const sanitizeBaseName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const toTimeStamp = (date: Date) =>
  `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;

const getSessionUser = (request: Request) => {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("dasom_session="))
    ?.replace("dasom_session=", "");
  return decodeSessionToken(token);
};

export async function POST(request: Request) {
  try {
    const user = getSessionUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "로그인 후 업로드가 가능합니다." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: `${file.name} 파일 크기는 100MB 이하만 가능합니다.` },
        { status: 400 },
      );
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name).toLowerCase();
    const base = sanitizeBaseName(path.basename(file.name, ext)) || "file";
    const stamp = toTimeStamp(new Date());
    const random = crypto.randomBytes(4).toString("hex");
    const fileName = `${stamp}-${base}-${random}${ext}`;
    const fullPath = path.join(UPLOAD_DIR, fileName);

    const bytes = await file.arrayBuffer();
    await fs.writeFile(fullPath, Buffer.from(bytes));

    return NextResponse.json({
      ok: true,
      file: {
        originalName: file.name,
        fileName,
        url: `/zokbo/${encodeURIComponent(fileName)}`,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "파일 저장 중 알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
