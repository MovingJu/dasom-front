import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <>
      <section
        id="features"
        className="bg-white py-16 dark:bg-[#222222] md:py-20 lg:py-28"
      >
        <div className="container">
          <SectionTitle
            title="숫자로 보는 다솜"
            paragraph="'Talk is cheap, Show me the code' - Linus Torvalds"
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
