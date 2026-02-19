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

const BlogWriter = () => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
              placeholder="태그 (쉼표 구분)"
              className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-4 py-3 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
            />
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-body-color/20 focus:border-primary h-[420px] w-full rounded-xs border bg-[#f8f8f8] p-4 font-mono text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
            spellCheck={false}
          />

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
