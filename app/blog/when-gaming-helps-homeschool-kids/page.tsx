import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import InstagramEmbed from "@/components/blog/InstagramEmbed";
import GutCheckAside from "@/components/blog/GutCheckAside";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildVideoObjectSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const SLUG = "when-gaming-helps-homeschool-kids";
const COMPANION_SLUG = "what-homeschool-parents-taught-us-about-gaming";
const TITLE = "When gaming helps homeschool kids and when it hurts";
const DECK = "The difference is rarely the game. It’s what surrounds it.";
const DESCRIPTION =
  "Gaming can grow a homeschooled kid or shrink their world. What decides which, why structure beats hours, and how to tilt it your way.";
const HERO_IMAGE = "/images/blog-post-5-hero.jpg";
// Canonical share image — a 1200×630 crop of the hero. Feeds OG, Twitter,
// and the Article JSON-LD so every share surface uses one source of truth.
const SHARE_IMAGE = "/images/blog-post-5-card.jpg";
const DATE_PUBLISHED = "2026-05-21";
const DATE_MODIFIED = "2026-05-21";

// Spoken transcript of Karlin's reel (the embedded Instagram video). Inlined
// as a string literal — no fs access from public/ (see lib/schema.ts note and
// the repo Learning Log). Powers the VideoObject schema only (crawler-facing;
// deliberately not rendered on the page — keep the focus on the video).
const REEL_TRANSCRIPT =
  "But if you look here, I'm taking a lot less damage from the tower now, because I have a lot of armor. That doesn't mean the towers are physical and not magic. I always do deal with physical damage. Now, one more thing. Are you ready? Magic resist. These are also tank items, so surely it'll make me, you know, take a bunch of damage, right? For magic! Only magic. No physical damage. Well, aside from the extra HP you got. And this is so, so, so important because so many players, even after a year or two years of playing, they'll be against a team of full, you know, armor, like physical damage characters, and they'll be building magic resist, right? Players that have been playing the game for two years. And so for the kids to learn this at the very beginning, it's so, yeah, it's so good.";

