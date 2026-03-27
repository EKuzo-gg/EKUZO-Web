import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import OurApproachSection from "@/components/sections/OurApproachSection";
import ProgramsSection from "@/components/sections/ProgramsSection";
import FeatureCardsSection from "@/components/sections/FeatureCardsSection";
import TickerSection from "@/components/sections/TickerSection";

export const metadata = {
  title: "Schools — EKUZO",
  description:
    "Bring EKUZO esports programming to your school. Partner with us to build a structured, coach-led programme on campus.",
};

const schoolsFAQs = [
  {
    question: "What does EKUZO require from the school?",
    answer:
      "A dedicated space with computers (or student devices), internet access, and a school proctor to supervise sessions. EKUZO coaches handle everything else remotely.",
  },
  {
    question: "How does scheduling work?",
    answer:
      "Sessions run 2–3 times per week during or after school, depending on the program track. EKUZO works around your academic calendar.",
  },
  {
    question: "Is this only for competitive students?",
    answer:
      "No. EKUZO is built for any student who games — from casual to competitive. The focus is growth, not rank.",
  },
  {
    question: "How does EKUZO handle safety and moderation?",
    answer:
      "All sessions are coach-led and all communication channels are actively moderated. Students sign a Code of Conduct and coaches are trained in youth safety.",
  },
  {
    question: "What game does EKUZO focus on?",
    answer:
      "Currently League of Legends. It provides rich team dynamics, communication requirements, and deep strategy — exactly what the EKUZO curriculum is designed around.",
  },
];

