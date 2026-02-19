import type { Metadata } from "next";
import BlogWriter from "@/components/Blog/BlogWriter";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSessionToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "블로그 글 작성 | DASOM",
  description: "다솜 블로그 마크다운 글 작성 페이지",
};

const BlogWritePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("dasom_session")?.value;
  const user = decodeSessionToken(token);

  if (!user) {
    redirect("/signin?next=/blog/write");
  }

  return <BlogWriter />;
};

export default BlogWritePage;
