import TornPaper from "@/components/ui/TornPaper";

type OurApproachSectionProps = {
  heading: string;
  listItems: [string, string, string];
  body: string;
  bg?: string;
  showImage?: boolean;
};

export default function OurApproachSection({
  heading,
  listItems,
  body,
  bg = "bg-white",
  showImage = true,
}: OurApproachSectionProps) {
  return (
    <section className={`${bg} relative`}>
      <div
        className="max-w-[1232px] mx-auto"
        style={{
          paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
          paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          paddingTop: "clamp(2rem, 10vw, 188px)",
          paddingBottom: "clamp(2rem, 10vw, 188px)",
        }}
      >
        {/* Top: eyebrow + heading */}
        <div className="flex flex-col gap-4 mb-16 md:max-w-[600px]">
          <p
            className="text-red font-body font-medium uppercase"
            style={{ fontSize: "16px", letterSpacing: "10px" }}
          >
            OUR APPROACH
          </p>
          <h4
            className="font-body font-bold text-black leading-[1]"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            {heading}
          </h4>
        </div>

        {/* Bottom: two columns */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-[160px]">
          {/* Left: 3 list items */}
          <ul className="flex flex-col gap-6 md:flex-[0_0_auto] md:w-[460px]">
            {listItems.map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span className="mt-1 shrink-0 size-5 rounded-full bg-red flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span
                  className="font-body font-bold text-black leading-[1.357]"
                  style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Right: body copy */}
          <p
            className="font-body text-black/70 leading-[1.417] flex-1"
            style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
          >
            {body}
          </p>
        </div>
      </div>

      {/* Torn paper divider at bottom */}
      <TornPaper color="black" style={3} />
    </section>
  );
}
