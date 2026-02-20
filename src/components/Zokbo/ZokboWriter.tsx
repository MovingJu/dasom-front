"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type CreateResult = {
  ok?: boolean;
  error?: string;
};

type UploadResult = {
  ok?: boolean;
  file?: {
    originalName: string;
    fileName: string;
    url: string;
    size: number;
    mimeType: string;
  };
  error?: string;
};

type ZokboWriterProps = {
  professorTags: string[];
  courseTags: string[];
};

const ZokboWriter = ({ professorTags, courseTags }: ZokboWriterProps) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [selectedProfessorTag, setSelectedProfessorTag] = useState(professorTags[0] ?? "");
  const [selectedCourseTag, setSelectedCourseTag] = useState(courseTags[0] ?? "");
  const [content, setContent] = useState("# 과목명\n\n족보 내용을 작성하세요.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      title.trim().length > 0 &&
      content.trim().length > 0 &&
      selectedProfessorTag.trim().length > 0 &&
      selectedCourseTag.trim().length > 0 &&
      uploadedFiles.length > 0,
    [title, content, selectedProfessorTag, selectedCourseTag, uploadedFiles],
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/zokbo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tags: [selectedProfessorTag, selectedCourseTag],
          content,
          attachments: uploadedFiles.map((file) => ({ name: file.name, url: file.url })),
        }),
      });
      const data = (await response.json()) as CreateResult;

      if (!response.ok || !data.ok) {
        setMessage(data.error || "족보 글 저장에 실패했습니다.");
        return;
      }

      router.push("/zokbo");
      router.refresh();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "알 수 없는 오류");
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

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const uploaded: Array<{ name: string; url: string }> = [];

      for (const inputFile of selectedFiles) {
        const formData = new FormData();
        formData.append("file", inputFile);

        const response = await fetch("/api/zokbo/upload", {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        });
        const raw = await response.text();
        let data: UploadResult | null = null;
        try {
          data = JSON.parse(raw) as UploadResult;
        } catch {
          data = null;
        }

        if (!response.ok || !data?.ok || !data.file) {
          if (response.status === 413) {
            setUploadMessage("업로드 크기 제한(413)으로 실패했습니다. 100MB 이하 파일만 업로드해 주세요.");
            return;
          }
          if (!data) {
            setUploadMessage(`${inputFile.name} 업로드 실패 (status: ${response.status}): ${raw.slice(0, 120)}`);
            return;
          }
          setUploadMessage(data.error || `${inputFile.name} 업로드 실패 (status: ${response.status})`);
          return;
        }

        uploaded.push({ name: data.file.originalName, url: data.file.url });
      }

      if (uploaded.length > 0) {
        const markdown = `\n${uploaded.map((file) => `- [${file.name}](${file.url})`).join("\n")}\n`;
        insertAtCursor(markdown);

        setUploadedFiles((prev) => {
          const next = [...prev];
          for (const file of uploaded) {
            if (!next.some((item) => item.url === file.url)) {
              next.push(file);
            }
          }
          return next;
        });

        setUploadMessage(`${uploaded.length}개 파일 업로드 완료: ${uploaded.map((file) => file.name).join(", ")}`);
      } else {
        setUploadMessage("선택한 파일을 업로드하지 못했습니다.");
      }
    } catch (error: unknown) {
      setUploadMessage(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-black dark:text-white">족보 글 작성</h1>
          <Link
            href="/zokbo"
            className="rounded-xs border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 dark:hover:bg-primary/30"
          >
            목록으로
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xs bg-white p-6 shadow-three dark:bg-[#3a3338]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 *"
            className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-4 py-3 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-black dark:text-white">
              태그 선택 (교수님 + 과목명 각 1개)
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={selectedProfessorTag}
                onChange={(e) => setSelectedProfessorTag(e.target.value)}
                className="border-body-color/20 focus:border-primary rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
              >
                {professorTags.map((tag) => (
                  <option key={tag} value={tag}>
                    교수님: {tag}
                  </option>
                ))}
              </select>
              <select
                value={selectedCourseTag}
                onChange={(e) => setSelectedCourseTag(e.target.value)}
                className="border-body-color/20 focus:border-primary rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
              >
                {courseTags.map((tag) => (
                  <option key={tag} value={tag}>
                    과목명: {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-body-color/20 focus:border-primary h-[420px] w-full rounded-xs border bg-[#f8f8f8] p-4 font-mono text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
            spellCheck={false}
          />

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="*/*"
              multiple
              onChange={onFileUpload}
              disabled={isUploading}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => {
                if (!fileInputRef.current) return;
                fileInputRef.current.value = "";
                fileInputRef.current.click();
              }}
              disabled={isUploading}
              className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xs px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "업로드 중..." : "파일 업로드"}
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-primary hover:bg-primary/90 rounded-xs px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-primary/60"
            >
              {isSubmitting ? "저장 중..." : "족보 글 저장"}
            </button>
            {uploadMessage ? (
              <span className="text-sm text-body-color dark:text-white/80">{uploadMessage}</span>
            ) : null}
            <span className="text-sm font-semibold text-primary">
              첨부 {uploadedFiles.length}개
            </span>
            <span className="text-xs text-body-color dark:text-white/70">
              pdf/csv/zip/txt 등 모든 파일 형식을 업로드할 수 있습니다.
            </span>
          </div>

          {message ? (
            <p className="rounded-xs border border-primary/25 bg-primary/10 p-4 text-sm text-dark dark:text-white">{message}</p>
          ) : null}

          {uploadedFiles.length > 0 ? (
            <div className="rounded-xs border border-body-color/20 p-4 dark:border-white/15">
              <h4 className="mb-3 text-sm font-semibold text-black dark:text-white">업로드된 파일</h4>
              <ul className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <li key={`${file.url}-${index}`} className="flex items-center justify-between gap-3">
                    <a href={file.url} download className="text-primary text-sm hover:underline">
                      {file.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles((prev) => prev.filter((item) => item.url !== file.url))}
                      className="rounded border border-primary/30 px-2 py-1 text-xs text-primary hover:bg-primary/10"
                    >
                      제거
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
};

export default ZokboWriter;
