"use client";

import { useEffect, useRef, useState } from "react";

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isSwitched, setIsSwitched] = useState(false);

  useEffect(() => {
    const updateSwitchState = () => {
      if (!sectionRef.current) {
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      setIsSwitched(sectionCenter <= viewportCenter);
    };

    updateSwitchState();
    window.addEventListener("scroll", updateSwitchState, { passive: true });
    window.addEventListener("resize", updateSwitchState);

    return () => {
      window.removeEventListener("scroll", updateSwitchState);
      window.removeEventListener("resize", updateSwitchState);
    };
  }, []);

  const statsFeatures = mergeStatsIntoFeatures(featuresData, stats);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden py-20 md:py-24 lg:py-28"
    >
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 md:bg-fixed ${isSwitched ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundImage: "url('/images/hero/dasom_sul_danche.webp')" }}
      />
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 md:bg-fixed ${isSwitched ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: "url('/images/hero/dasom_danche.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/65" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-[570px] text-center">
          <h2 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[45px]">
            숫자로 보는 다솜
          </h2>
          <p className="text-base leading-relaxed text-white/90 md:text-lg">
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
