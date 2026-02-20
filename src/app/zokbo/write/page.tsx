import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSessionToken } from "@/lib/auth";
import ZokboWriter from "@/components/Zokbo/ZokboWriter";
import { getAllZokboPosts, getAllZokboTags } from "@/lib/zokbo";

export const metadata: Metadata = {
  title: "족보 글 작성 | DASOM",
  description: "다솜 족보 마크다운 글 작성 페이지",
};

const ZokboWritePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("dasom_session")?.value;
  const user = decodeSessionToken(token);

  if (!user) {
    redirect("/signin?next=/zokbo/write");
  }

  const posts = await getAllZokboPosts();
  const tags = getAllZokboTags(posts);

  return <ZokboWriter availableTags={tags} />;
};

export default ZokboWritePage;