export const metadata = {
  alternates: { canonical: `/blog/${SLUG}` },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    url: `https://ekuzo.gg/blog/${SLUG}`,
    siteName: "EKUZO",
    locale: "en_US",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Karlin Oei"],
    section: "Guides",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export default function PostWhenGamingHelpsHomeschoolKids() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE);
  const videoSchema = buildVideoObjectSchema({
    pageSlug: SLUG,
    name: "Karlin breaks down armor vs. magic resist in League of Legends",
    description:
      "EKUZO founder Karlin Oei coaches a real League of Legends concept — the difference between armor and magic resist — that players miss for years, and explains why kids benefit from learning it early.",
    thumbnailPath: "/images/blog-post-5-reel-thumb.jpg",
    uploadDate: DATE_PUBLISHED,
    embedUrl: "https://www.instagram.com/p/DYe0pwSC8j-/embed/",
    transcript: REEL_TRANSCRIPT,
  });

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={videoSchema} />

      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      <article className="bg-white relative overflow-hidden">
        {/* Decorative top-right brush */}
        <div
          className="absolute top-0 right-0 w-[400px] pointer-events-none"
          aria-hidden="true"
        >
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
          <div className="max-w-[820px]">
            <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase mb-4 block">
              Guides
            </span>
            <h1
              className="font-body font-bold text-black leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              {TITLE}
            </h1>
            <p
              className="font-body italic text-black/55"
              style={{ fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)" }}
            >
              {DECK}
            </p>
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
          <Image
            src={HERO_IMAGE}
            alt="A boy in a gaming headset at his desk at home, one hand on the mouse, giving a thumbs up to the camera."
            width={1915}
            height={821}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* ══ BODY ══════════════════════════════════════════════════════════ */}
        <div
          className="max-w-[1232px] mx-auto pb-32"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <BlogPostBody author="karlin-oei" date={DATE_PUBLISHED}>
              {/* Answer block — first paragraph after H1, no H2 above it.
                  Load-bearing for LLM citation. Do not wrap under a heading. */}
              <p>
                For a homeschooled kid, gaming can build focus, friendships, and
                a reason to get out of bed in the morning. It can also swallow
                the day and shrink the world down to a screen. The same game can
                do both, which makes this hard to think about clearly. What
                usually decides the direction is the environment around the
                game. Unsupervised, open-ended, isolated play can drift toward
                the spiral parents fear. Social, coached, goal-directed play
                with an adult nearby tends toward the growth they want. The
                number of hours matters, but it&apos;s not the first thing
                I&apos;d look at. I&apos;d look at what surrounds those hours.
                That&apos;s especially true in a homeschool, where gaming is
                often a kid&apos;s main social world and you, the parent, own
                the whole day. Here&apos;s how I&apos;d weigh the opportunity
                and the risk, and how to tilt your kid toward the better
                outcome.
              </p>

              <h2>Why does this hit homeschool families differently?</h2>
              <p>
                Every parent feels some version of this. Most of us put screen
                time near the top of the worry list, and plenty of us quietly
                wonder if we&apos;re getting it right. If that&apos;s you,
                you&apos;re not failing. You&apos;re carrying a piece most
                families quietly hand off to a school.
              </p>
              <p>
                For homeschool families the stakes sit a notch higher, because
                the default structure isn&apos;t there. A kid in school has a
                built-in peer group, six hours of routine, and a schedule that
                caps the day before a screen can. A homeschooled kid has none of
                that automatically. You build the day. So when gaming shows up,
                it often becomes the biggest block of free time and the main
                social channel at once.
              </p>
              <p>
                That&apos;s actually the strongest card homeschooling holds. You
                have more control over the environment around the game than any
                school ever will. Most parents just never get told that the
                environment is the lever.
              </p>
              <p>
                I recently read a long Facebook thread where homeschool parents
                were working through exactly this. What made it worth reading is
                that it wasn&apos;t polished. It was 200+ parents saying the
                quiet parts out loud. I broke down the whole conversation in{" "}
                <Link href={`/blog/${COMPANION_SLUG}`}>a companion piece</Link>.
                Here I want to use what they taught me to answer the question
                they were all circling.
              </p>

              <h2>Where&apos;s the real opportunity in gaming?</h2>
              <p>
                The opportunity is real, and I don&apos;t say that as a gamer
                making excuses for the hobby. Played with structure,{" "}
                <strong>
                  <em>
                    games are one of the few places a kid will voluntarily
                    practice hard things
                  </em>
                </strong>
                : reading a fast-moving situation, communicating under pressure,
                recovering from a loss and lining up to try again, working with
                other people toward a goal bigger than themselves.
              </p>
              <p>
                The parents who&apos;ve figured this out stopped trying to
                shrink the passion and started aiming it. In that thread, the
                families whose kids were thriving had them in coding classes,
                game-design courses, esports teams, and streaming with a
                purpose. One mom said her son &ldquo;wouldn&apos;t have gotten
                past his deep depression and anxiety&rdquo; without it, and that
                the game and the people in it taught him to communicate. Another
                said that once gaming became &ldquo;work,&rdquo; meaning it had
                a goal and a structure, the six-hour days fell off on their own.
              </p>
              <p>
                Homeschool families are well positioned to join that camp,
                because the day has room for it. A coding block at 10am is a
                normal Tuesday for you. It isn&apos;t for a school family.
              </p>

              <h2>What does the risk actually look like?</h2>
              <p>
                The risk is just as real, and the worried parents aren&apos;t
                wrong. I&apos;ve read <em>Glow Kids</em> by Nicholas Kardaras
                and <em>The Anxious Generation</em>{" "}by Jonathan Haidt, and
                the
                parents who cite them are pointing at something true.
                Open-ended, unsupervised gaming can pull a kid inward. In that
                same thread, parents described kids who only ate while gaming,
                who wouldn&apos;t shower, whose whole friend group lived inside a
                game they couldn&apos;t step away from.
              </p>
              <p>
                But the line that stuck with me came from a homeschool dad whose
                two boys game as their main social outlet. When other parents
                told him to just take it away, he wrote that taking it away
                &ldquo;without a solid alternative can lead to serious emotional
                distress, including depression.&rdquo;
              </p>
              <p>
                He&apos;s right, and it&apos;s the part both loud camps miss.
                For a lot of these kids, the game is where their friends
                actually are. Pulling it without a replacement does something
                bigger than cutting screen time. It takes the kid out of their
                whole peer group.
              </p>
              <p>
                When gaming goes sideways, I usually see the same pattern: no
                adult anywhere near it, no stable group of real people, no goal,
                and no off-ramp. That&apos;s the profile, and you&apos;ll notice
                the game itself isn&apos;t on the list.
              </p>
              <p>
                Game choice still belongs in the picture. We don&apos;t pretend
                every title is equal, and we don&apos;t coach shooters. The
                games worth building anything around reward teamwork, strategy,
                and creativity. You can hold that line at home as easily as we
                do.
              </p>

              <blockquote>
                <strong>
                  The same game can grow a kid or shrink their world. What
                  surrounds it usually decides which.
                </strong>
              </blockquote>

              <h2>So what actually decides it?</h2>
              <p>
                If the same game can go either way, what tips it? The research
                here is still early, but it points where a lot of parents
                already sense things land: the total hours matter less than the
                pattern, the people, and the structure around them.
              </p>
              <p>
                A 2025 study from Columbia and Weill Cornell found that
                addictive patterns of use predicted worse mental health in kids,
                while total screen time on its own{" "}
                <a
                  href="https://www.cuimc.columbia.edu/news/addictive-use-social-media-not-total-time-associated-youth-mental-health"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  did not
                </a>
                . When researchers look at what produces real growth in
                structured gaming programs, the gains trace back to a person
                more than a feature: a caring adult,{" "}
                <a
                  href="https://connectedlearning.uci.edu/wp-content/uploads/2022/09/Academic-and-Social-Emotional-Learning-in-High-School-Esports.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  the coach
                </a>
                .
              </p>
              <p>
                Six hours moving in five directions is just motion. Structure
                points that effort at something, and that&apos;s when it starts
                to add up. The people and the structure are the active
                ingredients. The game is what gets a kid in the door.
              </p>

              <h2>What can you do at home?</h2>
              <GutCheckAside />
              <p>A few moves do most of the work:</p>
              <ul>
                <li>
                  <strong>
                    Put an adult in the room, or on the voice channel.
                  </strong>{" "}
                  The risk concentrates in unsupervised play, and presence
                  changes how kids behave, even quiet presence.
                </li>
                <li>
                  <strong>Keep the same people over time.</strong>{" "}Showing
                  up repeatedly with the same group around a shared interest is
                  how
                  social development actually happens, and it&apos;s exactly
                  what a steady team is. It beats random matchmaking with
                  strangers, for friendship and for safety.
                </li>
                <li>
                  <strong>Give it a goal.</strong>{" "}Practicing toward
                  something,
                  a match, a project, a skill, is what turned &ldquo;six hours a
                  day&rdquo; into &ldquo;an hour with a point&rdquo; for several
                  parents I read.
                </li>
                <li>
                  <strong>Choose the games on purpose.</strong>{" "}Co-op,
                  strategy, and creative titles reward what you want to grow.
                  You
                  don&apos;t have to allow the ones that don&apos;t.
                </li>
                <li>
                  <strong>Talk about it after.</strong>{" "}&ldquo;What would
                  you do differently next game?&rdquo; is a better question than
                  &ldquo;how long were you on?&rdquo; The reflection is where a
                  loss becomes a lesson.
                </li>
              </ul>
              <p>
                That last one is small, and it&apos;s the one most parents skip.
              </p>

              <h2 className="clear-both">
                What this looked like in one real life
              </h2>
              <p>
                I&apos;m not making the structure argument from theory. I&apos;m
                the kid it happened to.
              </p>
              <p>
                School nearly lost me. I barely graduated, my grades were bad,
                and I was the definition of unmotivated. The one odd data point
                was a standardized test I landed in the top 1% on, which told
                everyone I was capable and made the rest of it more confusing. I
                got into college, but almost failed out.
              </p>
              <p>
                Then I found a League of Legends team, and that&apos;s what
                turned it around. For the first time, effort had a point and
                other people depended on it. Competitive play doesn&apos;t let
                you coast. A bad call loses your team the round in under a
                minute, with four teammates watching. You learn fast to eat the
                loss, drop the self-pity, and line up the next play. The
                pressure to get better came from the game itself, and from
                teammates who needed me to be good. That team paid for my
                college too: $80,000 in esports scholarships, the same way
                another kid earns one for football or track. The ability was
                there the whole time. It sat dormant until an environment gave
                it stakes and a team.
              </p>
              <p>
                I wasn&apos;t homeschooled. But I&apos;m exactly the kind of
                capable kid a one-size system loses, the kind a lot of you
                pulled out of school because you could see it happening in real
                time. The game opened the door. The team, the standard, and the
                people around it are what actually changed me.
              </p>

              <h2>So what does gaming done well look like?</h2>
              <p>
                Read those 200+ parents closely and you see what the fight is
                really about: structure, belonging, and what it takes for a kid
                to grow up. Almost all of them are describing the same missing
                thing without naming it. The dad I mentioned wanted a &ldquo;solid
                alternative&rdquo; and assumed none existed. The cut-it-off camp
                couldn&apos;t picture an option besides removing the console.
                The aim-it camp was stitching together coding classes and course
                listings because nothing coherent existed to point at.
              </p>
              <p>
                What they&apos;re all circling is structured, social, supervised
                gaming with adults who actually coach. A kid plays the game they
                already love, on a real team, with a coach who cares whether
                they&apos;re also reading books and resetting well after a tough
                loss. That&apos;s the version that grows a kid and calms the risk
                at the same time.
              </p>

              <InstagramEmbed
                url="https://www.instagram.com/p/DYe0pwSC8j-/"
                caption="Karlin breaks down armor vs. magic resist — a League of Legends concept many players miss for years, and why kids benefit from learning it early."
              />

              <p>
                That&apos;s{" "}
                <Link href="/methodology">what we built EKUZO to be</Link>:
                stable rosters, trained coaches, clear goals, moderated spaces,
                and a conversation after the match. You can build a version of
                that at your own kitchen table. We&apos;re one place that does
                it, if you want the help. If you&apos;d like to try it without a
                big commitment,{" "}
                <Link href="/programs/ekuzo100">EKUZO100</Link> is a one-month
                trial that puts your kid on a coached team for $100.
              </p>

              <h2>One honest caveat</h2>
              <p>
                I don&apos;t want to oversell structure. For some kids,
                especially when gaming has already tipped into something
                compulsive or is masking real distress, a break and a
                conversation with a professional come first, and structure comes
                after. If your kid has stopped eating, sleeping, or leaving
                their room, that&apos;s past the reach of a blog post. Structure
                helps most kids. It doesn&apos;t replace help when help is what
                is needed.
              </p>
              <p>
                For everyone else, the takeaway is simpler than the debate makes
                it sound. If you&apos;re trying to decide whether to restrict
                your kid&apos;s gaming, redirect it, or build something better
                around it, start with the environment. That&apos;s usually where
                the answer is.
              </p>
              <p>
                A game gave me a team, and the team gave me everything else.
                Most kids have that in them too. They just need an environment
                that calls it out.
              </p>

              <p className="italic">
                Want the full conversation those 200+ homeschool parents had,
                all three camps and the quotes on every side? I broke it down{" "}
                <Link href={`/blog/${COMPANION_SLUG}`}>here</Link>.
              </p>

              <h2>Sources and further reading</h2>
              <ul>
                <li>
                  Addictive use vs. total screen time:{" "}
                  <a
                    href="https://www.cuimc.columbia.edu/news/addictive-use-social-media-not-total-time-associated-youth-mental-health"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Columbia / Weill Cornell, 2025
                  </a>
                </li>
                <li>
                  The coach as the active ingredient in esports social-emotional
                  growth:{" "}
                  <a
                    href="https://connectedlearning.uci.edu/wp-content/uploads/2022/09/Academic-and-Social-Emotional-Learning-in-High-School-Esports.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Connected Learning Lab, UC Irvine
                  </a>
                </li>
                <li>
                  Team chemistry over star power:{" "}
                  <a
                    href="https://doi.org/10.1007/s12144-024-05858-0"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Gisbert-Pérez et al., <em>Current Psychology</em>, 2024
                  </a>
                </li>
                <li>
                  Structure and social support in competitive players:{" "}
                  <a
                    href="https://doi.org/10.3389/fpsyg.2021.722030"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trotter et al., <em>Frontiers in Psychology</em>, 2021
                  </a>
                </li>
                <li>
                  Online and offline friendships overlap and reinforce each
                  other:{" "}
                  <a
                    href="https://www.frontiersin.org/journals/developmental-psychology/articles/10.3389/fdpys.2024.1419756/full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Frontiers in Developmental Psychology, 2024
                  </a>
                </li>
                <li>
                  Adult-relationship growth in coached programs (12.2% to 23.5%
                  in one year):{" "}
                  <a
                    href="https://connectedlearning.uci.edu/wp-content/uploads/2022/09/2021-Y4-Student-Outcomes-and-Attitudes-Report.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NASEF / UC Irvine
                  </a>
                </li>
                <li>
                  Most parents prioritize managing screen time:{" "}
                  <a
                    href="https://www.pewresearch.org/internet/2025/10/08/how-parents-manage-screen-time-for-kids/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pew Research, 2025
                  </a>
                </li>
              </ul>

              <p className="italic">
                Karlin Oei is the founder of <Link href="/">EKUZO</Link>. He
                grew up playing League of Legends, paid for college through
                esports scholarships, and now builds the coaching system he
                wishes he&apos;d had as a kid.
              </p>
          </BlogPostBody>
        </div>
      </article>

      {/* ══ KEEP READING ══════════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section
          className="bg-[#f0edea] relative overflow-clip"
          style={{
            paddingTop: "clamp(80px, 10vw, 144px)",
            paddingBottom: "clamp(80px, 10vw, 144px)",
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
          }}
        >
          <div className="max-w-[1232px] mx-auto">
            <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-8">
              Keep Reading
            </p>
            <Link
              href={`/blog/${COMPANION_SLUG}`}
              className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start md:items-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src="/images/blog-post-6-card.jpg"
                  alt="What 200+ homeschool parents taught us about gaming"
                  fill
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div>
                <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase block mb-2">
                  Case Studies
                </span>
                <h3 className="font-body font-bold text-black text-xl leading-snug group-hover:text-red transition-colors mb-2">
                  What 200+ homeschool parents taught us about gaming
                </h3>
                <span className="font-body text-black/40 text-sm">
                  by Karlin Oei
                </span>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
