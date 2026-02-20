import BlogContent from "@/components/Blog/BlogContent";
import { decodeSessionToken } from "@/lib/auth";
import { getAllZokboPosts, getZokboPostBySlug } from "@/lib/zokbo";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllZokboPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getZokboPostBySlug(slug);

  if (!post) {
    return {
      title: "족보 글을 찾을 수 없습니다 | DASOM",
      description: "요청한 족보 글이 존재하지 않습니다.",
    };
  }

  return {
    title: `${post.title} | DASOM 족보`,
    description: `${post.tags.join(", ")} 태그의 족보 글`,
  };
}

const ZokboDetailPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("dasom_session")?.value;
  const user = decodeSessionToken(token);

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent(`/zokbo/${slug}`)}`);
  }

  const post = await getZokboPostBySlug(slug);
  if (!post) notFound();

  return (
    <section className="pb-[120px] pt-[150px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap justify-center">
          <article className="w-full px-4 lg:w-8/12">
            <h1 className="mb-8 text-3xl leading-tight font-bold text-black sm:text-4xl dark:text-white">
              {post.title}
            </h1>
            <div className="border-body-color/10 mb-10 flex flex-wrap items-center justify-between border-b pb-4 dark:border-white/10">
              <div className="mb-5 text-sm text-body-color">
                By {post.authorName} · {post.authorDesignation}
              </div>
              <div className="mb-5 text-sm text-body-color">{post.date}</div>
            </div>

            <BlogContent html={post.html} />

            {post.attachments.length > 0 ? (
              <div className="mt-10 rounded-xs border border-body-color/10 p-5 dark:border-white/10">
                <h4 className="mb-4 text-sm font-semibold text-black dark:text-white">첨부파일 다운로드</h4>
                <ul className="space-y-2">
                  {post.attachments.map((file) => (
                    <li key={`${file.name}-${file.url}`}>
                      <a
                        href={file.url}
                        download
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {post.tags.length > 0 ? (
              <div className="mt-10 border-t border-body-color/10 pt-6 dark:border-white/10">
                <h4 className="mb-4 text-sm font-medium text-body-color">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/zokbo?tag=${encodeURIComponent(tag)}`}
                      className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
};

export default ZokboDetailPage;
