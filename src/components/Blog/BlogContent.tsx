"use client";

import { useEffect, useRef } from "react";

type BlogContentProps = {
  html: string;
};

const BlogContent = ({ html }: BlogContentProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = async (event: Event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest(".blog-copy-btn") as HTMLButtonElement | null;
      if (!button) return;

      const wrapper = button.closest(".blog-code-wrap");
      const codeEl = wrapper?.querySelector("pre code");
      const codeText = codeEl?.textContent ?? "";

      if (!codeText) return;

      try {
        await navigator.clipboard.writeText(codeText);
        const original = button.textContent;
        button.textContent = "복사됨";
        button.disabled = true;
        setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
        }, 1200);
      } catch {
        const original = button.textContent;
        button.textContent = "실패";
        setTimeout(() => {
          button.textContent = original;
        }, 1200);
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [html]);

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default BlogContent;
