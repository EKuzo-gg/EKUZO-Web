import { Fragment } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildFAQPageSchema,
  buildTestimonialVideoSchema,
  JAMIE_ID,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const SLUG = "when-your-sons-only-friends-are-online";
const TITLE_DISPLAY = "When your son’s only friends are online";
// Layout in app/layout.tsx applies the template "%s | EKUZO" — do not suffix
// the brand here or the tab title double-stamps. The visible H1 stays the
// clean line; the SEO title carries the query.
const TITLE_SEO =
  "When your son’s only friends are online: are online friends real?";
const SUBHEAD =
  "Are online gaming friends real? What parents see, and what kids may actually be doing.";
const DESCRIPTION =
  "Is your son’s gaming isolating him or connecting him? A parent’s guide to online friends, what’s real, and when to worry.";
const HERO_IMAGE = "/images/when-your-sons-only-friends-are-online-hero.jpg";
const SHARE_IMAGE = HERO_IMAGE;
const HERO_ALT =
  "A mother stands in a bedroom doorway watching her teenage son play a video game at his desk, headset on, in the warm light of his room.";
const DATE_PUBLISHED = "2026-05-28";
const DATE_MODIFIED = "2026-05-29";

// FAQ items. Each answer is front-loaded (first sentence answers the question)
// for AI extraction. This same array drives both the visible <h3> Q&A and the
// FAQPage JSON-LD, so the structured data can never drift from the copy.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Are online gaming friends real friends?",
    answer:
      "Often, yes. Most of the talk during gaming is social rather than tactical, teen online and in-person friend groups overlap heavily, and plenty of adults will tell you their longest friendships run through a headset. The friendships can be real, and you can still want them anchored in a steady, supervised group rather than a rotating cast of strangers.",
  },
  {
    question: "Is gaming isolating my son, or connecting him?",
    answer:
      "It comes down to one thing: is he playing with the same people over time, talking and on a team, or grinding alone in a lobby of strangers? The same hours can produce opposite outcomes. Solo, anonymous play can track with isolation. Steady, social, supervised play is much more likely to build belonging. Watch the shape of it, not the clock.",
  },
  {
    question: "How can I help my gamer kid make friends?",
    answer:
      "Look for three things around the game he already loves: the same people week to week, a reason to come back like a team or a season, and an adult who is actually present. A coached team built around his game is one of the most direct ways to get all three at once. Adding that structure works better than pushing him toward activities he’ll quit.",
  },
  {
    question: "Should I take the games away?",
    answer:
      "Usually that removes a lonely kid’s main social outlet and starts a fight that changes nothing. Adding structure works better than subtracting the game. Aim for play that puts him with the same people, around an adult, with a reason to come back.",
  },
  {
    question: "My son has no friends and only wants to game. Should I worry?",
    answer:
      "Worry less about the hours and more about the shape. If he’s talking and playing with the same people toward a shared goal, that’s connection happening where he’s comfortable. If he’s alone in an anonymous lobby every night, that’s the signal to help him find a consistent group. Either way, the way kids gather has changed in 20 years, and this says more about the era than your parenting.",
  },
  {
    question: "Are esports teams good for shy or bullied kids?",
    answer:
      "Often, yes. A coached team gives a kid a small, steady group and a role, which is exactly what a shy or bullied kid rarely finds in an open lobby or a crowded gym. Plenty of quiet kids who say little at school will talk, lead, and bounce back from a loss on a team that knows them. It’s belonging built around something they already care about.",
  },
];

