import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "2026 1학기 다솜 신입부원 모집 안내",
    paragraph:
      "다솜과 함께 성장할 신입부원을 모집합니다. 활동 일정, 지원 방법, OT 일정까지 한 번에 확인하세요.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "다솜 운영진",
      image: "/images/blog/author-03.png",
      designation: "홍보팀",
    },
    tags: ["모집"],
    publishDate: "2026-03-02",
  },
  {
    id: 2,
    title: "겨울방학 알고리즘 스터디 회고",
    paragraph:
      "8주 동안 진행한 알고리즘 스터디 결과를 공유합니다. 사용한 문제집, 진행 방식, 다음 시즌 개선점까지 정리했습니다.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "김다솜",
      image: "/images/blog/author-02.png",
      designation: "교육부",
    },
    tags: ["스터디"],
    publishDate: "2026-01-28",
  },
  {
    id: 3,
    title: "동아리방 리뉴얼 & 장비 정리 기록",
    paragraph:
      "전자정보대학관 동아리방 환경 개선 작업을 진행했습니다. 좌석 배치, 공용 장비, 사용 수칙 업데이트 내용을 확인해보세요.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "박경희",
      image: "/images/blog/author-03.png",
      designation: "총무팀",
    },
    tags: ["공지"],
    publishDate: "2025-12-18",
  },
];
export default blogData;
