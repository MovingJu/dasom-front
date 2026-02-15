import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { Metadata } from "next";
import zokboData from "@/components/Zokbo/zokboData";

export const metadata: Metadata = {
  title: "Zokbo | DASOM",
  description: "다솜 족보/시험 자료 다운로드 페이지",
};

const ZokboPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Zokbo"
        description="다솜 부원들을 위한 자료실입니다. 필요한 파일을 바로 다운로드할 수 있습니다."
      />

      <section className="pt-[120px] pb-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            {zokboData.map((item) => (
              <div
                key={item.id}
                className="mb-8 w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
              >
                <div className="group shadow-one hover:shadow-two dark:bg-dark dark:hover:shadow-gray-dark relative overflow-hidden rounded-xs bg-white duration-300">
                  <div className="p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
                    <h3>
                      <Link
                        href={`/blog-sidebar?id=${item.id}`}
                        className="hover:text-primary mb-4 block text-xl font-bold text-black sm:text-2xl dark:text-white dark:hover:text-primary"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    <p className="border-body-color/10 text-body-color mb-6 border-b pb-6 text-base font-medium dark:border-white/10">
                      {item.description}
                    </p>

                    <div className="mb-5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-primary/15 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mb-6 border-body-color/10 border-t pt-4 dark:border-white/10">
                      <p className="text-dark mb-1 text-sm font-medium dark:text-white">
                        학기
                      </p>
                      <p className="text-body-color text-xs">{item.semester}</p>
                    </div>

                    <a
                      href={item.file}
                      download
                      className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-xs px-5 py-3 text-sm font-semibold text-white transition"
                    >
                      파일 다운로드
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ZokboPage;