export default function SchoolsPage() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      {/* 1. Hero — white bg */}
      <section
        className="bg-white relative overflow-hidden"
        style={{ paddingTop: "240px", paddingBottom: "360px" }}
      >
        <div className="max-w-[1232px] mx-auto px-6 md:px-[104px] relative z-10">
          <h1
            className="font-display uppercase text-black leading-none"
            style={{ fontSize: "clamp(3rem, 13vw, 16rem)" }}
          >
            ESPORTS THAT BELONG IN
            <br />
            SCHOOLS
          </h1>
        </div>

        {/* Left character — absolute */}
        <div
          className="absolute z-20 hidden md:block"
          style={{ left: "36%", transform: "translateX(-50%)", bottom: 0 }}
        >
          <Image
            src="/images/schools-hero-left.png"
            alt=""
            width={545}
            height={732}
            aria-hidden="true"
            className="object-contain"
          />
        </div>

        {/* Right graphic — absolute */}
        <div
          className="absolute z-20 hidden md:block"
          style={{ right: 0, top: "34%", transform: "translateY(-50%)" }}
        >
          <Image
            src="/images/schools-hero-right.png"
            alt=""
            width={512}
            height={494}
            aria-hidden="true"
            className="object-contain"
          />
        </div>
      </section>

      {/* Divider: white hero → grey approach */}
      <TornPaperDivider color="white" />

      {/* 2. Our Approach */}
      <OurApproachSection
        heading="What is EKUZO?"
        listItems={["Structured practice", "Skilled coaching", "Growth through play"]}
        body="Gaming is one of the most powerful motivators young people have — across backgrounds, interests, and ability levels. EKUZO turns that motivation into structured growth through coaching, teamwork, and shared expectations. Students don't just play. They practice, communicate, lead, and reflect. This isn't about fixing kids. It's about building the structure most of them are missing."
        bg="bg-grey"
      />

      {/* 3. Ecosystem Animation */}
      <section className="relative overflow-clip" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen">
          <EcosystemAnimation />
        </div>
      </section>

      {/* Divider: ecosystem → grey feature cards */}
      <TornPaperDivider color="black" />

      {/* 4. Feature Cards — Why schools choose EKUZO */}
      <section className="bg-grey relative overflow-hidden" style={{ paddingTop: "144px", paddingBottom: "240px" }}>
        {/* Decorative circle images */}
        <div className="absolute inset-y-0 left-0 w-[400px] pointer-events-none" aria-hidden="true">
          <Image
            src="/images/schools-circle-left.png"
            alt=""
            fill
            className="object-contain object-left"
          />
        </div>
        <div className="absolute inset-y-0 right-0 w-[300px] pointer-events-none" aria-hidden="true">
          <Image
            src="/images/schools-circle-right.png"
            alt=""
            fill
            className="object-contain object-right"
          />
        </div>

        <div className="max-w-[1232px] mx-auto px-6 md:px-[104px] relative z-10">
          {/* Large card */}
          <div className="bg-white p-16 mb-8" style={{ borderRadius: "2px" }}>
            <h4
              className="font-body font-bold text-black leading-[1] mb-6"
              style={{ fontSize: "clamp(2rem, 4.4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              Why schools choose EKUZO?
            </h4>
            <p
              className="font-body text-black/70 leading-[1.357]"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              Schools don&apos;t choose EKUZO because they want esports. They choose it because they&apos;re facing real student challenges and need a solution that fits inside academic priorities, staffing limits, and community expectations. EKUZO is designed to help schools act thoughtfully, without taking on unnecessary risk, burden, or distraction.
            </p>
          </div>

          {/* Feature cards with decorative images scattered between */}
          <div className="flex flex-col gap-8">
            {[
              { title: "Hard problems, not bad students", body: "Disengagement and anxiety are systemic challenges, not discipline issues." },
              { title: "Built to run, not to improvise", body: "Coaching, curriculum, competition, and safety are designed to work together." },
              { title: "Easy to implement", body: "Clear roles, predictable structure, and external coaches reduce lift for school staff." },
              { title: "Youth development first", body: "Gaming is the medium; growth, skills, and belonging are the goals." },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`flex ${i % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}
              >
                <div className="bg-white p-12 w-full md:w-[560px]" style={{ borderRadius: "2px" }}>
                  <h5
                    className="font-body font-bold text-black leading-[1.2] mb-4"
                    style={{ fontSize: "clamp(1.75rem, 2.8vw, 40px)" }}
                  >
                    {feature.title}
                  </h5>
                  <p
                    className="font-body text-black/70 leading-[1.417]"
                    style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
                  >
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 5. Programs — EKUZOTEAMS only */}
      <ProgramsSection showTeams showEkuzo100={false} showCamps={false} />

      {/* Divider: programs → dark ticker */}
      <TornPaperDivider color="black" />

      {/* 6. Ticker — What schools see (dark) */}
      <section className="bg-black relative">
        <TickerSection
          eyebrow="PROGRAMS"
          heading="What Schools See in their Students"
          theme="dark"
          bg="bg-black"
          cards={[
            { title: "Attendance", body: "Students show up more consistently when they belong to a team with shared goals." },
            { title: "Engagement", body: "Motivation earned in practice carries into class, behavior, and daily energy." },
            { title: "Belonging", body: "Students who didn't connect elsewhere find a place to contribute and be seen." },
            { title: "Skills", body: "Communication, leadership, and digital skills develop through coached team play." },
          ]}
        />
      </section>

      {/* Divider: dark ticker → red quote */}
      <TornPaperDivider color="red" />

      {/* 7. Quote block — Karlin Oei */}
      <section className="bg-red relative overflow-hidden" style={{ paddingTop: "144px", paddingBottom: "144px" }}>
        <div className="max-w-[880px] mx-auto px-6 md:px-[104px] text-center relative z-10">
          <Image
            src="/images/games-quote-mark.png"
            alt=""
            width={40}
            height={40}
            className="mx-auto mb-8"
            aria-hidden="true"
          />
          <h5
            className="font-body font-bold text-white leading-[1.2] mb-10"
            style={{ fontSize: "clamp(1.5rem, 2.8vw, 40px)" }}
          >
            &ldquo;Once students see what they&apos;re capable of, you don&apos;t have to push them. They push themselves.&rdquo;
          </h5>
          <p
            className="font-body font-bold text-white"
            style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
          >
            Karlin Oei
          </p>
          <p
            className="font-body font-bold text-white"
            style={{ fontSize: "clamp(1.125rem, 2vw, 28px)", opacity: 0.6 }}
          >
            Founder EKUZO
          </p>
        </div>

      </section>

      {/* Divider: red quote → light ticker */}
      <TornPaperDivider color="red" />

      {/* 8. Ticker — Pedagogy behind the program (light) */}
      <TickerSection
        heading="The pedagogy behind the program"
        body="EKUZO is built on proven learning principles, applied inside a structure students already care about."
        theme="light"
        bg="bg-white"
        cards={[
          { title: "Motivation", body: "Visible wins build intrinsic drive, turning effort into enthusiasm." },
          { title: "Feedback loops", body: "Every class follows a rhythm of show up, learn, grow and reflect." },
          { title: "Social learning", body: "Students collaborate, communicate, and lead in authentic, high-pressure situations." },
          { title: "Skills development", body: "What begins as play becomes practice for life." },
        ]}
      />

      {/* 9. FAQ */}
      <section className="bg-white px-6 md:px-[104px]" style={{ paddingTop: "144px", paddingBottom: "188px" }}>
        <div className="max-w-[1232px] mx-auto flex flex-col md:flex-row gap-16 md:gap-[120px]">
          <div className="md:max-w-[388px] md:w-[388px] shrink-0">
            <h4 className="font-body font-bold text-black leading-tight" style={{ fontSize: "clamp(1.5rem, 2.4vw, 32px)" }}>
              School questions
            </h4>
          </div>
          <div className="flex-1">
            <FAQAccordion items={schoolsFAQs} theme="light" />
          </div>
        </div>
      </section>

      {/* 10. Footer Banner */}
      <FooterBanner heading="Increase attendance and engagement in your school" />
      <Footer />
    </>
  );
}
