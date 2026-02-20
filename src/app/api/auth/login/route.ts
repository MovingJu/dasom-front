import { encodeSessionToken, verifyLogin } from "@/lib/auth";
import { NextResponse } from "next/server";

type LoginBody = {
  email?: string;
  password?: string;
};

const shouldUseSecureCookie = (request: Request) => {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return new URL(request.url).protocol === "https:";
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "이메일과 비밀번호를 입력해 주세요." },
      { status: 400 },
    );
  }

  const result = await verifyLogin(email, password);

  if (!result.ok) {
    const messageByReason = {
      NOT_FOUND: "등록되지 않은 이메일입니다.",
      WRONG_PASSWORD: "비밀번호가 올바르지 않습니다.",
      INACTIVE: "비활성화된 계정입니다.",
    } as const;

    return NextResponse.json(
      { ok: false, error: messageByReason[result.reason] },
      { status: 401 },
    );
  }

  const token = encodeSessionToken(result.user);
  const response = NextResponse.json({ ok: true, user: result.user });
  response.cookies.set("dasom_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
