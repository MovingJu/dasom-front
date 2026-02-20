import { getAdminUserFromRequest } from "@/lib/adminApi";
import { getMockUsers } from "@/lib/auth";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const USERS_CSV_PATH = path.join(process.cwd(), "public", "mock", "users.csv");

type RouteContext = {
  params: Promise<{ id: string }>;
};

const writeUsersCsv = async (users: Awaited<ReturnType<typeof getMockUsers>>) => {
  const csv = [
    "id,email,password,name,role,active,studentId",
    ...users.map(
      (user) =>
        `${user.id},${user.email},${user.password},${user.name},${user.role},${String(user.active)},${user.studentId}`,
    ),
  ].join("\n");
  await fs.writeFile(USERS_CSV_PATH, `${csv}\n`, "utf8");
};

export async function DELETE(request: Request, context: RouteContext) {
  const admin = getAdminUserFromRequest(request);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { id } = await context.params;
  const users = await getMockUsers();
  const target = users.find((user) => user.id === id);
  if (!target) {
    return NextResponse.json({ ok: false, error: "대상 유저를 찾을 수 없습니다." }, { status: 404 });
  }

  if (admin.id === id) {
    return NextResponse.json({ ok: false, error: "현재 로그인한 관리자 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  const nextUsers = users.filter((user) => user.id !== id);
  await writeUsersCsv(nextUsers);

  return NextResponse.json({
    ok: true,
    deletedUserId: id,
  });
}
