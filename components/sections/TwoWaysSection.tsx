import Link from "next/link";
import TornPaper from "@/components/ui/TornPaper";

export default function TwoWaysSection() {
  return (
    <section className="bg-black relative overflow-hidden">
      {/* Top torn paper */}
      <TornPaper color="white" style={2} flip />

      {/* Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
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
          paddingTop: "188px",
          paddingBottom: "188px",
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 max-w-[600px]">
          <p
            className="font-body font-medium text-white uppercase"
            style={{ fontSize: "16px", letterSpacing: "10px" }}
          >
            HOW IT WORKS
          </p>
          <h4
            className="font-body font-bold text-white leading-[1]"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            Two ways to participate
          </h4>
          <p
            className="font-body text-white/70 leading-[1.357] mt-4"
            style={{ fontSize: "28px" }}
          >
            Students join the same EKUZO experience, either through their school or from home.
          </p>
        </div>

        {/* Two cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/schools" className="block group">
            <div className="border border-white/20 p-12 flex flex-col gap-4 hover:bg-white/5 transition-colors duration-200" style={{ borderRadius: "2px" }}>
              <p
                className="font-body font-medium text-white/50 uppercase"
                style={{ fontSize: "16px", letterSpacing: "10px" }}
              >
                For schools
              </p>
              <p
                className="font-body text-white leading-[1.357]"
                style={{ fontSize: "28px" }}
              >
                For schools that want to bring EKUZO on campus.
              </p>
              <span className="text-white/50 font-body text-sm mt-4 group-hover:text-white transition-colors">
                Learn more →
              </span>
            </div>
          </Link>

          <Link href="/parents" className="block group">
            <div className="border border-white/20 p-12 flex flex-col gap-4 hover:bg-white/5 transition-colors duration-200" style={{ borderRadius: "2px" }}>
              <p
                className="font-body font-medium text-white/50 uppercase"
                style={{ fontSize: "16px", letterSpacing: "10px" }}
              >
                For families
              </p>
              <p
                className="font-body text-white leading-[1.357]"
                style={{ fontSize: "28px" }}
              >
                Students join individually from home in a fully online format.
              </p>
              <span className="text-white/50 font-body text-sm mt-4 group-hover:text-white transition-colors">
                Learn more →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom torn paper */}
      <TornPaper color="black" style={2} />
    </section>
  );
}
