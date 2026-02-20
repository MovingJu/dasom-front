import { getAdminUserFromRequest } from "@/lib/adminApi";
import { getMockUsers } from "@/lib/auth";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllZokboPosts } from "@/lib/zokbo";
import { getZokboTagCatalog } from "@/lib/zokboTagCatalog";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = getAdminUserFromRequest(request);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const [blogPosts, zokboPosts, users, tagCatalog] = await Promise.all([
    getAllBlogPosts(),
    getAllZokboPosts(),
    getMockUsers(),
    getZokboTagCatalog(),
  ]);

  return NextResponse.json({
    ok: true,
    currentAdminId: admin.id,
    blogPosts: blogPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      tags: post.tags,
      date: post.date,
      content: post.content,
    })),
    zokboPosts: zokboPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      tags: post.tags,
      date: post.date,
      content: post.content,
      attachments: post.attachments,
    })),
    zokboTagCatalog: tagCatalog,
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      studentId: user.studentId,
      role: user.role,
      active: user.active,
    })),
  });
}
