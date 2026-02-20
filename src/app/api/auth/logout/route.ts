import { NextResponse } from "next/server";

const shouldUseSecureCookie = (request: Request) => {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }
  return new URL(request.url).protocol === "https:";
};

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("dasom_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}
