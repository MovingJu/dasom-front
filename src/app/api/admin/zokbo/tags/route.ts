import { getAdminUserFromRequest } from "@/lib/adminApi";
import { cleanLine } from "@/lib/frontmatter";
import { getZokboTagCatalog, writeZokboTagCatalog } from "@/lib/zokboTagCatalog";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type TagCategory = "professor" | "course";

type TagBody = {
  category?: TagCategory;
  tag?: string;
};

const isCategory = (value: string): value is TagCategory => value === "professor" || value === "course";

export async function POST(request: Request) {
  const admin = getAdminUserFromRequest(request);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = (await request.json()) as TagBody;
  const category = cleanLine(body.category ?? "");
  const tag = cleanLine(body.tag ?? "");

  if (!isCategory(category) || !tag) {
    return NextResponse.json({ ok: false, error: "category(professor|course), tag는 필수입니다." }, { status: 400 });
  }

  const catalog = await getZokboTagCatalog();
  const currentTags = category === "professor" ? catalog.professorTags : catalog.courseTags;
  if (currentTags.includes(tag)) {
    return NextResponse.json({ ok: false, error: "이미 존재하는 태그입니다." }, { status: 400 });
  }

  const next = {
    ...catalog,
    professorTags: category === "professor" ? [...catalog.professorTags, tag] : catalog.professorTags,
    courseTags: category === "course" ? [...catalog.courseTags, tag] : catalog.courseTags,
  };

  const saved = await writeZokboTagCatalog(next);
  return NextResponse.json({ ok: true, category, tag, catalog: saved });
}

export async function DELETE(request: Request) {
  const admin = getAdminUserFromRequest(request);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = (await request.json()) as TagBody;
  const category = cleanLine(body.category ?? "");
  const tag = cleanLine(body.tag ?? "");

  if (!isCategory(category) || !tag) {
    return NextResponse.json({ ok: false, error: "category(professor|course), tag는 필수입니다." }, { status: 400 });
  }

  const catalog = await getZokboTagCatalog();
  const currentTags = category === "professor" ? catalog.professorTags : catalog.courseTags;
  if (!currentTags.includes(tag)) {
    return NextResponse.json({ ok: false, error: "존재하지 않는 태그입니다." }, { status: 400 });
  }

  const filtered = currentTags.filter((item) => item !== tag);
  if (filtered.length === 0) {
    return NextResponse.json({ ok: false, error: "카테고리별 최소 1개 태그는 유지해야 합니다." }, { status: 400 });
  }

  const next = {
    ...catalog,
    professorTags: category === "professor" ? filtered : catalog.professorTags,
    courseTags: category === "course" ? filtered : catalog.courseTags,
  };

  const saved = await writeZokboTagCatalog(next);
  return NextResponse.json({ ok: true, category, tag, catalog: saved });
}
