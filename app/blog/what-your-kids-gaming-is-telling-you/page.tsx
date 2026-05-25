import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogContent from "@/components/blog/BlogContent";
import InstagramEmbed from "@/components/blog/InstagramEmbed";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildVideoObjectSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const SLUG = "what-your-kids-gaming-is-telling-you";
const TITLE_DISPLAY = "What your kid's gaming is telling you";
// Layout in app/layout.tsx applies the template "%s | EKUZO" — do not
// suffix the brand here or the tab title double-stamps.
const TITLE_SEO = "What your kid's gaming is telling you";
const SUBHEAD = "The game is visible. The meaning is hidden.";
const DESCRIPTION =
  "How to read what your kid's gaming might actually be telling you. Six things to watch for, and what each one often means.";
const HERO_IMAGE = "/images/what-your-kids-gaming-is-telling-you-hero.jpg";
const SHARE_IMAGE = "/images/what-your-kids-gaming-is-telling-you-card.jpg";
const DATE_PUBLISHED = "2026-05-24";
const DATE_MODIFIED = "2026-05-24";

// Spoken transcript of Karlin's "DAY 4" founder reel. Inlined as a string
// literal — no fs access (see lib/schema.ts note). Spoken audio only; the
// written IG caption and internal voice notes from the source file are
// excluded.
const REEL_TRANSCRIPT =
  "I was a top-ranked gamer with childhood trauma, so today is day four of fixing that for the next generation. Growing up, I struggled immensely with social anxiety, low self-esteem, school, and I had a really poor relationship with my parents. It felt like I was forced to learn about things that I didn't care about when all I really wanted to do was play video games. In fact, my absolute best memory as a kid was playing ranked with my friends, playing in tournaments after school, and calling people trash over the internet. So in college, I stumbled my way into esports, basically competitive video games, and won over $80,000 in esports scholarships. My relationship with my mom has never been better. I'm finally proud of the person I'm becoming, and I started a company to help kids like me. 12-year-old me didn't know what it meant to be on a team, with structure, routine, and intentionality. And even 18-year-old me only began to sort of understand that gaming can teach some of life's most important lessons, like ownership, accountability, and leadership. And so, gaming is more than just fun to you. If it's learning, if it's creativity, community, connection, please share your story below. The world needs to hear it.";

