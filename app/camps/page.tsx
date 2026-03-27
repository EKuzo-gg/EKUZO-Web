import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

// TODO: Build out full EKUZO CAMPS product page (Figma node 1:3693 "Games page - Web")

export const metadata = {
  title: "EKUZO Camps — Esports Camps for Young Gamers",
  description: "Join an EKUZO Camp — immersive esports experiences built around structured play and real competition.",
};

export default function CampsPage() {
  return (
    <>
      <section className="relative bg-red min-h-screen flex flex-col">
        <Nav variant="dark" />
        <div className="flex-1 flex flex-col items-start justify-center px-6 md:px-[104px] py-36">
          <p className="text-white/60 text-sm uppercase tracking-[0.1em] font-body mb-4">
            Program
          </p>
          <h1
            className="font-display font-black uppercase text-white tracking-[0.02em] leading-[0.8] mb-8"
            style={{ fontSize: "clamp(4rem, 12vw, 12rem)" }}
          >
            EKUZO Camps
          </h1>
          <p className="text-white/70 text-xl max-w-xl leading-relaxed mb-12">
            Immersive camp experiences where young gamers level up through
            structured play, coaching, and real competition.
          </p>
          <Button variant="white-filled" href="#enroll">
            Enroll my gamer
          </Button>
        </div>
      </section>

      {/* TODO: Add full page sections from Figma node 1:3693 */}

      <Footer />
    </>
  );
}
