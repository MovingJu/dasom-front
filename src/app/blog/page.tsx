import SingleBlog from "@/components/Blog/SingleBlog";
import { decodeSessionToken } from "@/lib/auth";
import { filterBlogPosts, getAllBlogPosts, getBlogTagRoot, splitBlogTagPath } from "@/lib/blog";
import { getBlogTagCatalog, getBlogTagChildren, hasBlogTagPath } from "@/lib/blogTagCatalog";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "다솜 활동 소식 | DASOM",
  description: "마크다운으로 작성된 다솜 활동 소식을 확인하세요.",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    subTag?: string;
    tagPath?: string;
    tagPaths?: string;
    view?: string;
  }>;
};

const normalizeTagPath = (value: string) => splitBlogTagPath(value).join("/");

const unique = (items: string[]) => Array.from(new Set(items));

const parseTagPaths = (params: Awaited<PageProps["searchParams"]>) => {
  const fromMulti = (params.tagPaths ?? "")
    .split(",")
    .map((item) => normalizeTagPath(item.trim()))
    .filter(Boolean);

  if (fromMulti.length > 0) {
    return unique(fromMulti);
  }

  const legacyTagPath = normalizeTagPath((params.tagPath ?? "").trim());
  if (legacyTagPath) {
    return [legacyTagPath];
  }

  const legacyTag = (params.tag ?? "").trim();
  const legacySubTag = (params.subTag ?? "").trim();
  const fromLegacy = normalizeTagPath([legacyTag, legacySubTag].filter(Boolean).join("/"));

  return fromLegacy ? [fromLegacy] : [];
};

const makeFilterHref = ({
  q,
  tagPaths,
  view,
}: {
  q?: string;
  tagPaths?: string[];
  view?: "grid" | "list";
}) => {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (tagPaths && tagPaths.length > 0) params.set("tagPaths", tagPaths.join(","));
  if (view) params.set("view", view);
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
};

const toggleRootGroup = (paths: string[], root: string) => {
  const hasSameRoot = paths.some((path) => path === root || path.startsWith(`${root}/`));
  if (hasSameRoot) {
    return paths.filter((path) => !(path === root || path.startsWith(`${root}/`)));
  }
  return [...paths, root];
};

