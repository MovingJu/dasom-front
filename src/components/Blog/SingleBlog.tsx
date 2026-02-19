import type { BlogPost } from "@/lib/blog";
import type { Blog } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";

type BlogCard = Blog | BlogPost;

const toCardModel = (blog: BlogCard) => {
  if ("slug" in blog) {
    return {
      href: `/blog/${blog.slug}`,
      title: blog.title,
      author: blog.author,
      tags: blog.tags,
      publishDate: blog.date,
    };
  }

  return {
    href: "/blog-details",
    title: blog.title,
    author: blog.author,
    tags: blog.tags,
    publishDate: blog.publishDate,
  };
};

const SingleBlog = ({
  blog,
  view = "grid",
}: {
  blog: BlogCard;
  view?: "grid" | "list";
}) => {
  const { href, title, author, tags, publishDate } = toCardModel(blog);
  const isList = view === "list";
  const authorImage =
    author.image?.trim() || "/images/blog/author-default.png";

  return (
    <div
      className={`group shadow-one hover:shadow-two dark:bg-[#3a3338] dark:hover:shadow-gray-dark relative overflow-hidden rounded-xs bg-white duration-300 ${
        isList ? "" : "h-full"
      }`}
    >
      <div
        className={`${
          isList
            ? "p-4 sm:p-5"
            : "flex h-full flex-col p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8"
        }`}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary/10 text-primary inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h3>
          <Link
            href={href}
            className={`hover:text-primary dark:hover:text-primary block font-bold text-black dark:text-white ${
              isList ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
            }`}
          >
            {title}
          </Link>
        </h3>

        <div
          className={`border-body-color/10 border-b dark:border-white/10 ${
            isList ? "mb-3 pb-3" : "mb-6 pb-6"
          }`}
        />

        <div className={`flex items-center ${isList ? "" : "mt-auto"}`}>
          <div className="border-body-color/10 mr-5 flex items-center border-r pr-5 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5 dark:border-white/10">
            <div className="mr-4">
              <div
                className={`relative overflow-hidden rounded-full ${
                  isList ? "h-8 w-8" : "h-10 w-10"
                }`}
              >
                <Image src={authorImage} alt={author.name} fill sizes="40px" />
              </div>
            </div>
            <div className="w-full">
              <h4 className="text-dark mb-1 text-sm font-medium dark:text-white">
                By {author.name}
              </h4>
              <p className="text-body-color text-xs">{author.designation}</p>
            </div>
          </div>
          <div className="inline-block">
            <h4 className="text-dark mb-1 text-sm font-medium dark:text-white">
              Date
            </h4>
            <p className="text-body-color text-xs">{publishDate}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SingleBlog;
