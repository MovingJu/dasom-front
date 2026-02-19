"use client";

import { useEffect, useRef, useState } from "react";

export default function Video() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isSwitched, setIsSwitched] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!titleRef.current) {
        return;
      }

      const rect = titleRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const titleCenter = rect.top + rect.height / 2;

      setIsSwitched(titleCenter <= viewportCenter);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="relative flex min-h-[42vh] items-center overflow-hidden py-12 md:min-h-[50vh] md:py-16 lg:min-h-[56vh]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
        style={{ backgroundImage: "url('/images/hero/dasom_sul_danche.webp')" }}
      />

      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 md:bg-fixed ${isSwitched ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: "url('/images/hero/dasom_danche.webp')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/60" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center text-white">
          <p className="text-primary mb-4 text-sm font-semibold tracking-[0.2em] uppercase">
            DASOM MOMENT
          </p>
          <h2 ref={titleRef} className="mb-6 text-3xl leading-tight font-bold sm:text-4xl md:text-5xl">
            함께 성장해 온 다솜의 시간
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            스크롤 위로 올라가도 이 장면은 그대로 남아, 다솜이 함께 만든 기록을 계속 보여줍니다.
          </p>
        </div>
      </div>
    </section>
  );
}