const SOURCES: { text: string; cite: string; url: string }[] = [
  {
    text: "Harvard Leadership & Happiness Laboratory, ",
    cite: "The Friendship Recession (February 2025).",
    url: "https://www.happiness.hks.harvard.edu/february-2025-issue/the-friendship-recession-the-lost-art-of-connecting",
  },
  {
    text: "Pew Research Center, ",
    cite: "Teens’ friendships and emotional support networks (March 2025).",
    url: "https://www.pewresearch.org/social-trends/2025/03/13/teens-friendships-and-emotional-support-networks/",
  },
  {
    text: "Pew Research Center, ",
    cite: "Teens and Video Games Today (May 2024).",
    url: "https://www.pewresearch.org/internet/2024/05/09/teens-and-video-games-today/",
  },
  {
    text: "Peña, J. & Hancock, J. T. (2006). An analysis of socioemotional and task communication in online multiplayer video games. ",
    cite: "Communication Research.",
    url: "https://sml.stanford.edu/ml/2006/02/pena-cr-an-analysis.pdf",
  },
  {
    text: "Corbella-González, A., Cal-Herrera, A., & Fernández-Rodríguez, O.I. (2025). Playing video games in community spaces and adolescent loneliness: a cross-sectional study. ",
    cite: "Child & Adolescent Psychiatry and Mental Health.",
    url: "https://doi.org/10.1186/s13034-025-00980-8",
  },
  {
    text: "Society for Research in Child Development, study on video games and boys’ social development.",
    cite: "",
    url: "https://www.srcd.org/news/study-playing-video-games-generally-not-harmful-boys-social-development",
  },
  {
    text: "Niobe Way, Deep Secrets: Boys’ Friendships and the Crisis of Connection (2011), on how boys build and lose close friendships.",
    cite: "",
    url: "",
  },
];

// Keep-reading cards (sibling posts). Card images reused from the blog index.
const KEEP_READING = [
  {
    slug: "our-family-s-esports-journey-with-ekuzo-and-the-k1ng",
    title: "Our family’s esports journey with EKUZO and the K1ng",
    blurb: "Ryan’s story, in his mom’s words.",
    image: "/images/blog-post-1-card.jpg",
    category: "Case Studies",
  },
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid’s gaming is telling you",
    blurb: "The six quiet signals underneath the hours.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
  {
    slug: "league-of-legends-youth-development",
    title: "Why League of Legends is perfect for youth development",
    blurb: "How a single game becomes a team experience.",
    image: "/images/blog-post-4-card.jpg",
    category: "Guides",
  },
];

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
    images: [{ url: SHARE_IMAGE, width: 1846, height: 852, alt: HERO_ALT }],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Jamie Fitch"],
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

