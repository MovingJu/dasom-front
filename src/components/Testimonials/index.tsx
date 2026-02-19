import { Testimonial } from "@/types/testimonial";
import SingleTestimonial from "./SingleTestimonial";

const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "조성언",
    designation: "회장",
    content:
      "안녕 새내기, 똥먹을래?",
    image: "/images/testimonials/auth-02.png",
  },
  {
    id: 2,
    name: "홍성학",
    designation: "부회장",
    content:
      "삼전 13층에 사람있어요",
    image: "/images/testimonials/auth-01.png",
  },
  {
    id: 3,
    name: "안시현",
    designation: "총무",
    content:
      "나 술 잘먹냐고? 아니 별로.",
    image: "/images/testimonials/auth-03.png",
  },
  {
    id: 4,
    name: "김민재",
    designation: "교육부장",
    content:
      "어, 뭐야? 너 객프 이대호 교수님 들어?? 와 그분 듣는 애는 귀한데.. 내가 컴퓨터공학과 커리큘럼 알려줄까...(생략)",
    image: "/images/testimonials/auth-03.png",
  },
  {
    id: 5,
    name: "한상연",
    designation: "교육부장",
    content:
      "반갑습니다. 최고의 웹파만점전략가 한상연입니다.",
    image: "/images/testimonials/auth-03.png",
  },
];

const Testimonials = () => {
  return (
    <section
      className="relative z-10 overflow-hidden bg-cover bg-center bg-no-repeat py-16 md:bg-fixed md:py-20 lg:py-28"
      style={{ backgroundImage: "url('/images/hero/dasom_danche.webp')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/65" />

      <div className="container relative z-10">
        <div className="mx-auto mb-[100px] max-w-[570px] text-center">
          <h2 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[45px]">
            2026년도 임원진을 소개합니다
          </h2>
          <p className="text-base leading-relaxed text-white/90 md:text-lg">
            다솜을 다솜답게, 안녕하세요 최고의 다솜 웹사이트 운영팀 임원진입니더.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {testimonialData.map((testimonial) => (
            <SingleTestimonial key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
