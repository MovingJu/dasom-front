import SingleBlog from "@/components/Blog/SingleBlog";
import { filterBlogPosts, getAllBlogPosts, getAllBlogTags } from "@/lib/blog";
import Link from "next/link";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "다솜 활동 소식 | DASOM",
  description: "마크다운으로 작성된 다솜 활동 소식을 확인하세요.",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    view?: string;
  }>;
};

const makeFilterHref = ({
  q,
  tag,
  view,
}: {
  q?: string;
  tag?: string;
  view?: "grid" | "list";
}) => {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (tag?.trim()) params.set("tag", tag.trim());
  if (view) params.set("view", view);
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
};

const Blog = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const tag = (params.tag ?? "").trim();
  const view = params.view === "list" ? "list" : "grid";

  const allPosts = await getAllBlogPosts();
  const tags = getAllBlogTags(allPosts);
  const posts = filterBlogPosts(allPosts, { query: q, tag });

  return (
    <>
      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="mb-10 rounded-xs bg-white p-5 shadow-three dark:bg-gray-dark">
            <form className="mb-5 flex items-center gap-2" method="get">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="제목, 본문, 작성자, 태그 검색"
                className="border-body-color/20 focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-4 py-3 text-sm outline-hidden dark:border-white/15 dark:bg-[#2f2a2e] dark:text-white"
              />
              {tag ? <input type="hidden" name="tag" value={tag} /> : null}
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
                <span className="text-sm font-semibold text-black dark:text-white">
                  보기 방식
                </span>
                <Link
                  href={makeFilterHref({ q, tag, view: "grid" })}
                  aria-label="박스형 보기"
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xs ${
                    view === "grid"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
                    <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
                    <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
                    <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
                  </svg>
                </Link>
                <Link
                  href={makeFilterHref({ q, tag, view: "list" })}
                  aria-label="목록형 보기"
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xs ${
                    view === "list"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect x="1" y="2" width="14" height="2.25" rx="1" fill="currentColor" />
                    <rect x="1" y="6.875" width="14" height="2.25" rx="1" fill="currentColor" />
                    <rect x="1" y="11.75" width="14" height="2.25" rx="1" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-black dark:text-white">
                태그 필터
              </span>
              <Link
                href={makeFilterHref({ q, view })}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  !tag
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                전체
              </Link>
              {tags.map((item) => (
                <Link
                  key={item}
                  href={makeFilterHref({ q, tag: item, view })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item === tag
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  #{item}
                </Link>
              ))}
            </div>

            <p className="text-body-color text-sm">
              총 <span className="text-primary font-semibold">{posts.length}</span>개의 글
              {q ? ` (검색어: "${q}")` : ""}
              {tag ? ` (태그: #${tag})` : ""}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xs bg-white p-10 text-center shadow-three dark:bg-gray-dark">
              <p className="text-body-color">조건에 맞는 글이 없습니다.</p>
            </div>
          ) : null}

          <div
            className={
              view === "grid"
                ? "-mx-4 flex flex-wrap justify-start"
                : "space-y-4"
            }
          >
            {posts.map((post) => (
              <div
                key={post.slug}
                className={
                  view === "grid"
                    ? "mb-8 w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
                    : "w-full"
                }
              >
                <SingleBlog blog={post} view={view} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
