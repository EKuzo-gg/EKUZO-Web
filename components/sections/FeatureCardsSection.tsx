type Feature = {
  title: string;
  body: string;
};

type FeatureCardsSectionProps = {
  heading: string;
  body: string;
  cardBg?: string;
  sectionBg?: string;
  features: Feature[];
  bgImage?: string;
};

export default function FeatureCardsSection({
  heading,
  body,
  cardBg = "bg-grey",
  sectionBg = "bg-transparent",
  features,
  bgImage,
}: FeatureCardsSectionProps) {
  return (
    <section
      className={`${sectionBg} relative`}
      style={{
        backgroundImage: bgImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "188px",
        paddingBottom: "188px",
      }}
    >
      <div className="max-w-[1232px] mx-auto" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        {/* Large card */}
        <div
          className={`${cardBg} p-16 mb-8`}
          style={{ borderRadius: "2px" }}
        >
          <h4
            className="font-body font-bold text-black leading-[1] mb-6"
            style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
          >
            {heading}
          </h4>
          <p
            className="font-body text-black/70 leading-[1.357]"
            style={{ fontSize: "28px" }}
          >
            {body}
          </p>
        </div>

        {/* Feature cards — alternating alignment */}
        <div className="flex flex-col gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex ${i % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}
            >
              <div
                className="bg-white p-12 w-full md:w-[560px]"
                style={{ borderRadius: "2px" }}
              >
                <h5
                  className="font-body font-bold text-black leading-[1.2] mb-4"
                  style={{ fontSize: "40px" }}
                >
                  {feature.title}
                </h5>
                <p
                  className="font-body text-black/70 leading-[1.417]"
                  style={{ fontSize: "24px" }}
                >
                  {feature.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
