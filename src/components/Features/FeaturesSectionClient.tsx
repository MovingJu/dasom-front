"use client";

import type { Feature } from "@/types/feature";

import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

type StatItem = {
  key: string;
  valueText: string;
};

const mergeStatsIntoFeatures = (
  baseFeatures: Feature[],
  stats: StatItem[],
): Feature[] => {
  return stats.map((stat, index) => {
    const feature = baseFeatures[index] ?? baseFeatures[0];
    return {
      ...feature,
      id: index + 1,
      title: stat.valueText,
      paragraph: stat.key,
    };
  });
};

const FeaturesSectionClient = ({ stats }: { stats: StatItem[] }) => {
  const statsFeatures = mergeStatsIntoFeatures(featuresData, stats);

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#fcfcfc] py-20 dark:bg-[#222222] md:py-24 lg:py-28"
    >
      <div className="container relative z-10">
        <div className="mx-auto max-w-[570px] text-center">
          <h2 className="mb-4 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">
            숫자로 보는 다솜
          </h2>
          <p className="text-base leading-relaxed text-body-color dark:text-white/90 md:text-lg">
            한눈에 보는 다솜의 현재와 성장 기록
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {statsFeatures.map((feature) => (
            <SingleFeature key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSectionClient;
