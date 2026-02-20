"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type CreateResult = {
  ok?: boolean;
  slug?: string;
  path?: string;
  detailUrl?: string;
  error?: string;
};

type UploadResult = {
  ok?: boolean;
  url?: string;
  error?: string;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const markdownToPreviewHtml = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  const renderInline = (line: string) => {
    const escaped = escapeHtml(line);
    return escaped
      .replace(/`([^`]+)`/g, "<code class=\"rounded bg-primary/10 px-1 py-0.5 text-primary\">$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-6 w-full rounded-md" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(
        `<pre class="mb-6 overflow-x-auto rounded-md bg-[#1e1e1e] p-4 text-sm text-[#d4d4d4]"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level} class="mb-4 font-bold text-black dark:text-white">${renderInline(h[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      out.push(`<blockquote class="mb-6 border-l-4 border-primary bg-primary/10 p-4">${renderInline(line.slice(2))}</blockquote>`);
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(`<li>${renderInline(lines[i].trim().slice(2))}</li>`);
        i += 1;
      }
      out.push(`<ul class="mb-6 list-inside list-disc space-y-2">${items.join("")}</ul>`);
      continue;
    }

    out.push(`<p class="mb-6 text-base leading-relaxed">${renderInline(line)}</p>`);
    i += 1;
  }

  return out.join("\n");
};

const BlogWriter = () => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("# 새 글 제목\n\n본문을 작성하세요.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0,
    [title, content],
  );
  const previewHtml = useMemo(() => markdownToPreviewHtml(content), [content]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/blog/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          tags,
          content,
        }),
      });

      const data = (await response.json()) as CreateResult;
      if (response.ok && data.ok) {
        router.push("/blog");
        router.refresh();
        return;
      }

      setResult(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "요청 처리 중 알 수 없는 오류가 발생했습니다.";
      setResult({ error: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n${text}`);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const next = `${content.slice(0, start)}${text}${content.slice(end)}`;
    setContent(next);

    const cursor = start + text.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const wrapSelection = (prefix: string, suffix = prefix, placeholder = "텍스트") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = content.slice(start, end);
    const value = selected || placeholder;
    const inserted = `${prefix}${value}${suffix}`;
    const next = `${content.slice(0, start)}${inserted}${content.slice(end)}`;
    setContent(next);

    requestAnimationFrame(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + value.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
      }
    });
  };

  const insertLinePrefix = (prefix: string, fallback = "내용") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = content.slice(start, end) || fallback;
    const nextText = selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    const next = `${content.slice(0, start)}${nextText}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + nextText.length);
    });
  };

  const onImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/blog/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as UploadResult;

      if (!response.ok || !data.ok || !data.url) {
        setUploadMessage(data.error || "이미지 업로드에 실패했습니다.");
        return;
      }

      const alt = file.name.replace(/\.[^.]+$/, "") || "image";
      const markdown = `\n![${alt}](${data.url})\n`;
      insertAtCursor(markdown);
      setUploadMessage("이미지 업로드 완료");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      setUploadMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-black dark:text-white">블로그 글 작성</h1>
          <Link
            href="/blog"
            className="rounded-xs border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 dark:hover:bg-primary/30"
          >
            목록으로
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xs bg-white p-6 shadow-three dark:bg-[#3a3338]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 *"
              className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-4 py-3 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="태그 (쉼표 구분, 예: 공지/회비,스터디/알고리즘)"
              className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-4 py-3 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
            />
          </div>
          <p className="text-body-color text-xs">
            태그는 <code>태그1/태그2</code> 형식으로 입력하면 하위 태그로 처리됩니다.
          </p>

          <div className="overflow-hidden rounded-xs border border-body-color/20 dark:border-white/15">
            <div className="flex items-center justify-between border-b border-body-color/20 bg-[#f8f8f8] px-2 py-2 dark:border-white/15 dark:bg-[#2f2a2e]">
              {mode === "write" ? (
                <div className="flex flex-wrap items-center gap-1">
                  <button type="button" onClick={() => wrapSelection("**")} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">B</button>
                  <button type="button" onClick={() => wrapSelection("*")} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary italic">I</button>
                  <button type="button" onClick={() => wrapSelection("~~")} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary line-through">S</button>
                  <button type="button" onClick={() => wrapSelection("`")} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">Code</button>
                  <button type="button" onClick={() => wrapSelection("[", "](https://)") } className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">Link</button>
                  <button type="button" onClick={() => insertLinePrefix("# ")} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">H1</button>
                  <button type="button" onClick={() => insertLinePrefix("> ")} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">Quote</button>
                  <button type="button" onClick={() => insertLinePrefix("- ")} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">List</button>
                </div>
              ) : <div />}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode("write")}
                  className={`rounded-xs px-3 py-1 text-xs font-semibold ${
                    mode === "write" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setMode("preview")}
                  className={`rounded-xs px-3 py-1 text-xs font-semibold ${
                    mode === "preview" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {mode === "write" ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-[420px] w-full bg-white p-4 font-mono text-sm outline-hidden dark:bg-[#2f2a2e] dark:text-white"
                spellCheck={false}
              />
            ) : (
              <div
                className="h-[420px] overflow-y-auto bg-white p-4 text-[#2f1d30] dark:bg-[#2f2a2e] dark:text-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer rounded-xs px-5 py-3 text-sm font-semibold">
              {isUploading ? "업로드 중..." : "이미지 업로드"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={isUploading}
                onChange={onImageUpload}
              />
            </label>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-primary hover:bg-primary/90 rounded-xs px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-primary/60"
            >
              {isSubmitting ? "작성 중..." : "마크다운 글 저장"}
            </button>
            {uploadMessage ? (
              <span className="text-sm text-body-color dark:text-white/80">{uploadMessage}</span>
            ) : null}
          </div>

          {result ? (
            <div className="rounded-xs border border-primary/25 bg-primary/10 p-4 text-sm text-dark dark:text-white">
              {result.ok ? (
                <>
                  저장 완료: <code>{result.path}</code>
                  {result.detailUrl ? (
                    <>
                      {" "}
                      <Link href={result.detailUrl} className="text-primary underline">
                        글 보기
                      </Link>
                    </>
                  ) : null}
                </>
              ) : (
                <>실패: {result.error ?? "알 수 없는 오류"}</>
              )}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
};

export default BlogWriter;
