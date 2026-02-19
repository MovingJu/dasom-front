import { decodeSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dasom_session")?.value;
  const user = decodeSessionToken(token);

  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 200 });
  }

  return NextResponse.json({ ok: true, user });
}
