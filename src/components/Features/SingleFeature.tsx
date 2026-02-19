import { Feature } from "@/types/feature";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph } = feature;
  return (
    <div className="w-full text-center">
      <div
        className="wow fadeInUp flex h-full flex-col items-center rounded-2xl border border-white/30 bg-black/25 p-7 shadow-lg backdrop-blur-md"
        data-wow-delay=".15s"
      >
        <div className="bg-primary/10 text-primary mb-10 flex h-[70px] w-[70px] items-center justify-center rounded-md">
          {icon}
        </div>
        <h3 className="mb-5 text-xl font-bold text-white sm:text-2xl lg:text-xl xl:text-2xl">
          {title}
        </h3>
        <p className="text-base leading-relaxed font-medium text-white/90">
          {paragraph}
        </p>
      </div>
    </div>
  );
};

export default SingleFeature;
