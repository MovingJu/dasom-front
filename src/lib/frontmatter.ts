export type ParsedMarkdown = {
  meta: Record<string, string>;
  metaOrder: string[];
  content: string;
};

export const parseFrontmatter = (raw: string): ParsedMarkdown => {
  if (!raw.startsWith("---\n")) {
    return { meta: {}, metaOrder: [], content: raw };
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { meta: {}, metaOrder: [], content: raw };
  }

  const frontmatter = raw.slice(4, end);
  const content = raw.slice(end + 5);

  const meta: Record<string, string> = {};
  const metaOrder: string[] = [];

  for (const line of frontmatter.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    meta[key] = value;
    metaOrder.push(key);
  }

  return { meta, metaOrder, content };
};

const sanitizeValue = (value: string) => value.replace(/\r?\n/g, " ").trim();

export const stringifyFrontmatter = (
  meta: Record<string, string>,
  content: string,
  preferredOrder?: string[],
) => {
  const orderedKeys = (preferredOrder ?? []).filter((key) => key in meta);
  const restKeys = Object.keys(meta).filter((key) => !orderedKeys.includes(key));
  const keys = [...orderedKeys, ...restKeys];

  const lines = ["---"];
  for (const key of keys) {
    lines.push(`${key}: ${sanitizeValue(meta[key] ?? "")}`);
  }
  lines.push("---", "");

  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
  return `${lines.join("\n")}${normalizedContent}`;
};

export const cleanLine = (value: string) => value.replace(/\r?\n/g, " ").trim();
