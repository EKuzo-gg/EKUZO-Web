import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Conquering my Mountain and Giants: How Esports Changed My Life — EKUZO Blog",
  description:
    "I struggled with anxiety, perfectionism, and near-failing grades. Then I found EKUZO — and a coach who taught me how to reframe everything.",
};

export default function PostJohnHay() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      <article className="bg-white relative overflow-hidden">
        {/* Decorative top-right brush */}
        <div className="absolute top-0 right-0 w-[400px] pointer-events-none" aria-hidden="true">
          <Image
            src="/images/blog-slug-right-deco.png"
            alt=""
            width={400}
            height={500}
            className="opacity-70"
          />
        </div>

        {/* ══ HEADER ════════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto relative"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            paddingTop: "188px",
            paddingBottom: "60px",
          }}
        >
          <div className="max-w-[720px]">
            <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase mb-4 block">
              Testimonials
            </span>
            <h1
              className="font-body font-bold text-black leading-tight mb-8"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              Conquering my Mountain and Giants: How Esports Changed My Life
            </h1>
          </div>
        </div>

        {/* ══ HERO IMAGE ════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto mb-20"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="relative w-full" style={{ height: "520px" }}>
            <Image
              src="/images/blog-post-2-featured.jpg"
              alt="John Hay — EKUZO esports coach"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* ══ BODY ══════════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto pb-32"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 lg:gap-16 items-start">
            {/* Left: byline */}
            <div className="lg:sticky lg:top-28 flex flex-col gap-1">
              <span className="font-body text-black/40 text-sm">Jan 14, 2026</span>
              <span className="font-body text-black/60 text-sm">
                by <strong className="text-black">John Hay</strong>
              </span>
            </div>

            {/* Right: post content */}
            <div
              className="font-body text-black/80 leading-relaxed flex flex-col gap-6"
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              <p>
                Hey everyone! My name is John, and I am an esports coach for EKUZO. For those of
                you unfamiliar with our program, we are an outsourced esports group that helps
                schools launch and operate their competitive gaming programs. I know that gaming
                often carries a negative stigma. It can be fairly lazy and unproductive. However, I
                believe gaming can build character, confidence, and connections. So let me share how
                esports has changed my life.
              </p>
              <p>
                At school, I was wrought with anxiety, hopelessness, and a pervading sense of
                worthlessness. My anxiety kept me from maintaining strong connections, and I
                wondered if I could ever amount to anything. I performed well in testing; projects
                could be good, but I had trouble turning anything in that didn&apos;t fit my
                standard. With me, it was either all or nothing.
              </p>
              <p>
                I remember Junior year when years of anxiety started to swell up, and truancy became
                an issue for me. My grades began to plummet to the point that my report card
                displayed a 0. I had always valued 90&apos;s in the past, the counselors told me
                that 70&apos;s were good, and I was later told, &ldquo;D is for diploma!&rdquo; But
                that 0 hit differently. I felt like a failure, and in my mind, this was the physical
                proof. It made me question everything, including my worth. I didn&apos;t interact
                with anyone, hardly ate, and slept to escape. My world was caving in.
              </p>
              <p>
                At that point, I tried out the private school arena utilizing a non-traditional
                learning style, and some things got better, but I remained stuck in a cycle of
                perfectionism, stress, and underperforming.
              </p>
              <p>
                And then I heard about this new opportunity. Our school was promoting new clubs, and
                one of them was EKUZO Esports. I recognized the student leader, Tori, as one of my
                history classmates, and the chance to play with a dedicated group immediately
                captivated me. Over the years, I had some online friends, but my anxiety gradually
                caused me to lose touch with them. I was hoping this time would be different.
              </p>
              <p>
                After some hesitation and some overthinking, I nervously sent him a message…. And I
                got in! In the weeks leading up to our first practice, I spent hours prepping like a
                madman. I had watched almost every introductory video under the sun in nervous
                anticipation of that first day, but when that day came, I found an overly welcoming
                environment eager to help me learn. I didn&apos;t know it yet, but Esports had just
                clicked.
              </p>
              <p>
                Of course, with any team, there were tournaments and challenges. We stomped our
                first one, but soon after came the losses and the close wins too. I still
                couldn&apos;t forgive myself for anything subpar, which in this case was any game
                short of a stomp or major comeback. Gaming actually has a term for this: tilt.
                It&apos;s intense emotions of frustration, and everyone has their moments.
              </p>
              <p>
                In my case, I was good at owning my mistakes but was so hard on myself for making
                them that it was difficult to move past them. That was until I had a fateful talk
                with our coach, Faith. He told me:
              </p>
              <blockquote className="border-l-4 border-red pl-6 py-2 my-2">
                <p
                  className="font-body text-black font-medium italic leading-relaxed"
                  style={{ fontSize: "clamp(1rem, 1.7vw, 24px)" }}
                >
                  &ldquo;Responsibility isn&apos;t just owning a mistake. It&apos;s taking the
                  steps to ensure it doesn&apos;t happen next time.&rdquo;
                </p>
                <cite className="font-body text-black/50 text-sm not-italic mt-3 block">
                  — Faith, EKUZO Founder &amp; Head Coach
                </cite>
              </blockquote>
              <p>
                That simple reframing was what I needed; something about the context of the game,
                and our coach made it click. I learned that mistakes are common and it is okay to
                make them but don&apos;t beat yourself up. Instead, focus on fixing those mistakes.
                Use them as a tool to become better.
              </p>
            </div>
          </div>
        </div>

        {/* ══ KEEP READING ══════════════════════════════════════════════════ */}
        <div
          className="border-t border-black/10 bg-grey py-20"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-8">
              Keep Reading
            </p>
            <Link
              href="/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng"
              className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start md:items-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src="/images/blog-post-1-card.jpg"
                  alt="Our Family's Esports Journey"
                  fill
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div>
                <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase block mb-2">
                  Case Studies
                </span>
                <h3 className="font-body font-bold text-black text-xl leading-snug group-hover:text-red transition-colors mb-2">
                  Our Family&apos;s Esports Journey with EKUZO and the K1ng
                </h3>
                <span className="font-body text-black/40 text-sm">by Lisa Holt</span>
              </div>
            </Link>
          </div>
        </div>
      </article>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
