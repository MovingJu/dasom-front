import { decodeSessionToken, type SessionUser } from "@/lib/auth";

const readCookieValue = (request: Request, name: string) => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  const token = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.replace(`${name}=`, "");

  return token;
};

export const getSessionUserFromRequest = (request: Request): SessionUser | null => {
  const token = readCookieValue(request, "dasom_session");
  return decodeSessionToken(token);
};

export const getAdminUserFromRequest = (request: Request): SessionUser | null => {
  const user = getSessionUserFromRequest(request);
  if (!user) return null;
  if (user.role !== "admin") return null;
  return user;
};
