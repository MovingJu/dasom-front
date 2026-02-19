import { Brand } from "@/types/brand";
import Image from "next/image";
import brandsData from "./brandsData";

const Brands = () => {
  return (
    <section className="-mt-4 pt-10 md:-mt-6">
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-25 rounded-xs bg-[#f2edf1] px-5 py-8 dark:bg-[#2d282c] sm:px-6 md:px-8 md:py-10">
          {brandsData.map((brand) => (
            <SingleBrand key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;

const SingleBrand = ({ brand }: { brand: Brand }) => {
  const { href, image, imageLight, name } = brand;

  return (
    <div className="flex items-center justify-center">
      <a
        href={href}
        target="_blank"
        rel="nofollow noreferrer"
        className="relative h-10 w-[170px] opacity-70 transition hover:opacity-100 dark:opacity-60 dark:hover:opacity-100 sm:w-[190px]"
      >
        <Image src={imageLight} alt={name} fill className="hidden dark:block" />
        <Image src={image} alt={name} fill className="block dark:hidden" />
      </a>
    </div>
  );
};
