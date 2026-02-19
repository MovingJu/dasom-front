import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative z-10 min-h-[100vh] overflow-hidden bg-cover bg-center bg-no-repeat pb-28 pt-[180px] md:bg-fixed md:pb-[190px] md:pt-[220px] xl:pb-[220px] xl:pt-[250px] 2xl:pb-[250px] 2xl:pt-[280px]"
      style={{ backgroundImage: "url('/images/hero/dasom_sul_danche.webp')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/55" />

      <div className="container relative z-10">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mt-12 max-w-[800px] text-center md:mt-20 lg:mt-24">
              <h1 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                다솜은 사랑입니다!
              </h1>
              <p className="mb-12 text-base leading-relaxed text-white/90 sm:text-lg md:text-xl">
                컴퓨터공학과 학술동아리 DASOM 공식 홈페이지
              </p>
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link
                  href="/signin"
                  className="rounded-xs bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-block rounded-xs bg-black/65 px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/75"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
