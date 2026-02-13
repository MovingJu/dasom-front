import Image from "next/image";

const AboutSectionTwo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          {/* 인라인 지도 */}
          <div className="w-full px-4 lg:w-1/2">
            <div
              className="relative mx-auto mb-12 aspect-25/24 max-w-[500px] text-center lg:mx-auto"
              data-wow-delay=".15s"
            >
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3176.3296128708084!2d127.08136311558172!3d37.239886350524635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b451fdb40471d%3A0x9c8f3b2e0f6b935e!2z7Jqp7J247IucIOyYgeuNleuPmSDqsr3tnazrjIDtlZnqtZAg7KCE7J6Q7KCV67O064yA7ZWZ6rSA!5e0!3m2!1sko!2skr!4v1584799570513!5m2!1sko!2skr" className="absolute top-0 left-0 h-full w-full rounded-lg drop-shadow-three dark:hidden dark:drop-shadow-none"></iframe>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3176.3296128708084!2d127.08136311558172!3d37.239886350524635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b451fdb40471d%3A0x9c8f3b2e0f6b935e!2z7Jqp7J247IucIOyYgeuNleuPmSDqsr3tnazrjIDtlZnqtZAg7KCE7J6Q7KCV67O064yA7ZWZ6rSA!5e0!3m2!1sko!2skr!4v1584799570513!5m2!1sko!2skr" className="absolute top-0 left-0 hidden h-full w-full rounded-lg drop-shadow-three dark:block dark:drop-shadow-none"></iframe>
            </div>
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <div className="max-w-[470px]">
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  다솜의 주소
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  경희대학교 국제캠퍼스 전자정보대학관<br></br>
                  경기 용인시 기흥구 덕영대로 1732
                </p>
              </div>
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  다솜의 동아리방
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  전자정보대학관 2층 <br></br>
                  241-1호
                </p>
              </div>
              <div className="mb-1">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  다솜의 비밀번호
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  회장님께 문의!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
