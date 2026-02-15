export type ZokboItem = {
  id: number;
  title: string;
  description: string;
  details: string[];
  tags: string[];
  semester: string;
  file: string;
};

const zokboData: ZokboItem[] = [
  {
    id: 1,
    title: "자료구조 중간고사 요약",
    description: "핵심 개념 위주로 정리한 다솜 내부 스터디용 요약본입니다.",
    details: [
      "배열/연결리스트/스택/큐의 시간복잡도 비교표를 포함했습니다.",
      "트리 순회(전위/중위/후위)와 해시 충돌 해결 방식 핵심 요약이 들어있습니다.",
    ],
    tags: ["전공", "자료구조", "중간고사"],
    semester: "2025-2",
    file: "/zokbo/data-structure-midterm.txt",
  },
  {
    id: 2,
    title: "객체지향프로그래밍 기출 포인트",
    description:
      "시험 전 빠르게 훑을 수 있도록 자주 나오는 포인트만 정리했습니다.",
    details: [
      "클래스/객체/생성자부터 상속, 다형성, 추상화까지 핵심만 추렸습니다.",
      "인터페이스와 추상 클래스 차이 및 자주 출제되는 서술형 키워드를 포함합니다.",
    ],
    tags: ["기출", "객체지향", "요약"],
    semester: "2025-2",
    file: "/zokbo/oop-points.txt",
  },
  {
    id: 3,
    title: "알고리즘 시험 대비 체크리스트",
    description:
      "정렬, 그래프, DP 단원별로 반드시 확인할 내용을 간단히 정리했습니다.",
    details: [
      "정렬별 시간복잡도/안정성 체크와 BFS/DFS 구현 패턴을 함께 정리했습니다.",
      "DP 문제에서 점화식 세우는 순서와 디버깅 체크포인트를 포함합니다.",
    ],
    tags: ["정리", "알고리즘", "체크리스트"],
    semester: "2026-1",
    file: "/zokbo/algorithm-checklist.txt",
  },
];

export default zokboData;
