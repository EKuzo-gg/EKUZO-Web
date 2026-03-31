type OurApproachSectionProps = {
  heading: string;
  listItems: [string, string, string];
  body: string;
  bg?: string;
  showImage?: boolean;
  /** Icons matching the homepage growth section pattern (red circle + white SVG) */
  icons?: [string, string, string];
};

export default function OurApproachSection({
  heading,
  listItems,
  body,
  bg = "bg-white",
  showImage = true,
  icons = ["/icons/swords-white.svg", "/icons/clock-white.svg", "/icons/trophy-white.svg"],
}: OurApproachSectionProps) {
  return (
    <section className={`${bg} relative overflow-visible`}>
      <div
        className="max-w-[1232px] mx-auto"
        style={{
          paddingLeft: "clamp(1rem, 7.2vw, 104px)",
          paddingRight: "clamp(1rem, 7.2vw, 104px)",
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
        }}
      >
        {/* Eyebrow — sits above the two-column layout */}
        <p
          className="text-red font-body font-medium uppercase mb-4"
          style={{ fontSize: "16px", letterSpacing: "10px" }}
        >
          OUR APPROACH
        </p>

        {/* Two-column layout: 70% copy left, 30% icons right */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-[80px] items-start">
          {/* Left column (~70%): heading + body */}
          <div className="flex flex-col gap-6 lg:basis-[70%] lg:shrink-0">
            <h4
              className="font-body font-bold text-black leading-[1]"
              style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              {heading}
            </h4>
            <p
              className="font-body text-black/70 leading-[1.417] max-w-[540px]"
              style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
            >
              {body}
            </p>
          </div>

          {/* Right column (~30%): icon list items — matches homepage growth section */}
          <div className="flex flex-col gap-6 lg:gap-8 lg:basis-[30%] lg:pt-2">
            {listItems.map((item, i) => (
              <div key={item} className="flex items-center gap-4 lg:gap-5">
                <div
                  className="shrink-0 size-[50px] lg:size-[72px] rounded-full bg-red flex items-center justify-center"
                  aria-hidden="true"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={icons[i]}
                    alt=""
                    className="size-6 lg:size-8"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
                <p
                  className="font-body font-bold text-black leading-[1.357]"
                  style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Black torn paper at bottom — Framer: Black3, centerY 99% */}
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
