import { decodeSessionToken } from "@/lib/auth";
import { getAllZokboPosts } from "@/lib/zokbo";
import { getZokboTagCatalog } from "@/lib/zokboTagCatalog";
import { cookies } from "next/headers";
import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "족보 | DASOM",
  description: "다솜 족보 자료를 태그 기반으로 확인하세요.",
};

type PageProps = {
  searchParams: Promise<{
    professor?: string;
    course?: string;
  }>;
};

const makeTagHref = (professor?: string, course?: string) => {
  const params = new URLSearchParams();
  if (professor?.trim()) params.set("professor", professor.trim());
  if (course?.trim()) params.set("course", course.trim());
  const query = params.toString();
  return query ? `/zokbo?${query}` : "/zokbo";
};

const ZokboPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const selectedProfessor = (params.professor ?? "").trim();
  const selectedCourse = (params.course ?? "").trim();

  const cookieStore = await cookies();
  const token = cookieStore.get("dasom_session")?.value;
  const user = decodeSessionToken(token);

  if (!user) {
    redirect("/signin?next=%2Fzokbo");
  }

  const allPosts = await getAllZokboPosts();
  const tagCatalog = await getZokboTagCatalog();
  const posts = allPosts.filter((post) => {
    const hasProfessor = selectedProfessor ? post.tags.includes(selectedProfessor) : true;
    const hasCourse = selectedCourse ? post.tags.includes(selectedCourse) : true;
    return hasProfessor && hasCourse;
  });

  return (
    <>
      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="mb-10 rounded-xs bg-white p-5 shadow-three dark:bg-[#3a3338]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-black dark:text-white">교수님 필터</span>
              <Link
                href={makeTagHref(undefined, selectedCourse)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  !selectedProfessor ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                전체
              </Link>
              {tagCatalog.professorTags.map((tag) => (
                <Link
                  key={tag}
                  href={makeTagHref(tag, selectedCourse)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedProfessor === tag ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-black dark:text-white">과목명 필터</span>
              <Link
                href={makeTagHref(selectedProfessor, undefined)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  !selectedCourse ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                전체
              </Link>
              {tagCatalog.courseTags.map((tag) => (
                <Link
                  key={tag}
                  href={makeTagHref(selectedProfessor, tag)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedCourse === tag ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <p className="text-body-color text-sm">
              총 <span className="text-primary font-semibold">{posts.length}</span>개
              {(selectedProfessor || selectedCourse)
                ? ` (교수님: ${selectedProfessor || "전체"}, 과목명: ${selectedCourse || "전체"})`
                : ""}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xs bg-white p-10 text-center shadow-three dark:bg-[#3a3338]">
              <p className="text-body-color">조건에 맞는 족보 글이 없습니다.</p>
            </div>
          ) : null}

          <div className="-mx-4 flex flex-wrap justify-start">
            {posts.map((post) => (
              <div key={post.slug} className="mb-8 w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
                <div className="group shadow-one hover:shadow-two dark:bg-[#3a3338] dark:hover:shadow-gray-dark relative h-full overflow-hidden rounded-xs bg-white duration-300">
                  <div className="flex h-full flex-col p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-primary/10 text-primary inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl">
                      <Link href={`/zokbo/${post.slug}`} className="hover:text-primary dark:hover:text-primary">
                        {post.title}
                      </Link>
                    </h3>

                    <div className="mt-auto border-t border-body-color/10 pt-4 text-xs text-body-color dark:border-white/10">
                      {post.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Link
        href="/zokbo/write"
        aria-label="족보 글 작성하기"
        className="bg-primary hover:bg-primary/90 fixed bottom-8 left-8 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </Link>
    </>
  );
};

export default ZokboPage;
