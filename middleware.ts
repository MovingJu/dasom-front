import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedPath = (pathname: string) =>
  pathname.startsWith("/blog/write") ||
  pathname.startsWith("/zokbo") ||
  pathname.startsWith("/blog-sidebar");

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("dasom_session")?.value;
  if (isValidSessionToken(token)) {
    return NextResponse.next();
  }

  const signinUrl = request.nextUrl.clone();
  signinUrl.pathname = "/signin";
  signinUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(signinUrl);
}

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const normalized = pad ? `${base64}${"=".repeat(4 - pad)}` : base64;
  return atob(normalized);
};

const isValidSessionToken = (token?: string) => {
  if (!token) return false;

  try {
    const raw = decodeBase64Url(token);
    const parsed = JSON.parse(raw) as {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    };

    return Boolean(
      parsed?.id && parsed?.email && parsed?.name && parsed?.role,
    );
  } catch {
    return false;
  }
};

export const config = {
  matcher: ["/blog/write", "/zokbo/:path*", "/blog-sidebar/:path*"],
};