const Blog = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const view = params.view === "list" ? "list" : "grid";

  const cookieStore = await cookies();
  const token = cookieStore.get("dasom_session")?.value;
  const user = decodeSessionToken(token);

  const allPosts = await getAllBlogPosts();
  const catalog = await getBlogTagCatalog();

  const requestedTagPaths = parseTagPaths(params);
  const selectedTagPaths = requestedTagPaths.filter((path) => hasBlogTagPath(catalog, splitBlogTagPath(path)));

  const drilldownBasePath = selectedTagPaths.length === 1 ? selectedTagPaths[0] : "";
  const drilldownBaseParts = splitBlogTagPath(drilldownBasePath);
  const nextLevelTags = selectedTagPaths.length === 1 ? getBlogTagChildren(catalog, drilldownBaseParts) : [];
  const rootTags = getBlogTagChildren(catalog, []);

  const posts = user
    ? filterBlogPosts(allPosts, { query: q, tagPaths: selectedTagPaths })
    : allPosts.filter((post) => post.tags.some((item) => getBlogTagRoot(item) === "공지"));

  return (
    <>
      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          {user ? (
            <div className="mb-10 rounded-xs bg-white p-5 shadow-three dark:bg-[#3a3338]">
              <form className="mb-5 flex items-center gap-2" method="get">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="제목, 본문, 작성자, 태그 검색"
                  className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-4 py-3 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
                />
                {selectedTagPaths.length > 0 ? (
                  <input type="hidden" name="tagPaths" value={selectedTagPaths.join(",")} />
                ) : null}
                <input type="hidden" name="view" value={view} />
                <button
                  type="submit"
                  aria-label="검색"
                  className="bg-primary hover:bg-primary/90 inline-flex h-[46px] w-[46px] items-center justify-center rounded-xs text-white"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M11 4C14.866 4 18 7.13401 18 11C18 12.7348 17.3694 14.3223 16.3253 15.5452L20.8891 20.1109L19.4749 21.5251L14.9092 16.9613C13.6863 18.0054 12.0988 18.636 10.364 18.636H10.3636C6.49765 18.636 3.36365 15.502 3.36365 11.636C3.36365 7.77001 6.49765 4.63601 10.3636 4.63601H11V4Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </form>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-black dark:text-white">보기 방식</span>
                  <Link
                    href={makeFilterHref({ q, tagPaths: selectedTagPaths, view: "grid" })}
                    aria-label="박스형 보기"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xs ${
                      view === "grid"
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
                      <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
                      <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
                      <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
                    </svg>
                  </Link>
                  <Link
                    href={makeFilterHref({ q, tagPaths: selectedTagPaths, view: "list" })}
                    aria-label="목록형 보기"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xs ${
                      view === "list"
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="1" y="2" width="14" height="2.25" rx="1" fill="currentColor" />
                      <rect x="1" y="6.875" width="14" height="2.25" rx="1" fill="currentColor" />
                      <rect x="1" y="11.75" width="14" height="2.25" rx="1" fill="currentColor" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-black dark:text-white">태그 필터</span>
                <Link
                  href={makeFilterHref({ q, view })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedTagPaths.length === 0
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  전체
                </Link>
                {rootTags.map((root) => {
                  const active = selectedTagPaths.some((path) => path === root || path.startsWith(`${root}/`));
                  return (
                    <Link
                      key={root}
                      href={makeFilterHref({
                        q,
                        tagPaths: toggleRootGroup(selectedTagPaths, root),
                        view,
                      })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        active
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      #{root}
                    </Link>
                  );
                })}
              </div>

              {selectedTagPaths.length > 0 ? (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-black dark:text-white">선택 태그</span>
                  {selectedTagPaths.map((path) => (
                    <Link
                      key={path}
                      href={makeFilterHref({
                        q,
                        tagPaths: selectedTagPaths.filter((item) => item !== path),
                        view,
                      })}
                      className="rounded-full bg-primary text-white px-3 py-1 text-xs font-semibold"
                    >
                      #{path} ×
                    </Link>
                  ))}
                </div>
              ) : null}

              {selectedTagPaths.length === 1 && nextLevelTags.length > 0 ? (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-black dark:text-white">하위 태그</span>
                  {nextLevelTags.map((item) => {
                    const nextPath = [...drilldownBaseParts, item].join("/");
                    return (
                      <Link
                        key={nextPath}
                        href={makeFilterHref({ q, tagPaths: [nextPath], view })}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        #{item}
                      </Link>
                    );
                  })}
                </div>
              ) : null}

              <p className="text-body-color text-sm">
                총 <span className="text-primary font-semibold">{posts.length}</span>개의 글
                {q ? ` (검색어: "${q}")` : ""}
                {selectedTagPaths.length > 0 ? ` (태그: ${selectedTagPaths.map((path) => `#${path}`).join(", ")})` : ""}
              </p>
            </div>
          ) : (
            <div className="mb-10 rounded-xs bg-white p-8 text-center shadow-three dark:bg-[#3a3338]">
              <p className="mb-2 text-4xl font-extrabold text-primary sm:text-5xl">로그인하세요</p>
              <p className="text-body-color text-base">비로그인 상태에서는 공지 글만 볼 수 있습니다.</p>
              <Link
                href="/signin?next=/blog"
                className="bg-primary hover:bg-primary/90 mt-5 inline-flex rounded-xs px-5 py-2.5 text-sm font-semibold text-white"
              >
                로그인하러 가기
              </Link>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="rounded-xs bg-white p-10 text-center shadow-three dark:bg-[#3a3338]">
              <p className="text-body-color">조건에 맞는 글이 없습니다.</p>
            </div>
          ) : null}

          <div className={view === "grid" ? "-mx-4 flex flex-wrap justify-start" : "space-y-4"}>
            {posts.map((post) => (
              <div
                key={post.slug}
                className={view === "grid" ? "mb-8 w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3" : "w-full"}
              >
                <SingleBlog blog={post} view={view} />
              </div>
            ))}
          </div>
        </div>
      </section>
      {user ? (
        <Link
          href="/blog/write"
          aria-label="블로그 글 작성하기"
          className="bg-primary hover:bg-primary/90 fixed bottom-8 left-8 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </Link>
      ) : null}
    </>
  );
};

export default Blog;