export default function PostSonsOnlyFriendsAreOnline() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
    author: { "@id": JAMIE_ID },
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE_DISPLAY);
  const faqSchema = buildFAQPageSchema(FAQ_ITEMS);
  const videoSchema = buildTestimonialVideoSchema("becky-parent");

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
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
              alt={HERO_ALT}
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
          <BlogPostBody author="jamie-fitch" date={DATE_PUBLISHED}>
              <p>
                <strong>Short answer:</strong> if your son spends his nights on
                a headset, the question worth asking is not how many hours he
                plays, or even whether his online friends count. It’s whether
                he’s playing with the same people over time, talking and on a
                team, or grinding alone in an anonymous lobby. One of those is
                connection. The other is isolation with a crowd in the
                background. The screen looks the same from the hallway. What’s
                happening inside it is not.
              </p>

              <h2>What you see, and what he is living</h2>
              <p>
                I grew up active. I played sports year-round, took piano
                lessons, and loved art. But what I loved most was gaming, so
                much that I often chose it over friends, girls, and other
                activities. That was more than my parents knew how to handle,
                since they didn’t grow up with it.
              </p>
              <p>
                By high school, even though I stayed active in the “traditional”
                stuff, I was short, socially awkward, and got bullied for it. I
                found solace in games. More than any other medium, they felt
                like a pure meritocracy: a level playing field where it was just
                a test of skill, often against myself, with no judgment
                attached. I was on a console with dial-up internet, so the
                solitude was real. My parents saw a kid alone in his room
                staring at a screen, and they weren’t entirely wrong.
              </p>
              <p>
                That’s the gap many parents of gamers stand in. From the
                doorway, you see a kid alone with a screen. Sometimes, like me
                at 13, that’s exactly what it is. Other times he’s living
                something real you can’t see from the hallway. The useful move
                is learning to tell the difference: the kind of gaming that
                connects versus the kind that isolates, and why.
              </p>

              <h2>Is it the screens?</h2>
              <p>
                It’s fair to worry about connection right now. In-person time
                with friends has{" "}
                <a
                  href="https://www.happiness.hks.harvard.edu/february-2025-issue/the-friendship-recession-the-lost-art-of-connecting"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  fallen about 71% for teens
                </a>{" "}
                since the early 2000s, and boys in particular run short on the
                close kind:{" "}
                <a
                  href="https://www.pewresearch.org/social-trends/2025/03/13/teens-friendships-and-emotional-support-networks/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  16% of boys have no friend to turn to for support, against 5%
                  of girls
                </a>
                . The easy thing to blame is the screen.
              </p>
              <p>
                Look closer and the screen is the wrong target. For many kids,
                gaming is active play: they’re in a match making decisions,
                talking, adjusting, and reading other people in real time. It’s
                a different activity from lying on the couch doom scrolling,
                even though both happen on a screen. And when researchers
                actually read what kids say to each other mid-game, the social
                messages (“what’s up,” “you good?”){" "}
                <a
                  href="https://sml.stanford.edu/ml/2006/02/pena-cr-an-analysis.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  outnumbered the strategy talk by more than three to one
                </a>
                . For a lot of boys, who tend to bond shoulder-to-shoulder
                around an activity rather than face-to-face, a headset full of
                teammates isn’t a sad substitute for friendship. It’s how they
                build it.
              </p>
              <p>
                So the real question isn’t online versus offline. It’s something
                else.
              </p>

              <h2>The real question: alone or together</h2>
              <p>
                Two kids can play the same game for the same hours and end up in
                opposite places, depending on whether they play alone or with
                people.
              </p>
              <p>
                A 2025 study found that adolescents who played{" "}
                <a
                  href="https://doi.org/10.1186/s13034-025-00980-8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  only by themselves had a worse sense of their friendships,
                  their family ties, and themselves
                </a>{" "}
                than kids who played in shared, social settings. And long-term
                research on boys found that the ones who struggle socially tend
                to{" "}
                <a
                  href="https://www.srcd.org/news/study-playing-video-games-generally-not-harmful-boys-social-development"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  game more afterward, not the other way around
                </a>
                . For many kids, heavy solo play is often the symptom, not the
                cause. The screen is showing you where the need is. The need is
                connection, and the game is the closest place he found it.
              </p>
              <p>
                That turns “how many hours is he on” into two better questions.
                Is he playing with the same people, talking, on something like a
                team? Or is he alone in a lobby full of strangers who churn
                through every night? And if the game were gone, what would he
                reach for instead: passive scrolling or something active? The
                answers tell you whether to worry, and what to do about it.
              </p>

              <h2>We have high expectations in real life. Why not this?</h2>
              <p>
                Here’s the part that should bother us more than it does. If a
                kid says they’re going out, you ask who with, when they’ll be
                home, then bless or push back. “Don’t worry about it” wouldn’t
                fly. And you’d never drop a kid at an empty field to “play” with
                friends without asking who’s running it and who else will be
                there. But online, no structure is the default. An open lobby
                has no continuity, no shared standards, and often a stream of
                casual toxicity born out of the environment. Isn’t it
                interesting that we hold the screen to a <em>lower standard</em>{" "}
                than anything else in our kids’ lives?
              </p>
              <p>
                In sports, a great team is never really about the game. It’s
                about the teammates, the shared goals, the coach, and the
                permission to try, fail, and learn together. It’s the journey,
                and the memories along the way. It’s a place to live a great
                shared experience with a scoreboard. The good news is you can
                look for that same shape around a game. Three features turn solo
                play into belonging:
              </p>
              <ul>
                <li>
                  <strong>The same people, repeatedly.</strong> Continuity is
                  what lets a kid matter to a group.
                </li>
                <li>
                  <strong>A reason to come back.</strong> A team, a season,
                  something that expects him next week.
                </li>
                <li>
                  <strong>An adult who is actually in the room.</strong> Not a
                  content filter. A person who knows the kids and notices when
                  one goes quiet.
                </li>
              </ul>
              <p>
                My parents stumbled into a version of this. Instead of
                restricting my gaming, they offered to fund a computer if I
                built it myself on a budget. It was completely new to me and it
                was hard, but at 16 I did it, because I loved gaming that much.
                The build taught me to make decisions, wire hardware, even how
                to use a soldering iron. More importantly, it turned my solo
                habit into something social. PC gaming pulled me into online
                communities and, eventually, LAN parties in someone’s garage:
                unlimited Mountain Dew and Doritos, miles of cords we ran by
                hand, a full night of Counter-Strike. I loved it. I came out of
                it technically confident and, for the first time, comfortable
                with people who got my nerdy side and no fear of the cool kids.
                That leap pointed me toward a STEM career and taught me real
                lessons in humility and kindness. I don’t know where I’d be
                without it.
              </p>

              <h2>Ryan found his team</h2>
              <p>
                One of our moms, Lisa, shared a story that shows exactly how
                this can work. Her son Ryan was an easy-going, happy kid until
                sixth grade, when he was bullied from day one and the anxiety
                wore him down until he was begging to stay home. A new school
                helped a little, and then a coached League of Legends team
                changed the shape of things. Ryan was one of the youngest
                players, learned the game fast, and within his first year his
                teammates were choosing him to lead them in tournaments. Lisa
                says she had never seen that kind of confidence from him in
                t-ball, soccer, or basketball. The way she put it, esports came
                into his life at just the right time, and the confidence brought
                the old Ryan back. You can read{" "}
                <Link href="/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng">
                  Ryan’s story in his mom’s words
                </Link>
                . It’s one family’s experience, not a guarantee, but the shape
                of it is familiar.
              </p>

              <h2>Where a coached team fits</h2>
              <p>
                This is the kind of impact we expect from sports and rarely
                imagine online. That is what EKUZO is: the same shape, built
                around gaming. We don’t change what your kid loves. We add what
                an open lobby leaves out: the same small roster each week, a
                season that gives practice a point, and a coach on the voice
                channel who knows him by name. Our coaches are collegiate
                esports players, usually a few years older than the kids they
                coach, which for a lot of boys matters more than another adult
                instructing them. They’re close enough to be believable and far
                enough along to be worth following.
              </p>

              <figure className="my-10">
                <video
                  controls
                  preload="none"
                  poster="/testimonial-videos/becky-parent-poster.jpg"
                  className="w-full rounded-lg bg-black"
                >
                  <source
                    src="/testimonial-videos/becky-parent.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <figcaption className="text-sm text-black/50 mt-3">
                  Becky, an EKUZO parent, on her son going from “gaming with
                  random people at random times” to practicing with a team.
                </figcaption>
              </figure>

              <p>
                If you want a low-stakes way to feel the difference between a
                crowd and a team, <Link href="/programs/ekuzo100">EKUZO100</Link>{" "}
                is a one-month trial to see if it might be valuable to your
                family.
              </p>

              <h2>What “real friends” actually means</h2>
              <p>
                Decades later, my closest friends are still a mix of people I
                met in person and people I met through a game. Many of the
                online ones have lasted the longest. Yet while my wife can name
                every one of my in-person friends, she can’t name a single one
                of my gaming friends, the ones I’ve talked to online for
                decades, many living half a world away. That’s not a problem.
                The friendship is real, it’s just less visible from the outside.
                That gap, between how real a friendship is and how visible it
                is, is what you’re looking at when you stand outside your son’s
                door. Your job isn’t to decide whether the friends in there are
                real. It’s to make sure he’s holding them to the same standard
                he’d use anywhere else: good people, like-minded, who add
                something to his life.
              </p>

              <h2>When it is more than this</h2>
              <p>
                One honest note. If you have concerns about your son’s gaming
                that go past a quiet social life and are trying to read the
                signals, our companion piece on{" "}
                <Link href="/blog/what-your-kids-gaming-is-telling-you">
                  what your kid’s gaming is telling you
                </Link>{" "}
                walks through six of the most common ones. If it’s beyond that:
                talk of hopelessness, thoughts that he might hurt himself or
                others, or true withdrawal from everything he once loved, that’s
                the moment for a doctor or a licensed mental-health professional,
                not a gaming program. A team can help a lonely kid build
                belonging. It is not treatment for depression or anxiety, and
                we’d never pretend otherwise. If you’re unsure, start with your
                pediatrician.
              </p>

              <h2>Common questions</h2>
              {FAQ_ITEMS.map((item) => (
                <Fragment key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </Fragment>
              ))}

              <h2>Sources and further reading</h2>
              <ul>
                {SOURCES.map((s, i) => (
                  <li key={i}>
                    {s.text}
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.cite || s.url}
                      </a>
                    ) : (
                      s.cite
                    )}
                  </li>
                ))}
              </ul>
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
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0 m-0">
              {KEEP_READING.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-black">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                    <div className="pt-5 flex flex-col gap-2">
                      <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase">
                        {post.category}
                      </span>
                      <h3 className="font-body font-bold text-black text-lg leading-snug group-hover:text-red transition-colors">
                        {post.title}
                      </h3>
                      <p className="font-body text-black/50 text-sm leading-relaxed">
                        {post.blurb}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
