"use client";

import { useEffect, useMemo, useState } from "react";

type AdminBlogPost = {
  slug: string;
  title: string;
  tags: string[];
  date: string;
  content: string;
};

type AdminZokboPost = {
  slug: string;
  title: string;
  tags: string[];
  date: string;
  content: string;
};

type AdminUser = {
  id: string;
  email: string;
  name: string;
  studentId: string;
  role: string;
  active: boolean;
};

type ZokboTagCatalog = {
  professorTags: string[];
  courseTags: string[];
};

type DashboardResponse = {
  ok?: boolean;
  error?: string;
  currentAdminId?: string;
  blogPosts?: AdminBlogPost[];
  zokboPosts?: AdminZokboPost[];
  zokboTagCatalog?: ZokboTagCatalog;
  users?: AdminUser[];
};

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [blogPosts, setBlogPosts] = useState<AdminBlogPost[]>([]);
  const [zokboPosts, setZokboPosts] = useState<AdminZokboPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tagCatalog, setTagCatalog] = useState<ZokboTagCatalog>({ professorTags: [], courseTags: [] });

  const [selectedBlogSlug, setSelectedBlogSlug] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogTags, setBlogTags] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogMessage, setBlogMessage] = useState<string | null>(null);

  const [selectedZokboSlug, setSelectedZokboSlug] = useState("");
  const [zokboTitle, setZokboTitle] = useState("");
  const [zokboContent, setZokboContent] = useState("");
  const [zokboMessage, setZokboMessage] = useState<string | null>(null);

  const [tagCategory, setTagCategory] = useState<"professor" | "course">("professor");
  const [tagToAdd, setTagToAdd] = useState("");
  const [tagToDelete, setTagToDelete] = useState("");
  const [tagMessage, setTagMessage] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const selectedBlog = useMemo(
    () => blogPosts.find((post) => post.slug === selectedBlogSlug) ?? null,
    [blogPosts, selectedBlogSlug],
  );

  const selectedZokbo = useMemo(
    () => zokboPosts.find((post) => post.slug === selectedZokboSlug) ?? null,
    [zokboPosts, selectedZokboSlug],
  );

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const categoryTags = tagCategory === "professor" ? tagCatalog.professorTags : tagCatalog.courseTags;

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const data = (await response.json()) as DashboardResponse;
      if (!response.ok || !data.ok) {
        setError(data.error ?? "관리자 데이터를 불러오지 못했습니다.");
        return;
      }

      const nextBlogPosts = data.blogPosts ?? [];
      const nextZokboPosts = data.zokboPosts ?? [];
      const nextUsers = data.users ?? [];
      const nextTagCatalog = data.zokboTagCatalog ?? { professorTags: [], courseTags: [] };

      setCurrentAdminId(data.currentAdminId ?? "");
      setBlogPosts(nextBlogPosts);
      setZokboPosts(nextZokboPosts);
      setUsers(nextUsers);
      setTagCatalog(nextTagCatalog);

      const blogSlug = nextBlogPosts.some((post) => post.slug === selectedBlogSlug)
        ? selectedBlogSlug
        : (nextBlogPosts[0]?.slug ?? "");
      setSelectedBlogSlug(blogSlug);

      const zokboSlug = nextZokboPosts.some((post) => post.slug === selectedZokboSlug)
        ? selectedZokboSlug
        : (nextZokboPosts[0]?.slug ?? "");
      setSelectedZokboSlug(zokboSlug);

      const userId = nextUsers.some((user) => user.id === selectedUserId)
        ? selectedUserId
        : (nextUsers[0]?.id ?? "");
      setSelectedUserId(userId);

      const fallbackDeleteTag = (tagCategory === "professor" ? nextTagCatalog.professorTags[0] : nextTagCatalog.courseTags[0]) ?? "";
      setTagToDelete((prev) =>
        prev && (tagCategory === "professor" ? nextTagCatalog.professorTags : nextTagCatalog.courseTags).includes(prev)
          ? prev
          : fallbackDeleteTag,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setBlogTitle(selectedBlog?.title ?? "");
    setBlogTags((selectedBlog?.tags ?? []).join(","));
    setBlogContent(selectedBlog?.content ?? "");
  }, [selectedBlog]);

  useEffect(() => {
    setZokboTitle(selectedZokbo?.title ?? "");
    setZokboContent(selectedZokbo?.content ?? "");
  }, [selectedZokbo]);

  useEffect(() => {
    setTagToDelete(categoryTags[0] ?? "");
  }, [tagCategory, tagCatalog.professorTags, tagCatalog.courseTags]);

  const onUpdateBlog = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBlogSlug) return;
    setBlogMessage(null);
    const response = await fetch(`/api/admin/blog/${selectedBlogSlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: blogTitle, tags: blogTags, content: blogContent }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setBlogMessage(data.error ?? "블로그 글 수정 실패");
      return;
    }
    setBlogMessage("블로그 글 수정 완료");
    await loadDashboard();
  };

  const onUpdateZokbo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedZokboSlug) return;
    setZokboMessage(null);
    const response = await fetch(`/api/admin/zokbo/${selectedZokboSlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: zokboTitle, content: zokboContent }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setZokboMessage(data.error ?? "족보 글 수정 실패");
      return;
    }
    setZokboMessage("족보 글 수정 완료");
    await loadDashboard();
  };

  const onAddTag = async (event: React.FormEvent) => {
    event.preventDefault();
    setTagMessage(null);
    const response = await fetch("/api/admin/zokbo/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: tagCategory, tag: tagToAdd }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setTagMessage(data.error ?? "태그 추가 실패");
      return;
    }
    setTagMessage("태그 추가 완료");
    setTagToAdd("");
    await loadDashboard();
  };

  const onDeleteTag = async () => {
    if (!tagToDelete) return;
    setTagMessage(null);
    const response = await fetch("/api/admin/zokbo/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: tagCategory, tag: tagToDelete }),
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setTagMessage(data.error ?? "태그 삭제 실패");
      return;
    }
    setTagMessage("태그 삭제 완료");
    await loadDashboard();
  };

  const onPromoteUser = async () => {
    if (!selectedUserId) return;
    setUserMessage(null);
    const response = await fetch(`/api/admin/users/${selectedUserId}/promote`, { method: "POST" });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setUserMessage(data.error ?? "어드민 승격 실패");
      return;
    }
    setUserMessage("어드민 승격 완료");
    await loadDashboard();
  };

  const onDeleteUser = async () => {
    if (!selectedUserId) return;
    setUserMessage(null);
    const response = await fetch(`/api/admin/users/${selectedUserId}`, { method: "DELETE" });
    const data = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) {
      setUserMessage(data.error ?? "유저 삭제 실패");
      return;
    }
    setUserMessage("유저 삭제 완료");
    await loadDashboard();
  };

  if (loading) return <p className="text-body-color">관리자 데이터를 불러오는 중입니다...</p>;
  if (error) return <p className="text-sm text-primary">{error}</p>;

  return (
    <div className="space-y-8">
      <form onSubmit={onUpdateBlog} className="space-y-3 rounded-xs border border-body-color/20 p-5 dark:border-white/15">
        <h2 className="text-xl font-semibold text-black dark:text-white">블로그 글 수정</h2>
        <select value={selectedBlogSlug} onChange={(e) => setSelectedBlogSlug(e.target.value)} className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white">
          {blogPosts.map((post) => (
            <option key={post.slug} value={post.slug}>
              {post.title} ({post.slug})
            </option>
          ))}
        </select>
        <input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="제목" className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white" />
        <input value={blogTags} onChange={(e) => setBlogTags(e.target.value)} placeholder="태그 (콤마 구분)" className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white" />
        <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} className="border-body-color/20 focus:border-primary h-64 w-full rounded-xs border bg-[#f8f8f8] p-3 font-mono text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white" />
        <button type="submit" className="bg-primary rounded-xs px-4 py-2 text-sm font-semibold text-white">블로그 글 저장</button>
        {blogMessage ? <p className="text-sm text-body-color dark:text-white/80">{blogMessage}</p> : null}
      </form>

      <form onSubmit={onUpdateZokbo} className="space-y-3 rounded-xs border border-body-color/20 p-5 dark:border-white/15">
        <h2 className="text-xl font-semibold text-black dark:text-white">족보 글 수정</h2>
        <select value={selectedZokboSlug} onChange={(e) => setSelectedZokboSlug(e.target.value)} className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white">
          {zokboPosts.map((post) => (
            <option key={post.slug} value={post.slug}>
              {post.title} ({post.slug})
            </option>
          ))}
        </select>
        <input value={zokboTitle} onChange={(e) => setZokboTitle(e.target.value)} placeholder="제목" className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white" />
        <textarea value={zokboContent} onChange={(e) => setZokboContent(e.target.value)} className="border-body-color/20 focus:border-primary h-64 w-full rounded-xs border bg-[#f8f8f8] p-3 font-mono text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white" />
        <button type="submit" className="bg-primary rounded-xs px-4 py-2 text-sm font-semibold text-white">족보 글 저장</button>
        {zokboMessage ? <p className="text-sm text-body-color dark:text-white/80">{zokboMessage}</p> : null}
      </form>

      <div className="space-y-3 rounded-xs border border-body-color/20 p-5 dark:border-white/15">
        <h2 className="text-xl font-semibold text-black dark:text-white">족보 전체 태그 관리</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setTagCategory("professor")} className={`rounded-xs px-3 py-1 text-xs font-semibold ${tagCategory === "professor" ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>교수님 태그</button>
          <button type="button" onClick={() => setTagCategory("course")} className={`rounded-xs px-3 py-1 text-xs font-semibold ${tagCategory === "course" ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>과목명 태그</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryTags.map((tag) => (
            <span key={tag} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">#{tag}</span>
          ))}
        </div>
        <form onSubmit={onAddTag} className="flex flex-wrap items-center gap-2">
          <input value={tagToAdd} onChange={(e) => setTagToAdd(e.target.value)} placeholder="추가할 태그" className="border-body-color/20 focus:border-primary rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white" />
          <button type="submit" className="bg-primary rounded-xs px-4 py-2 text-sm font-semibold text-white">태그 추가</button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <select value={tagToDelete} onChange={(e) => setTagToDelete(e.target.value)} className="border-body-color/20 focus:border-primary rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white">
            {categoryTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <button type="button" onClick={onDeleteTag} className="rounded-xs border border-primary px-4 py-2 text-sm font-semibold text-primary">태그 삭제</button>
        </div>
        <p className="text-xs text-body-color dark:text-white/70">
          태그 사전 수정 시 기존 족보 글 내부 태그 문자열은 자동 변경하지 않습니다. 이는 백엔드 동기화 정책에서 처리합니다.
        </p>
        {tagMessage ? <p className="text-sm text-body-color dark:text-white/80">{tagMessage}</p> : null}
      </div>

      <div className="space-y-3 rounded-xs border border-body-color/20 p-5 dark:border-white/15">
        <h2 className="text-xl font-semibold text-black dark:text-white">유저 관리 (삭제/어드민 승격)</h2>
        <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-3 py-2 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white">
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        {selectedUser ? <p className="text-sm text-body-color dark:text-white/80">ID: {selectedUser.id} / Role: {selectedUser.role} / Active: {String(selectedUser.active)}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onPromoteUser} disabled={!selectedUser || selectedUser.role === "admin"} className="bg-primary rounded-xs px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">어드민 승격</button>
          <button type="button" onClick={onDeleteUser} disabled={!selectedUser || selectedUser.id === currentAdminId} className="rounded-xs border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50">유저 삭제</button>
        </div>
        {userMessage ? <p className="text-sm text-body-color dark:text-white/80">{userMessage}</p> : null}
      </div>
    </div>
  );
};

export default AdminPanel;
