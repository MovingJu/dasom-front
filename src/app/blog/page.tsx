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
            <form className="mb-5 flex flex-col gap-3 md:flex-row" method="get">
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
                className="bg-primary hover:bg-primary/90 rounded-xs px-5 py-3 text-sm font-semibold text-white"
              >
                검색
              </button>
              <Link
                href="/blog"
                className="border-primary/40 text-primary hover:bg-primary/10 rounded-xs border px-5 py-3 text-center text-sm font-semibold"
              >
                초기화
              </Link>
            </form>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-black dark:text-white">
                  보기 방식
                </span>
                <Link
                  href={makeFilterHref({ q, tag, view: "grid" })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    view === "grid"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  박스형
                </Link>
                <Link
                  href={makeFilterHref({ q, tag, view: "list" })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    view === "list"
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  목록형
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
                ? "-mx-4 flex flex-wrap justify-center"
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
