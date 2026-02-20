import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { decodeSessionToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "images");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: "로그인 후 업로드가 가능합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "업로드할 파일이 없습니다." }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "png, jpg, webp, gif 파일만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ ok: false, error: "파일 크기는 5MB 이하만 가능합니다." }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const random = crypto.randomBytes(4).toString("hex");
  const fileName = `${stamp}-${random}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, fileName);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(fullPath, Buffer.from(bytes));

  return NextResponse.json({
    ok: true,
    fileName,
    url: `/uploads/images/${fileName}`,
  });
}