export const metadata = {
  alternates: { canonical: `/blog/${SLUG}` },
  title: TITLE_SEO,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE_SEO,
    description: DESCRIPTION,
    type: "article",
    url: `https://ekuzo.gg/blog/${SLUG}`,
    siteName: "EKUZO",
    locale: "en_US",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1232,
        height: 770,
        alt: "A kid seen from behind at a desk, hands on their head after a loss on screen, in a warmly lit room.",
      },
    ],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Karlin"],
    section: "Perspective",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_SEO,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function PostGamingHiddenMeaning() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE_DISPLAY);
  const videoSchema = buildVideoObjectSchema({
    pageSlug: SLUG,
    name: "DAY 4 — Karlin on why he started EKUZO",
    description:
      "EKUZO founder Karlin Oei on growing up with social anxiety and low self-esteem, finding competitive esports in college that paid over $80,000 in scholarships, and starting EKUZO to give kids the team and structure he didn't have.",
    thumbnailPath: SHARE_IMAGE,
    uploadDate: "2026-05-18",
    embedUrl: "https://www.instagram.com/p/DYcuA4jBDl3/embed/",
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
              Perspective
            </span>
            <h1
              className="font-body font-bold text-black leading-tight mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              {TITLE_DISPLAY}
            </h1>
            <p
              className="font-body text-black/60 italic leading-snug"
              style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.375rem)" }}
            >
              {SUBHEAD}
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
          <div className="relative w-full" style={{ height: "520px" }}>
            <Image
              src={HERO_IMAGE}
              alt="A kid seen from behind at a desk, hands on their head after a loss on screen, in a warmly lit room."
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
              <span className="font-body text-black/40 text-sm">
                Published May 24, 2026
              </span>
              <span className="font-body text-black/60 text-sm">
                by <strong className="text-black">Karlin</strong>
              </span>
              <span className="font-body text-black/40 text-xs mt-1">
                Founder of EKUZO
              </span>
            </div>

            {/* Right: post content */}
            <BlogContent>
              <p>
                Some kids are loud about gaming. They narrate every match at
                dinner, beg for the new skin, wear the merch to school. You
                always know where you stand with that kid.
              </p>
              <p>
                This is about the other kind. The kid who plays just as much
                and says almost nothing about it. Who gets quiet, or a little
                embarrassed, when you ask. Who only lights up when someone
                finally asks the right question.
              </p>
              <p>
                That gap is more common than it looks. About 85% of teens play
                video games, but only around 4 in 10 would call themselves a
                &ldquo;gamer&rdquo; (
                <a
                  href="https://www.pewresearch.org/internet/2024/05/09/teens-and-video-games-today/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pew, 2024
                </a>
                ). A lot of kids play seriously and still won&apos;t claim the
                word. The playing is visible. Whether it matters to them is
                the part they keep quiet.
              </p>
              <p>
                Most of the worry about kids and gaming is about volume. How
                many hours, how late, how to claw some of it back. That&apos;s
                a fair question, but we like to ask what role the game is
                playing. What it&apos;s giving them, what might it be standing
                in for. By the time gaming is causing friction at home, the
                game has usually started doing real emotional work in a
                kid&apos;s life, and the hours are downstream of that.
              </p>
              <p>
                So before you decide what to do about the gaming, it&apos;s
                worth learning how to read it.
              </p>

              <h2>The hard parts you notice first</h2>
              <p>
                Parents tend to see the rough edges before anything else. The
                meltdown after a loss. The hours that produce nothing they can
                describe. The fight about getting off. The friends you&apos;ve
                never met. The way they won&apos;t admit how much it matters.
                The frustration of being good and stuck.
              </p>
              <p>
                Read one way, each of those is a problem. Read another way,
                each is a clue about what the game is doing for them. Same
                behaviors, two very different stories.
              </p>
              <p>Here&apos;s how we read them.</p>

              <h2>They get more upset than the moment seems to deserve</h2>
              <p>
                You hear it through the door. A loss, and then a reaction that
                sounds way bigger than a game. A crashout, if you&apos;ve
                heard your kid use the word. Slamming the desk. Snapping at
                teammates. Or a silence that worries you more than yelling
                would.
              </p>
              <p>
                The easy read is that the game is making them angry. Sometimes
                that&apos;s true. More often, the size of the reaction tells
                you the size of what&apos;s riding on it. Somewhere in that
                game they may have found status, competence, belonging, or a
                sense of control, and a loss threatens the place where they
                feel good at something. Researchers have described a version
                of this loop too: kids who feel anxious or low on confidence
                may reach for screens to cope, and that can make the game
                carry even more weight (
                <a
                  href="https://www.apa.org/news/press-releases/2025/06/screen-time-problems-children"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  APA, 2025
                </a>
                ).
              </p>
              <p>
                So the useful question isn&apos;t &ldquo;why do they care so
                much.&rdquo; It&apos;s &ldquo;what are they carrying into the
                match.&rdquo; Then watch what happens after the loss. Can they
                recover? Can they name one thing that went wrong? Do they
                blame everyone else, or come back a little calmer?
                That&apos;s the signal worth reading.
              </p>

              <h2>
                They play for hours but can&apos;t tell you what they&apos;re
                working on
              </h2>
              <p>
                You ask what they&apos;ve been doing in there and you get a
                shrug. 5 hours, and they can&apos;t name one thing they were
                trying to get better at.
              </p>
              <p>
                It&apos;s easy to file that under laziness. But moving fast
                and getting somewhere aren&apos;t the same thing, and from
                the outside they look identical. A kid grinding for hours has
                the willpower. What they&apos;re missing is anyone who&apos;s
                shown them there&apos;s a way to practice at all. The
                effort&apos;s there; it just has nothing to point at.
              </p>
              <p>
                Watch for whether the interest is in there when you ask the
                right question. Is there anything they&apos;re curious about
                getting better at, even something small? A kid reaching for
                improvement with no map will look aimless until the moment
                someone hands them one. The tell is whether the curiosity
                shows up at all.
              </p>

              <h2>Logging off turns into a fight</h2>
              <p>
                I want to be careful here, because sometimes the fight over
                logging off is exactly what it looks like. Impulse, habit, a
                brain that wants the next match. That&apos;s real and worth
                taking seriously on its own terms. (It&apos;s worth knowing
                that{" "}
                <a
                  href="https://www.cuimc.columbia.edu/news/addictive-use-social-media-not-total-time-associated-youth-mental-health"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  the researchers who study problem gaming point to the
                  pattern
                </a>
                , the conflict, the withdrawal, the loss of other interests,
                more than to the raw hour count. The clock isn&apos;t the
                whole story.)
              </p>
              <p>
                Other times, the game was the one place all day that felt
                active, social, and like it was going somewhere. Leaving it
                lands like being pulled out of the only room where something
                was happening. Both can be true in the same kid on different
                nights.
              </p>
              <p>
                Watch the shape of the resistance. Is this a kid who
                can&apos;t stop anything, or a kid who&apos;s fine putting
                most things down but goes to war over this one? The first
                points toward impulse. The second usually points toward
                meaning. Telling them apart matters more than winning the
                argument over the clock.
              </p>

              <h2>They&apos;re social in the game and disconnected outside it</h2>
              <p>
                They&apos;re laughing with people you&apos;ve never met, mic
                on, fully alive in a voice call. Then they come downstairs
                and barely talk.
              </p>
              <p>
                It&apos;s hard to trust a social world you can&apos;t see,
                especially when all you hear are voices coming through a
                headset. But the connection is usually real.{" "}
                <a
                  href="https://www.pewresearch.org/internet/2024/05/09/teens-and-video-games-today/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  The large majority of teen gamers play with others, and
                  close to half say they&apos;ve made a friend through a game
                </a>{" "}
                (Pew, 2024). The friendships exist. They&apos;re just
                happening in a place with no adults, no continuity, and no
                reason to carry past the session.
              </p>
              <p>
                Watch whether any of it survives the game closing. Do these
                friends have names? Do the same ones show up again, or does
                the lobby churn every week? Is your kid building something
                with anyone, or just passing through. A real social thread
                you can&apos;t see is a very different thing from no social
                thread at all.
              </p>

              <h2>They downplay gaming even though it clearly matters</h2>
              <p>This is the quiet one.</p>
              <p>
                Some kids won&apos;t admit how much they care. They call it
                &ldquo;just a game,&rdquo; shrug when you ask, act a little
                embarrassed it matters to them at all. Usually that&apos;s
                not indifference. It&apos;s self-protection. Somewhere they
                learned that caring about this out loud gets you judged, so
                they hide the caring to dodge the judgment.
              </p>
              <p>
                Watch the gap between what they say and what they do. The
                mouth says &ldquo;whatever.&rdquo; The hours, the saved
                clips, the half-second they light up when someone asks a real
                question, all say something else. When a kid downplays the
                thing they pour the most time into, the downplaying is the
                tell, not the truth.
              </p>

              <h2>
                They&apos;re good enough to be frustrated but not supported
                enough to grow
              </h2>
              <p>
                They&apos;re good. Good enough to know when they&apos;re
                playing badly, good enough to be furious about it, and stuck
                in the same spot for months.
              </p>
              <p>
                Talent with no feedback has a way of curdling. A kid who can
                feel they should be improving and can&apos;t work out why
                often starts deciding the problem is everyone else. The
                blame, the tilt, the sharpness in chat, that&apos;s
                frequently a skilled kid hitting a ceiling alone, not a
                character turning bad.
              </p>
              <p>
                Watch whether the frustration points anywhere. Is it
                &ldquo;my teammates are trash&rdquo; on a loop, or is there a
                flicker of &ldquo;I don&apos;t know what I&apos;m doing
                wrong&rdquo; underneath it? The first is frustration
                protecting itself. The second is a kid asking for coaching
                without the words for it, and it&apos;s easy to miss.
              </p>

              <h2>The pattern underneath all six</h2>
              <p>
                These look different from the outside. Underneath, they share
                a shape.
              </p>
              <p>
                A kid cares about the game. The game is doing real emotional
                work, carrying status, friendship, competence, and a sense of
                control. The environment around it isn&apos;t built to hold
                something that meaningful.
              </p>
              <p>
                That&apos;s why the answer is rarely &ldquo;less gaming&rdquo;
                or &ldquo;more gaming.&rdquo; Both miss what&apos;s going on.
                What tends to help is a better container around the thing
                they already care about: a team, a coach, a rhythm to the
                week, a shared language for what happened in a match, a
                culture that sets the tone, and a way to lose, learn, and
                come back. That may be why school esports programs often
                reach kids who weren&apos;t showing up anywhere else.{" "}
                <a
                  href="https://www.slj.com/story/How-Gaming-and-Esports-Foster-Social-emotional-Learning-Skills-libraries-SEL-D-D-RPG"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  One NASEF-referenced finding put it at roughly 9 in 10
                  participants not in any other extracurricular
                </a>
                . It catches the kid who slipped through everything else.
              </p>
              <p>
                One caveat I&apos;d stake a lot on. The container only works
                if the culture inside it is right. Put a coach and a bracket
                around a toxic, unmoderated mess and all you&apos;ve done is
                make the mess official. Who moderates, who&apos;s in the
                voice chat, which games get picked, whether a beginner is
                allowed to be a beginner: that&apos;s what decides whether
                the structure helps.
              </p>

              <h2>Why I keep coming back to this</h2>
              <p>
                I&apos;ll be straight about where this comes from. I
                wasn&apos;t the parent in this story. I was the kid.
              </p>
              <p>
                I grew up gaming through social anxiety, low self-esteem, and
                a complicated relationship with divorced parents. School felt
                like being made to care about things I didn&apos;t, when all
                I wanted to do was play. My best memories as a kid are
                playing games with friends.
              </p>
              <p>
                Nobody around me knew what to do with that. 12-year-old me
                had no idea what it meant to be on a team, with structure,
                routine, and intentionality. Even at 18 I was only starting
                to see that gaming had taught me ownership, accountability,
                and how to lead. I stumbled into competitive esports in
                college, it covered more than $80,000 of my education, and
                my relationship with my mom has never been better. For me,
                the game wasn&apos;t the problem. The missing piece was a
                container, and I didn&apos;t get one until late.
              </p>

              <InstagramEmbed
                url="https://www.instagram.com/p/DYcuA4jBDl3/"
                caption="DAY 4 of Karlin's founder series — on what gaming gave him, and what was missing."
              />

              <h2>One honest note</h2>
              <p>
                If your kid&apos;s gaming comes with real withdrawal from
                people, sleep or school falling apart, or a low mood that
                doesn&apos;t lift, talk to a pediatrician or counselor first.
                A coached team can help a kid grow from something they&apos;re
                invested in. It can&apos;t treat what&apos;s hurting
                underneath.
              </p>

              <h2>A low-stakes way to test the container</h2>
              <p>
                If you read these and thought &ldquo;that&apos;s my kid,&rdquo;
                there&apos;s a small way to see what changes when the game
                gets a better container, without betting a season on it.
              </p>
              <p>
                <Link href="/programs/ekuzo100">EKUZO100</Link> is our
                shortest version of that environment. One month, a small team
                of 5 players at their level, a coach, and a real practice
                rhythm. Not because every kid should become an esports
                athlete. Because some kids need a place where the thing they
                already care about can become social, coached, and healthier.
                Think of it as an experiment. At the end you&apos;re not
                looking for a pro player. You&apos;re looking for a clearer
                kid: more language for what they&apos;re working on, a bit
                more confidence, more sign that the interest has somewhere
                good to go.
              </p>
              <p className="text-right">— Karlin, founder of EKUZO</p>
            </BlogContent>
          </div>
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
              href="/blog/summer-camps-for-kids-who-game-2026"
              className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start md:items-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src="/images/blog-post-3-card.jpg"
                  alt="Virtual summer camps for kids who'd rather be gaming"
                  fill
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div>
                <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase block mb-2">
                  Guides
                </span>
                <h3 className="font-body font-bold text-black text-xl leading-snug group-hover:text-red transition-colors mb-2">
                  Virtual summer camps for kids who&apos;d rather be gaming
                  (still open for summer 2026)
                </h3>
                <span className="font-body text-black/40 text-sm">
                  by Karlin
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
