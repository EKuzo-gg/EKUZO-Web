import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FooterBanner from "@/components/sections/FooterBanner";
import EcosystemAnimation from "@/components/sections/EcosystemAnimation";
import OurApproachSection from "@/components/sections/OurApproachSection";
import ProgramsSection from "@/components/sections/ProgramsSection";
import AutoScrollCards from "@/components/ui/AutoScrollCards";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import Eyebrow from "@/components/ui/Eyebrow";
import CircleIcon from "@/components/ui/CircleIcon";
import ModalButton from "@/components/ui/ModalButton";

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
      {/* ══ 1. HERO — white bg ══════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <section
          className="bg-white relative overflow-clip"
          style={{
            paddingTop: "clamp(160px, 18vw, 240px)",
            paddingBottom: "clamp(200px, 28vw, 360px)",
          }}
        >
          {/* Nav */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <Nav variant="light-red" />
          </div>

          <div
            className="max-w-[1232px] mx-auto relative z-10"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            <h1
              className="font-display uppercase text-black leading-[0.85] text-center md:text-left"
              style={{ fontSize: "clamp(100px, 18vw, 256px)" }}
            >
              ESPORTS THAT BELONG IN
              <br />
              <span className="hidden md:inline-block" style={{ paddingLeft: "clamp(100px, 30vw, 500px)" }}>SCHOOLS</span>
              <span className="md:hidden">SCHOOLS</span>
            </h1>
          </div>

          {/* Left character */}
          <div
            className="absolute z-20 bottom-0 left-1/2 -translate-x-[65%] md:left-[18%] md:-translate-x-1/2 md:translate-y-0"
          >
            <Image
              src="/images/schools-hero-left.png"
              alt=""
              width={545}
              height={732}
              aria-hidden="true"
              className="object-contain max-h-[50vh] md:max-h-none w-auto"
            />
          </div>

          {/* Right graphic */}
          <div
            className="absolute z-20 bottom-0 right-0 translate-y-[10%] md:bottom-auto md:top-[34%] md:-translate-y-1/2 md:translate-x-0"
          >
            <Image
              src="/images/schools-hero-right.png"
              alt=""
              width={512}
              height={494}
              aria-hidden="true"
              className="object-contain max-h-[35vh] md:max-h-none w-auto"
            />
          </div>
        </section>
        {/* White torn paper at bottom — outside overflow-clip */}
        <TornPaperDivider color="white" variant="bottom" style={1} />
      </div>

      {/* ══ 2. OUR APPROACH — grey bg ════════════════════════════════════════ */}
      <OurApproachSection
        heading="What is EKUZO?"
        listItems={[
          "Structured practice",
          "Skilled coaching",
          "Growth through play",
        ]}
        icons={[
          "/icons/swords-white.svg",
          "/icons/clock-white.svg",
          "/icons/growth-arrows.svg",
        ]}
        body="Gaming is one of the most powerful motivators young people have — across backgrounds, interests, and ability levels. EKUZO turns that motivation into structured growth through coaching, teamwork, and shared expectations. Students don&rsquo;t just play. They practice, communicate, lead, and&nbsp;reflect. This isn&rsquo;t about fixing kids. It&rsquo;s about building the structure most of them are&nbsp;missing."
        bg="bg-[#f0edea]"
        tornPaper="none"
      />

      {/* ══ 3. ECOSYSTEM ANIMATION ═══════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section className="relative bg-grey overflow-clip" style={{ height: "360vh" }}>
          <div className="sticky top-0 h-screen">
            <EcosystemAnimation />
          </div>
        </section>
        <TornPaperDivider color="grey" variant="bottom" style={1} />
      </div>

      {/* ══ 4. WHY SCHOOLS CHOOSE EKUZO — grey bg with zigzag cards ═════════ */}
      <section
        className="bg-[#f0edea] relative overflow-clip"
        style={{
          paddingTop: "clamp(80px, 14vw, 144px)",
          paddingBottom: "clamp(120px, 18vw, 240px)",
        }}
      >
        {/* Full decorative background image behind the cards */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: "url(/images/card-background@2x.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div
          className="max-w-[1232px] mx-auto relative z-10"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Large card with HOW IT WORKS eyebrow inside */}
          <div
            className="bg-white mb-8"
            style={{
              borderRadius: "2px",
              padding: "clamp(2rem, 5vw, 64px)",
            }}
          >
            <div className="mb-4">
              <Eyebrow>HOW IT WORKS</Eyebrow>
            </div>
            <h4
              className="font-body font-bold text-black leading-[1] mb-6"
              style={{
                fontSize: "clamp(2rem, 4vw, 64px)",
                letterSpacing: "-1.28px",
              }}
            >
              Why schools choose EKUZO?
            </h4>
            <p
              className="font-body text-black/70 leading-[1.357]"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              Schools don&apos;t choose EKUZO because they want esports. They
              choose it because they&apos;re facing real student challenges and
              need a solution that fits inside academic priorities, staffing
              limits, and community expectations. EKUZO is designed to help
              schools act thoughtfully, without taking on unnecessary risk,
              burden, or&nbsp;distraction.
            </p>
          </div>

          {/* Feature cards — zigzag with grey circle + grayscale icons */}
          <div className="flex flex-col gap-8">
            {[
              {
                title: "Hard problems, not bad students",
                body: "Disengagement and anxiety are systemic challenges, not discipline issues.",
                icon: "/icons/hard-problem.svg",
              },
              {
                title: "Built to run, not to improvise",
                body: "Coaching, curriculum, competition, and safety are designed to work together.",
                icon: "/icons/run-first.svg",
              },
              {
                title: "Easy to implement",
                body: "Clear roles, predictable structure, and external coaches reduce lift for school staff.",
                icon: "/icons/easy.svg",
              },
              {
                title: "Youth development first",
                body: "Gaming is the medium; growth, skills, and belonging are the goals.",
                icon: "/icons/youth.svg",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`flex ${i % 2 === 0 ? "lg:justify-end" : "lg:justify-start"}`}
              >
                <div
                  className="bg-white w-full lg:w-[560px]"
                  style={{
                    borderRadius: "2px",
                    padding: "clamp(1.5rem, 4vw, 48px)",
                  }}
                >
                  <CircleIcon src={feature.icon} className="mb-5" />
                  <h5
                    className="font-body font-bold text-black leading-[1.2] mb-4"
                    style={{ fontSize: "clamp(1.5rem, 2.8vw, 40px)" }}
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

      {/* ══ 5. PROGRAMS — EKUZOTEAMS only ═══════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="white" variant="top" style={1} />
      </div>
      <ProgramsSection showTeams showEkuzo100={false} showCamps={false} />

      {/* ══ 6. OUTCOMES — black bg, auto-scroll cards ═══════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <div
          className="bg-black"
          style={{
            paddingTop: "clamp(80px, 14vw, 188px)",
            paddingBottom: "clamp(80px, 14vw, 188px)",
          }}
        >
          <div
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            {/* Header — centered */}
            <div className="flex flex-col gap-4 mb-12 items-center text-center">
              <Eyebrow>PROGRAMS</Eyebrow>
              <h4
                className="font-body font-bold leading-[1] text-white"
                style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
              >
                What Schools See in their&nbsp;Students
              </h4>
            </div>

            {/* Cards — auto-scrolling */}
            <AutoScrollCards
              cardBg="white"
              speed={30}
              cards={[
                { title: "Attendance", body: "Students show up more consistently when they belong to a team with shared goals.", icon: "/icons/calendar.svg" },
                { title: "Engagement", body: "Motivation earned in practice carries into class, behavior, and daily energy.", icon: "/icons/flame.svg" },
                { title: "Belonging", body: "Students who didn\u2019t connect elsewhere find a place to contribute and be seen.", icon: "/icons/heart.svg" },
                { title: "Skills", body: "Communication, leadership, and digital skills develop through coached team play.", icon: "/icons/skills.svg" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ══ 7. TESTIMONIAL QUOTE — red bg ═══════════════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="red" variant="top" style={1} />
        <div
          className="bg-red"
          style={{
            paddingTop: "clamp(80px, 14vw, 144px)",
            paddingBottom: "clamp(80px, 14vw, 144px)",
          }}
        >
          <div
            className="max-w-[880px] mx-auto text-center relative z-10"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            <Image
              src="/images/quote-white@2x.png"
              alt=""
              width={40}
              height={40}
              className="mx-auto mb-8"
              aria-hidden="true"
            />
            <h5
              className="font-body font-bold text-white leading-[1.2] mb-10"
              style={{ fontSize: "clamp(1.25rem, 2.8vw, 40px)" }}
            >
              &ldquo;Once students see what they&apos;re capable of, you
              don&apos;t have to push them. They push&nbsp;themselves.&rdquo;
            </h5>
            <p
              className="font-body font-bold text-white"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              Karlin Oei
            </p>
            <p
              className="font-body font-bold text-white/60"
              style={{ fontSize: "clamp(1.125rem, 2vw, 28px)" }}
            >
              Founder EKUZO
            </p>
          </div>
        </div>
        <TornPaperDivider color="red" variant="bottom" style={1} />
      </section>

      {/* ══ 8. PEDAGOGY — white bg, auto-scroll cards ═══════════════════════ */}
      <section
        className="bg-white relative"
        style={{
          paddingTop: "clamp(80px, 14vw, 188px)",
          paddingBottom: "clamp(80px, 14vw, 188px)",
        }}
      >
        <div
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          {/* Header — centered */}
          <div className="flex flex-col gap-4 mb-12 items-center text-center">
            <h4
              className="font-body font-bold leading-[1] text-black"
              style={{ fontSize: "clamp(2rem, 4vw, 64px)", letterSpacing: "-1.28px" }}
            >
              The pedagogy behind the&nbsp;program
            </h4>
            <p
              className="font-body leading-[1.417] mt-2 text-black/70 max-w-[600px]"
              style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
            >
              EKUZO is built on proven learning principles, applied inside a structure students already care&nbsp;about.
            </p>
          </div>

          {/* Cards — auto-scrolling */}
          <AutoScrollCards
            cardBg="#EFEEEF"
            speed={30}
            cards={[
              { title: "Motivation", body: "Visible wins build intrinsic drive, turning effort into enthusiasm.", icon: "/icons/enthusiasm.svg" },
              { title: "Feedback loops", body: "Every class follows a rhythm of show up, learn, grow and reflect.", icon: "/icons/chat.svg" },
              { title: "Social learning", body: "Students collaborate, communicate, and lead in authentic, high-pressure situations.", icon: "/icons/team.svg" },
              { title: "Skills development", body: "What begins as play becomes practice for life.", icon: "/icons/skills.svg" },
            ]}
          />

          {/* CTA button */}
          <div className="mt-12 text-center">
            <a
              href="/methodology"
              className="inline-block border-2 border-red text-red font-body font-bold px-8 py-4 rounded-sm hover:brightness-110 active:scale-[0.97] active:brightness-90 transition-all duration-150"
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              Learn about Pedagogy
            </a>
          </div>
        </div>
      </section>

      {/* ══ 9. FAQ — black bg, dark theme ════════════════════════════════════ */}
      <section className="relative overflow-visible">
        <TornPaperDivider color="black" variant="top" style={1} />
        <div
          className="bg-black"
          style={{
            paddingTop: "clamp(80px, 14vw, 188px)",
            paddingBottom: "clamp(80px, 14vw, 188px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-[120px]">
            <div className="lg:max-w-[388px] lg:w-[388px] shrink-0">
              <div className="mb-4">
                <Eyebrow>FAQ</Eyebrow>
              </div>
              <h4
                className="font-body font-bold text-white leading-[1]"
                style={{
                  fontSize: "clamp(2rem, 4vw, 64px)",
                  letterSpacing: "-1.28px",
                }}
              >
                Frequently asked questions
              </h4>
            </div>
            <div className="flex-1">
              <FAQAccordion items={schoolsFAQs} theme="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 10. FOOTER BANNER & FOOTER ══════════════════════════════════════ */}
      <FooterBanner heading="Increase attendance and engagement in your school" image="/images/coach-collage@2x.png" />
      <Footer />

      {/* ══ FIXED SCROLL BUTTON (Mobile CTA) ════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-red border-t border-red/50 px-4 py-3 flex gap-2 z-40 safe-area-inset-bottom">
        <ModalButton modal="enroll" variant="white-filled" className="flex-1">
          Enroll my gamer
        </ModalButton>
        <ModalButton modal="contact" variant="white-outlined" className="flex-1">
          Start a conversation
        </ModalButton>
      </div>
      <div className="md:hidden h-20" />
    </>
  );
}
