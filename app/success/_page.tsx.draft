import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "You're in — EKUZO",
  description: "Your enrolment is confirmed. Welcome to EKUZO.",
};

export default function SuccessPage() {
  return (
    <>
      <Nav variant="dark" />
      <section className="bg-red min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12 md:py-36">
          <h1
            className="font-display font-black uppercase text-white tracking-[0.02em] leading-[0.8] mb-6 md:mb-8"
            style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}
          >
            You&apos;re In
          </h1>
          <p className="text-white/80 text-base md:text-xl max-w-md leading-relaxed mb-10 md:mb-12">
            Your enrollment is confirmed. Check your email for next steps — we can't wait to welcome your gamer to the team.
          </p>
          <Button variant="white-filled" href="/">
            Back to Home
          </Button>
        </div>
      </section>
      <Footer />
    </>
  );
}
