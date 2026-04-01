import Link from "next/link";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";

export default function TwoWaysSection() {
  return (
    <section className="bg-black relative overflow-visible">
      {/* White torn paper at top — Framer: White2, absolute */}
      <div
        className="absolute top-0 left-0 right-0 z-20 pointer-events-none select-none"
        style={{
          height: "clamp(115px, 19vw, 300px)",
          transform: "translateY(-50%)",
          backgroundImage: "url(/images/torn-paper-white-1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      {/* Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ top: "-4%" }}
        aria-hidden="true"
      >
        <span
          className="font-display uppercase text-white text-center leading-none"
          style={{ fontSize: "clamp(4rem, 14vw, 16rem)", opacity: 0.08 }}
        >
          LEARN + PLAY
        </span>
      </div>

      <div
        className="max-w-[1232px] mx-auto relative z-10"
        style={{
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          paddingTop: "clamp(100px, 14vw, 188px)",
          paddingBottom: "clamp(100px, 14vw, 188px)",
        }}
      >
        {/* Header — centered */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 max-w-[800px] mx-auto">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h4
            className="font-body font-bold text-white leading-[1]"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            Two ways to participate
          </h4>
          <p
            className="font-body text-white/70 leading-[1.357] mt-4"
            style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
          >
            Students join the same EKUZO experience, either through their school or from home.
          </p>
        </div>

        {/* Two cards — white bg with angled clip-path corners, matching homepage SCHOOL/HOME pattern */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div
            className="bg-white p-8 lg:p-12 flex flex-col justify-between min-h-[280px] lg:min-h-[480px]"
            style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
          >
            <div className="flex flex-col gap-6">
              <p
                className="font-display uppercase text-black leading-none"
                style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
              >
                SCHOOL
              </p>
              <p
                className="font-body text-black leading-[1.417] max-w-[380px]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                For schools that want to bring EKUZO on&nbsp;campus.
              </p>
            </div>
            <div className="mt-8">
              <Button variant="red-outlined" href="/schools">
                For Schools
              </Button>
            </div>
          </div>

          <div
            className="bg-white p-8 lg:p-12 flex flex-col justify-between min-h-[280px] lg:min-h-[480px]"
            style={{ clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)" }}
          >
            <div className="flex flex-col gap-6">
              <p
                className="font-display uppercase text-black leading-none"
                style={{ fontSize: "clamp(80px, 8vw, 120px)" }}
              >
                HOME
              </p>
              <p
                className="font-body text-black leading-[1.417] max-w-[380px]"
                style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
              >
                Students join individually from home in a fully online&nbsp;format.
              </p>
            </div>
            <div className="mt-8">
              <Button variant="red-outlined" href="/parents">
                For Families
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Black torn paper at bottom — Framer: Black2 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none"
        style={{
          height: "clamp(115px, 19vw, 300px)",
          transform: "translateY(50%)",
          backgroundImage: "url(/images/torn-paper-black-1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
