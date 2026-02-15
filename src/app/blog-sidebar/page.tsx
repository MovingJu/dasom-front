import Breadcrumb from "@/components/Common/Breadcrumb";
import zokboData from "@/components/Zokbo/zokboData";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "zokbo-sidebar | DASOM",
  description: "다솜 족보 사이드바 페이지",
};

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

const BlogSidebarPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const selectedId = Number(params.id ?? zokboData[0]?.id ?? 1);
  const selected =
    zokboData.find((item) => item.id === selectedId) ?? zokboData[0];

  const popularTags = Array.from(new Set(zokboData.flatMap((item) => item.tags)));

  return (
    <>
      <Breadcrumb
        pageName="zokbo-sidebar"
        description="족보 상세 내용을 확인하고 바로 다운로드할 수 있습니다."
      />

      <section className="overflow-hidden pt-[180px] pb-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-8/12">
              <div className="shadow-three dark:bg-gray-dark rounded-xs bg-white p-6 sm:p-8">
                <h1 className="mb-4 text-3xl leading-tight font-bold text-black sm:text-4xl dark:text-white">
                  {selected.title}
                </h1>

                <p className="text-body-color mb-6 text-base leading-relaxed font-medium">
                  {selected.description}
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary/15 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-body-color mb-6 text-sm font-medium">
                  학기: {selected.semester}
                </div>

                <div className="mb-8 space-y-4">
                  {selected.details.map((detail, idx) => (
                    <p key={`${selected.id}-detail-${idx}`} className="text-body-color text-base leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>

                <a
                  href={selected.file}
                  download
                  className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-xs px-6 py-3 text-sm font-semibold text-white transition"
                >
                  파일 다운로드
                </a>
              </div>
            </div>

            <div className="w-full px-4 lg:w-4/12">
              <div className="mt-12 space-y-8 lg:mt-0">
                <div className="shadow-three dark:bg-gray-dark rounded-xs bg-white p-6">
                  <h3 className="mb-5 text-xl font-bold text-black dark:text-white">
                    관련 족보
                  </h3>
                  <ul className="space-y-4">
                    {zokboData.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/blog-sidebar?id=${item.id}`}
                          className={`block text-sm font-medium transition ${
                            item.id === selected.id
                              ? "text-primary"
                              : "text-body-color hover:text-primary"
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shadow-three dark:bg-gray-dark rounded-xs bg-white p-6">
                  <h3 className="mb-5 text-xl font-bold text-black dark:text-white">
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary/15 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogSidebarPage;
