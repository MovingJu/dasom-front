import { Testimonial } from "@/types/testimonial";
import Image from "next/image";
const starIcon = (
  <svg width="18" height="16" viewBox="0 0 18 16" className="fill-current">
    <path d="M9.09815 0.361679L11.1054 6.06601H17.601L12.3459 9.59149L14.3532 15.2958L9.09815 11.7703L3.84309 15.2958L5.85035 9.59149L0.595291 6.06601H7.0909L9.09815 0.361679Z" />
  </svg>
);

const SingleTestimonial = ({ testimonial }: { testimonial: Testimonial }) => {
  const { name, image, content, designation } = testimonial;

  return (
    <div className="w-full">
      <div className="wow fadeInUp flex h-full flex-col rounded-2xl border border-white/30 bg-black/25 p-8 shadow-lg backdrop-blur-md duration-300 lg:px-5 xl:px-8">
        <p className="mb-8 border-b border-white/20 pb-8 text-base leading-relaxed text-white/90">
          “{content}
        </p>
        <div className="flex items-center">
          <div className="relative mr-4 h-[50px] w-full max-w-[50px] overflow-hidden rounded-full">
            <Image src={image} alt={name} fill />
          </div>
          <div className="w-full">
            <h3 className="mb-1 text-lg font-semibold text-white lg:text-base xl:text-lg">
              {name}
            </h3>
            <p className="text-sm text-white/80">{designation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTestimonial;
