import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export async function POST(request: Request) {
  const body = (await request.json()) as ContactBody;
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "이름, 이메일, 문의 내용을 모두 입력해 주세요." },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: "유효한 이메일 주소를 입력해 주세요." },
      { status: 400 },
    );
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "DASOM Contact <onboarding@resend.dev>";

  if (!to) {
    return NextResponse.json(
      { ok: false, error: "서버 설정(CONTACT_TO_EMAIL)이 없습니다." },
      { status: 500 },
    );
  }

  if (!resendApiKey) {
    return NextResponse.json(
      { ok: false, error: "서버 설정(RESEND_API_KEY)이 없습니다." },
      { status: 500 },
    );
  }

  const subject = `[DASOM 문의] ${name}`;
  const html = `
    <h2>DASOM 문의 메일</h2>
    <p><strong>이름:</strong> ${escapeHtml(name)}</p>
    <p><strong>이메일:</strong> ${escapeHtml(email)}</p>
    <p><strong>문의 내용:</strong></p>
    <div>${escapeHtml(message).replaceAll("\n", "<br/>")}</div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { ok: false, error: `메일 전송 실패: ${detail}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
