import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogContent from "@/components/Blog/BlogContent";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "블로그 글을 찾을 수 없습니다 | DASOM",
      description: "요청한 블로그 글이 존재하지 않습니다.",
    };
  }

  return {
    title: `${post.title} | DASOM`,
    description: post.excerpt,
  };
}

const BlogDetailPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }
  const authorImage =
    post.author.image?.trim() || "/images/blog/author-default.png";
  const coverImage = post.coverImage?.trim();

  return (
    <section className="pb-[120px] pt-[150px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap justify-center">
          <article className="w-full px-4 lg:w-8/12">
            <h1 className="mb-8 text-3xl leading-tight font-bold text-black sm:text-4xl dark:text-white">
              {post.title}
            </h1>

            <div className="border-body-color/10 mb-10 flex flex-wrap items-center justify-between border-b pb-4 dark:border-white/10">
              <div className="mb-5 mr-10 flex items-center">
                <div className="mr-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src={authorImage} alt={post.author.name} fill />
                  </div>
                </div>
                <div>
                  <span className="text-body-color mb-1 block text-base font-medium">
                    By {post.author.name}
                  </span>
                  <span className="text-body-color text-xs">{post.author.designation}</span>
                </div>
              </div>

              <div className="mb-5 text-sm text-body-color">{post.date}</div>
            </div>

            {coverImage ? (
              <div className="mb-10 w-full overflow-hidden rounded-sm">
                <div className="relative aspect-97/44 w-full">
                  <Image
                    src={coverImage}
                    alt={post.title}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </div>
            ) : null}

            <BlogContent html={post.html} />

            {post.tags.length > 0 ? (
              <div className="mt-10 border-t border-body-color/10 pt-6 dark:border-white/10">
                <h4 className="mb-4 text-sm font-medium text-body-color">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
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

export default BlogDetailPage;
