import { promises as fs } from "node:fs";
import path from "node:path";

export type MockUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  studentId: string;
  role: string;
  active: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

const USERS_CSV_PATH = path.join(process.cwd(), "public", "mock", "users.csv");
const KHU_EMAIL_SUFFIX = "@khu.ac.kr";

const parseCsvLine = (line: string) => line.split(",").map((item) => item.trim());

export const getMockUsers = async (): Promise<MockUser[]> => {
  const raw = await fs.readFile(USERS_CSV_PATH, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const [, ...rows] = lines;
  return rows.map((row) => {
    const columns = parseCsvLine(row);
    const [id, email, password, name, role, active] = columns;
    const studentId = columns[6] ?? "";
    return {
      id,
      email: email.toLowerCase(),
      password,
      name,
      studentId,
      role,
      active: active === "true",
    };
  });
};

export const verifyLogin = async (email: string, password: string) => {
  const users = await getMockUsers();
  const target = users.find((user) => user.email === email.toLowerCase());

  if (!target) {
    return { ok: false as const, reason: "NOT_FOUND" as const };
  }

  if (!target.active) {
    return { ok: false as const, reason: "INACTIVE" as const };
  }

  if (target.password !== password) {
    return { ok: false as const, reason: "WRONG_PASSWORD" as const };
  }

  const sessionUser: SessionUser = {
    id: target.id,
    email: target.email,
    name: target.name,
    role: target.role,
  };

  return { ok: true as const, user: sessionUser };
};

const hasForbiddenCsvCharacter = (value: string) => /[,\r\n]/.test(value);

export const isKhuEmail = (email: string) => email.toLowerCase().endsWith(KHU_EMAIL_SUFFIX);

export const registerMockUser = async (input: {
  email: string;
  password: string;
  name: string;
  studentId: string;
}) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  const name = input.name.trim();
  const studentId = input.studentId.trim();

  if (!email || !password || !name || !studentId) {
    return { ok: false as const, reason: "MISSING_FIELDS" as const };
  }

  if (!isKhuEmail(email)) {
    return { ok: false as const, reason: "INVALID_EMAIL_DOMAIN" as const };
  }

  if (!/^\d{10}$/.test(studentId)) {
    return { ok: false as const, reason: "INVALID_STUDENT_ID_FORMAT" as const };
  }

  if (studentId.startsWith("2026")) {
    return { ok: false as const, reason: "FRESHMAN_NOT_SUPPORTED" as const };
  }

  if (
    hasForbiddenCsvCharacter(email) ||
    hasForbiddenCsvCharacter(password) ||
    hasForbiddenCsvCharacter(name) ||
    hasForbiddenCsvCharacter(studentId)
  ) {
    return { ok: false as const, reason: "INVALID_CHARACTERS" as const };
  }

  const users = await getMockUsers();
  const duplicated = users.some((user) => user.email === email);
  if (duplicated) {
    return { ok: false as const, reason: "EMAIL_EXISTS" as const };
  }

  const maxId = users.reduce((acc, user) => {
    const parsed = Number.parseInt(user.id, 10);
    return Number.isNaN(parsed) ? acc : Math.max(acc, parsed);
  }, 0);
  const nextId = String(maxId + 1);

  await fs.appendFile(
    USERS_CSV_PATH,
    `\n${nextId},${email},${password},${name},member,true,${studentId}`,
  );

  const sessionUser: SessionUser = {
    id: nextId,
    email,
    name,
    role: "member",
  };

  return { ok: true as const, user: sessionUser };
};

export const encodeSessionToken = (user: SessionUser) => {
  const json = JSON.stringify(user);
  return Buffer.from(json, "utf8").toString("base64url");
};

export const decodeSessionToken = (token?: string): SessionUser | null => {
  if (!token) return null;

  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as SessionUser;

    if (!parsed?.id || !parsed?.email || !parsed?.name || !parsed?.role) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};
