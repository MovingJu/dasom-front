import type { Metadata } from "next";
import BlogWriter from "@/components/Blog/BlogWriter";

export const metadata: Metadata = {
  title: "블로그 글 작성 | DASOM",
  description: "다솜 블로그 마크다운 글 작성 페이지",
};

const BlogWritePage = () => {
  return <BlogWriter />;
};

export default BlogWritePage;
