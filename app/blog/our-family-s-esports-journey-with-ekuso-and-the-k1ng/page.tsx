import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Our Family's Esports Journey with EKUZO and the K1ng — EKUZO Blog",
  description:
    "My son Ryan was always a happy kid in his early years. Then junior high happened — and everything changed. This is how EKUZO gave him back his confidence.",
};

export default function PostK1ng() {
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
              Case Studies
            </span>
            <h1
              className="font-body font-bold text-black leading-tight mb-8"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              Our Family&apos;s Esports Journey with EKUZO and the K1ng
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
              src="/images/blog-post-1-card.jpg"
              alt="Ryan — K1ngofbattle — at an EKUZO esports event"
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
                by <strong className="text-black">Lisa Holt</strong>
              </span>
            </div>

            {/* Right: post content */}
            <div
              className="font-body text-black/80 leading-relaxed flex flex-col gap-6"
              style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}
            >
              <p>
                My son Ryan was always a happy kid in his early years. He could easily make friends,
                he enjoyed going to school, and he was the kid who could make the best out of a bad
                situation. This was true up until he went to junior high school in the sixth grade
                where, on day one, he was bullied. The bullying kept cropping up that first
                semester, and it eventually wore him down. He was no longer the upbeat boy who was
                happy to go to school. He started having severe anxiety about going to school. He
                started asking us if he could stay home from school quite often, complaining that he
                was not feeling well, which was something he had never done before.
              </p>
              <p>
                We knew we had to do something to help him out since we had exhausted our efforts at
                that school. During the winter break, we found a new school for him, got him
                enrolled, and never looked back. It is one of the best things we have ever done for
                him.
              </p>
              <p>
                Unfortunately, COVID hit two months after he started at his new school. The
                transition to virtual learning was just fine for Ryan. He did very well
                academically, and at the end of that school year, he managed to earn several of the
                awards given out at the school. Then in the summer of the same year, the head of his
                new school sent out an email introducing us to EKUZO Esports. The school was
                interested in forming an esports team.
              </p>
              <p>
                Ryan had never heard of esports, and neither had I. My husband knew a little bit
                about it, but for the most part we were very new to it. Ryan and our other two
                children were no strangers to video games, but they had never played anything like
                League of Legends, the game EKUZO was going to focus on. I was intrigued after
                reading that email since it provided many details about esports. Ryan had a lot of
                experience playing different sports like t-ball, soccer, and basketball. It sounded
                to me that esports, besides the obvious difference being they would be playing the
                game on a computer, might not be all that different. Ryan was all for it, so we
                signed him up. We had no idea what a blessing in disguise it would be for him.
              </p>
              <p>
                In his first semester with EKUZO, Ryan ended up being the only student from his
                school to join. So, his school didn&apos;t have a team yet, but it was still a
                great opportunity for him. Obviously, since this all began during the pandemic, the
                classes, practices, games, and tournaments were all online. As a 12-year-old at the
                time, Ryan was one of the youngest students on the team. I remember his coach,
                Faith, would send us emails about his observations regarding how Ryan was progressing
                that semester. It was quite impressive to read how Ryan was so involved and engaged
                in every class.
              </p>
              <p>
                League of Legends was new for Ryan, but apparently, he learned how to play it very
                well pretty quickly and developed great intuition for the game. To date, he has
                always been a very strong player in EKUZO. His in-game name is K1ngofbattle, or K1ng
                for short. He quickly stepped into a leadership role during his first year playing,
                something we had never seen Ryan do with such confidence in the past in any other
                sport. Even though he was a younger player, his teammates still chose him to lead
                the team during tournaments. He gained the respect of his coach and teammates early
                on.
              </p>
              <p>
                By the second semester of school that year, more students from Ryan&apos;s school
                joined EKUZO and they were able to form a proper team. This year is the
                school&apos;s third year with EKUZO and they still have a team. The kids work so
                well together. It&apos;s fun for parents to watch them in tournaments because they
                have so much fun. Anyone can see that EKUZO provides a safe and inclusive place for
                all of the kids. They are all so comfortable with each other no matter which school
                they come from. There is such camaraderie amongst all the teams, which is such a
                beautiful thing to witness.
              </p>
              <p>
                Being part of EKUZO and part of an esports team has been nothing short of amazing
                for Ryan. Esports works like any other sport you can think of. You have a team that
                you must learn to work and play a game with. The team plays against other teams in
                the league. They practice regularly, attend and play in tournaments, and then they
                review their games to help them figure out how to improve. It&apos;s a game that can
                put players into some high stress situations, so they must be able to remain calm,
                think, and strategize quickly. Ryan thrived and continues to thrive on all of it. He
                enjoys hyping up and leading his team and makes sure to praise his teammates
                regularly.
              </p>
              <p>
                We can hear him when he plays, and it&apos;s a wonderful thing. He is quite good
                when he leads and always does his best to be a team player. As his parents, we are
                so proud when we hear his teammates speak so highly of him. He is well-respected by
                everyone. It&apos;s also cool to hear shout casters during tournaments talking about
                K1ngofbattle since he tends to make some great plays throughout the games.
              </p>
              <p>
                Of course, none of this would be possible without the founder of EKUZO, Faith, who
                in my eyes is the best mentor and coach Ryan has ever had. I don&apos;t think there
                is anyone who has ever helped Ryan grow, not just in esports, but in so many other
                ways. Faith helped Ryan gain more confidence in himself and helped him become the
                leader he is today. Faith has a knack for being able to articulate things to his
                students like how to deal with frustrations that can surface while playing the game
                and how to deal with losses in a positive way.
              </p>
              <p>
                Faith has also been instrumental in helping make sure the kids do not think
                it&apos;s okay to just play video games all the time. He teaches them the importance
                of school and keeping up their grades. Esports is great and fun, but there is no
                guarantee, as with any sport, that you will be able to go pro one day. The stats on
                players going pro in esports are the same as with any professional sport. So, Faith
                makes sure the kids understand that they still need to focus on other interests for
                their future. I can only hope that Ryan will always be connected to Faith in some
                way. We see what a great mentor he has been to Ryan.
              </p>
              <p>
                Esports came into Ryan&apos;s life at just the right time. I truly believe that.
                Gaining confidence brought out the old Ryan, and we were so thrilled to see that,
                especially after the bullying he experienced. Being a part of EKUZO seemed to bring
                Ryan a new purpose and it continues to teach him about leadership and positivity.
                That is invaluable, and we will always be so grateful to EKUZO for this journey we
                chose and continue to be on with our K1NG, Ryan.
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
              href="/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life"
              className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start md:items-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src="/images/blog-post-2-card.jpg"
                  alt="Conquering my Mountain and Giants"
                  fill
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div>
                <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase block mb-2">
                  Testimonials
                </span>
                <h3 className="font-body font-bold text-black text-xl leading-snug group-hover:text-red transition-colors mb-2">
                  Conquering my Mountain and Giants: How Esports Changed My Life
                </h3>
                <span className="font-body text-black/40 text-sm">by John Hay</span>
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
