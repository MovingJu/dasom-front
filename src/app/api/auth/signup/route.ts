import { registerMockUser } from "@/lib/auth";
import { NextResponse } from "next/server";

type SignupBody = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SignupBody;
  const result = await registerMockUser({
    email: body.email ?? "",
    password: body.password ?? "",
    name: body.name ?? "",
  });

  if (!result.ok) {
    const messageByReason = {
      MISSING_FIELDS: "이름, 이메일, 비밀번호를 모두 입력해 주세요.",
      INVALID_EMAIL_DOMAIN: "회원가입은 @khu.ac.kr 이메일만 가능합니다.",
      INVALID_CHARACTERS: "입력값에 사용할 수 없는 문자가 포함되어 있습니다.",
      EMAIL_EXISTS: "이미 가입된 이메일입니다.",
    } as const;

    return NextResponse.json(
      { ok: false, error: messageByReason[result.reason] },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      user: result.user,
      message: "회원가입이 완료되었습니다. 로그인해 주세요.",
    },
    { status: 201 },
  );
}
