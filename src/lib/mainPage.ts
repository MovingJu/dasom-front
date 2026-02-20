import { promises as fs } from "node:fs";
import path from "node:path";

export type MainPageAboutUsNumber = {
  key: string;
  value: number;
};

export type MainPageData = {
  title: string;
  main: {
    title: string;
    subtitle: string;
  };
  about_us: Array<{
    title: string;
    content: string;
  }>;
  about_us_num: MainPageAboutUsNumber[];
  bosses: Array<{
    year: number;
    name: string;
    phone: string;
  }>;
  images: string[];
};

type MainPageApiResponse = {
  status: number;
  message: string;
  data: MainPageData;
};

const toBoolean = (value: string | undefined): boolean => {
  return value === "1" || value?.toLowerCase() === "true";
};

const getMainPageUrl = (): string => {
  const protocol = process.env.DASOM_API_PROTOCOL ?? "http";
  const host = process.env.DASOM_API_HOST ?? "localhost";
  const port = process.env.DASOM_API_PORT ?? "9001";
  const path = process.env.DASOM_API_MAIN_PAGE_PATH ?? "/main-page";

  return `${protocol}://${host}:${port}${path}`;
};

const MAIN_PAGE_MOCK_PATH = path.join(process.cwd(), "public", "mock", "main-page.json");

const getMainPageMockData = async (): Promise<MainPageData> => {
  const raw = await fs.readFile(MAIN_PAGE_MOCK_PATH, "utf8");
  const parsed = JSON.parse(raw) as MainPageApiResponse;
  return parsed.data;
};

export const getMainPageData = async (): Promise<MainPageData> => {
  const useMock = toBoolean(process.env.DASOM_USE_MOCK);

  if (useMock) {
    return getMainPageMockData();
  }

  try {
    const response = await fetch(getMainPageUrl(), {
      method: "GET",
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch main page data: ${response.status}`);
    }

    const payload = (await response.json()) as MainPageApiResponse;

    if (!payload?.data?.about_us_num) {
      throw new Error("Invalid main page response schema");
    }

    return payload.data;
  } catch {
    return getMainPageMockData();
  }
};
