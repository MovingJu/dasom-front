import { getMainPageData } from "@/lib/mainPage";

import FeaturesSectionClient from "./FeaturesSectionClient";

const formatStatValue = (key: string, value: number): string => {
  const formatted = value.toLocaleString("ko-KR");

  if (key.includes("부원")) return `${formatted}명`;
  if (key.includes("프로젝트")) return `${formatted}개`;
  if (key.includes("세미나")) return `${formatted}회`;
  if (key.includes("연혁") || key.includes("년")) return `${formatted}년`;

  return formatted;
};

const formatStatLabel = (key: string): string => {
  if (key.includes("부원")) return "현재 활발히 활동 중인 다솜 부원 수";
  if (key.includes("프로젝트")) return "지금까지 진행한 팀/개인 프로젝트 누적";
  if (key.includes("세미나")) return "한 학기 동안 운영되는 정기 세미나";
  if (key.includes("연혁") || key.includes("년")) return "다솜이 이어온 시간과 성장의 기록";

  return key;
};

const Features = async () => {
  const mainPage = await getMainPageData();
  const stats = mainPage.about_us_num.map((item) => ({
    key: formatStatLabel(item.key),
    valueText: formatStatValue(item.key, item.value),
  }));

  return <FeaturesSectionClient stats={stats} />;
};

export default Features;
