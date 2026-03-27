import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

// TODO: Build out full EKUZO TEAMS product page (Figma node 1:7904)

export const metadata = {
  title: "EKUZO Teams — Structured Esports Programs",
  description:
    "EKUZO Teams brings structured esports coaching to schools and homes. Enroll your gamer today.",
};

export default function TeamsPage() {
  return (
    <>
      <section className="relative bg-black min-h-screen flex flex-col">
        <Nav variant="dark" />
        <div className="flex-1 flex flex-col items-start justify-center px-6 md:px-[104px] py-36">
          <p className="text-grey text-sm uppercase tracking-[0.1em] font-body mb-4">
            Program
          </p>
          <h1
            className="font-display font-black uppercase text-white tracking-[0.02em] leading-[0.8] mb-8"
            style={{ fontSize: "clamp(4rem, 12vw, 12rem)" }}
          >
            EKUZO Teams
          </h1>
          <p className="text-white/60 text-xl max-w-xl leading-relaxed mb-12">
            Structured practice, skilled coaching, and real competition —
            for school programmes and home players alike.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="white-filled" href="#enroll">
              Enroll my gamer
            </Button>
            <Button variant="white-outlined" href="#contact">
              Start a conversation
            </Button>
          </div>
        </div>
      </section>

      {/* TODO: Add full page sections from Figma node 1:7904 */}

      <Footer />
    </>
  );
}
