import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogContent from "@/components/blog/BlogContent";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const SLUG = "summer-camps-for-kids-who-game-2026";
const TITLE =
  "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)";
const DESCRIPTION =
  "A parent's guide to virtual summer camps for kids who game. Four categories, real cost ranges, and how to tell a coached program from a supervised hangout.";
const HERO_IMAGE = "/images/blog-post-3-hero.jpg";
// Canonical share image. Same asset is referenced from OG, Twitter, and the
// Article JSON-LD so every share surface (Facebook, LinkedIn, iMessage,
// Slack, X, email link cards, Google rich snippets, AI summarizers) uses one
// source of truth. Replace this file to update every surface at once.
const SHARE_IMAGE = "/images/blog-post-3-card.jpg";
const DATE_PUBLISHED = "2026-05-14";
const DATE_MODIFIED = "2026-05-14";

export const metadata = {
  alternates: { canonical: `/blog/${SLUG}` },
  title: `${TITLE} — EKUZO Blog`,
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
        width: 1232,
        height: 770,
        alt: TITLE,
      },
    ],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Karlin"],
    section: "Guides",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export default function PostSummerCamps2026() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

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
              className="font-body font-bold text-black leading-tight mb-8"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              {TITLE}
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
              src={HERO_IMAGE}
              alt="Kids playing computer games at home during a virtual summer camp"
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
                Updated May 14, 2026
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
                Summer break is days away in most of the country and your kid
                wants one thing: more time on whatever they&apos;re playing.
                Fortnite, Roblox, Minecraft, Smash Bros, Rocket League, or
                whatever&apos;s the obsession this week. There are real summer
                camps still open for 2026 that work for that kid, and a handful
                of them are genuinely developmental. Four categories are worth
                knowing about: <strong>game-design and coding camps</strong>{" "}
                teach kids to build the games they already play;{" "}
                <strong>creation-focused gaming camps</strong> drop kids into
                Minecraft or Roblox worlds with light instruction;{" "}
                <strong>
                  university and in-person &ldquo;esports&rdquo; camps
                </strong>{" "}
                offer supervised play with peers on a college campus;{" "}
                <strong>structured esports camps</strong> put kids on a real
                squad with a coach who teaches the game. The right pick depends
                on whether your kid wants to play, build, hang out, or grow.
                This guide walks each category, names representative camps, and
                explains which kid each one fits.
              </p>

              <h2>How do I decide which kind of summer gaming camp fits my kid?</h2>
              <p>
                Start with what your kid actually wants out of game time. Some
                want to make games. Some want to build worlds inside Minecraft
                or Roblox. Others want to be around peers, playing freely with
                new friends. And then there&apos;s a different kid: the one who
                plays a lot, loves it deeply, and hasn&apos;t found anyone who
                takes it seriously with them yet.
              </p>
              <p>
                The second filter is the type of supervision you&apos;re
                buying. Most camps run with adult counselors whose job is
                keeping the room calm and the kids on schedule. A smaller set
                runs with actual expert coaches who play and teach the game at
                a high level. Those two look the same on a website. They are
                very different experiences for the kid.
              </p>
              <p>A simple mapping:</p>
              <ul>
                <li>
                  Wants to make games → game-design and coding camps
                </li>
                <li>
                  Wants to build worlds inside Minecraft or Roblox →
                  creation-focused gaming camps
                </li>
                <li>
                  Wants to be around other kids playing games in person →
                  university and in-person &ldquo;esports&rdquo; camps
                </li>
                <li>
                  Plays a lot, loves it deeply, hasn&apos;t found their squad
                  yet → structured esports camps
                </li>
              </ul>

              <h2>What are the four categories of summer gaming camps in 2026?</h2>

              <h3>Game-design and coding camps (learn to build)</h3>
              <p>
                Kids spend the week building their own games using tools like
                Scratch, Unity, Roblox Studio, or Minecraft modding. The output
                is usually a playable game by Friday. The day is structured
                like a class with project blocks, instructor demos, and small
                group work.
              </p>
              <p>
                Representative camps include{" "}
                <a
                  href="https://www.idtech.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iD Tech Online
                </a>
                ,{" "}
                <a
                  href="https://www.blackrocket.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Black Rocket
                </a>
                ,{" "}
                <a
                  href="https://www.codeninjas.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code Ninjas Camp
                </a>
                , and{" "}
                <a
                  href="https://creatorcamp.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CreatorCamp
                </a>
                . Formats and prices vary widely. CreatorCamp runs 2-day camps
                from $150 for ages 5-13. iD Tech Online runs full-week classes
                of around 25 hours for $800-$1,200. The high end gets you more
                class hours and a tighter ratio (usually 1:6 to 1:10).
              </p>
              <p>
                Best fit: kids who get curious about how games work and want to
                make their own.
              </p>
              <p>
                Honest weakness: if your kid wants to play this summer,
                building is a hard sell. Read the description carefully.
                &ldquo;Game design camp&rdquo; sometimes means coding camp with
                a gaming theme.
              </p>

              <h3>Creation-focused gaming camps (Minecraft and Roblox worlds)</h3>
              <p>
                Sandbox-style camps where kids build worlds, contraptions, and
                mini-games inside Minecraft or Roblox. Less code-heavy than the
                design category. Lots of in-game peer collaboration on shared
                builds.
              </p>
              <p>
                Representative camps include{" "}
                <a
                  href="https://connectedcamps.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connected Camps
                </a>{" "}
                (Minecraft),{" "}
                <a
                  href="https://outschool.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Outschool
                </a>
                &apos;s Minecraft and Roblox clubs,{" "}
                <a
                  href="https://www.blackrocket.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Black Rocket
                </a>
                &apos;s Roblox Studio sessions, and{" "}
                <a
                  href="https://creatorcamp.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CreatorCamp
                </a>
                &apos;s Roblox Game Masters and Minecraft Modders tracks. Most
                run 5-15 hours of instruction per week for $100-$400.
              </p>
              <p>
                Best fit: kids who already lose hours making things in sandbox
                games.
              </p>
              <p>
                Honest weakness: real team dynamics are rare. Most camps in
                this category are parallel play with light coaching. Kids walk
                away with a build, not necessarily with teammates.
              </p>

              <h3>
                University and in-person &ldquo;esports&rdquo; camps
                (supervised play with peers)
              </h3>
              <p>
                In-person day camps run on a college campus or community center
                where kids spend the week playing a rotation of games (often
                Smash Bros, Rocket League, Fortnite, Mario Kart, sometimes
                League) in a supervised lounge. Light instruction, social
                atmosphere, drop-off and pick-up model.
              </p>
              <p>
                Representative camps include{" "}
                <a
                  href="https://universityunions.utexas.edu/esports-summer-camp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UT Austin Esports Summer Camp
                </a>
                ,{" "}
                <a
                  href="https://esports.utdallas.edu/2026/04/08/summer-gaming-camps-2026/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UT Dallas Summer Gaming Camps
                </a>
                ,{" "}
                <a
                  href="https://www.uta.edu/student-affairs/esports/camps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UT Arlington Esports Camps
                </a>
                , and{" "}
                <a
                  href="https://esports.osu.edu/summer-camp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ohio State Esports Summer Camp
                </a>
                . Day camps typically run 5-7 hours per day for $300-$600 a
                week, with student-staff ratios around 1:15 to 1:25.
              </p>
              <p>
                Best fit: parents who want their kid out of the house, around
                peers, and trying new games in person.
              </p>
              <p>
                Honest framing: these are marketed as &ldquo;esports
                camps,&rdquo; but the structure is closer to a supervised
                gaming hangout than a competitive program. The adults running
                the room are usually student staff whose job is moderation,
                not coaching. If your goal is getting your kid into a real
                social environment around games, that&apos;s the right shape.
                If you want skill development, the next category is what you
                want.
              </p>

              <h3>Structured esports camps (real squads, expert coaching)</h3>
              <p>
                Kids join a small squad, train with a coach who actually plays
                the game at a high level, and end the camp with some kind of
                culminating competition. The model is the same as a sports
                team. Sessions are usually a half-day, with a coach present
                throughout. Ratios matter here more than in any other category,
                and they vary a lot.
              </p>
              <p>
                Representative camps include{" "}
                <Link href="/programs/ekuzo-camps">EKUZO Camps</Link>,{" "}
                <a
                  href="https://www.ussportscamps.com/esports/esc/nxt-up-league-of-legends-esports-summer-camp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NXT UP League of Legends Esports Camp
                </a>
                ,{" "}
                <a
                  href="https://skillshot.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Skillshot Esports Academy
                </a>
                , and{" "}
                <a
                  href="https://www.imgacademy.com/sport-camps/esports"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  IMG Academy Esports
                </a>{" "}
                (which runs its 2026 camp in partnership with the pro org M80).
                EKUZO runs a virtual half-day at a 1:5 coach-to-player ratio
                for $199 per week, which works out to roughly $13 per hour of
                dedicated top-1% coaching. IMG runs an on-site residential
                week in Florida with pro coaches at around 1:10 for roughly
                $1,900. NXT UP runs a weekly virtual program for ages 7-15 in
                League specifically.
              </p>
              <p>
                Best fit: kids who&apos;re ready to take the thing they already
                love a little more seriously, or kids whose parents see
                something more in the hobby than just play.
              </p>
              <p>
                Why this category produces the most transferable skills:
                communication, accountability, handling losses, leading peers
                all get forced by the structure. Same reason traditional team
                sports work, applied to the game your kid already loves.
              </p>
              <p>
                Honest weakness: structured esports camps focus on team-based
                competitive games like League of Legends, Valorant, Rocket
                League, or Counter-Strike. If your kid&apos;s main thing is
                solo exploration in MMOs or single-player RPGs, this
                isn&apos;t the category that fits them.
              </p>

              <h3>Quick comparison: cost and what you actually get</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Cost per week</th>
                    <th>Hours per week</th>
                    <th>Coach type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Game-design and coding</td>
                    <td>$150–$1,200</td>
                    <td>10–30</td>
                    <td>Instructor</td>
                  </tr>
                  <tr>
                    <td>Creation (Minecraft/Roblox)</td>
                    <td>$100–$400</td>
                    <td>5–15</td>
                    <td>Counselor</td>
                  </tr>
                  <tr>
                    <td>University &ldquo;esports&rdquo; day camps</td>
                    <td>$300–$600</td>
                    <td>25–35</td>
                    <td>Student staff</td>
                  </tr>
                  <tr>
                    <td>Structured esports camps</td>
                    <td>$199–$1,900</td>
                    <td>15–30</td>
                    <td>Expert coach</td>
                  </tr>
                </tbody>
              </table>

              <h2>Why League of Legends, and why it&apos;s having a moment in 2026</h2>
              <p>
                Worth answering because most structured esports programs
                (including{" "}
                <Link href="/programs/ekuzo-camps">EKUZO Camps</Link>) coach in
                League of Legends, which surprises parents whose kids play
                Fortnite or Roblox or Minecraft. The short version: League is
                the chess of esports, it shares a lot of cultural DNA with
                games and stories your kid probably already likes, and the
                community is in a real moment right now.
              </p>
              <p>
                Start with the game itself. Five roles, one map, a playbook
                that evolves every match. The game has 170+ champions, each
                with their own ability kit, and near-limitless playstyles
                between them. It rewards memory, pattern recognition,
                communication, and live decision-making in a way few
                competitive games can match. The depth is why pros train it
                for years and why a 12-year-old can keep finding new things to
                learn after their thousandth match.
              </p>
              <p>
                For kids already drawn to fantasy worlds, League feels
                familiar. The art is anime-influenced. The champions,
                abilities, lore, and mythology have a lot in common with
                Dungeons &amp; Dragons, which is having its biggest moment in
                a generation right now, helped by school clubs and Stranger
                Things. A kid who&apos;s open to either of those aesthetics
                usually finds League easy to step into. The audience is
                growing too: college esports programs, scholarship dollars,
                and Twitch viewership are all up year over year.
              </p>
              <p>
                The clearest proof of this lately: on May 11, 2026, the
                streamer Jynxzi hosted a 40-creator League tournament that
                paired top-ranked players with people who&apos;d never opened
                the game. The event pulled{" "}
                <a
                  href="https://escharts.com/news/jynxzis-lol-tourney-outshines-professional-leagues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  920,000 concurrent viewers
                </a>
                , out-drawing most of the professional esports leagues that
                ran the same week. Jynxzi called it the most locked-in
                he&apos;s ever been gaming. The format showed the thing
                parents most want to know: the game works at every skill
                level when the structure invites it.
              </p>

              {/* Jynxzi May 11 2026 League tournament clip.
                  Twitch requires the `parent` query param to match the hostname
                  serving the page — listing prod, dev branch, and localhost.
                  Wildcards aren't supported, so Netlify deploy previews
                  (deploy-preview-N--ekuzo.netlify.app) will not render this. */}
              <div className="my-6">
                <div
                  className="relative w-full"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  <iframe
                    src="https://clips.twitch.tv/embed?clip=JoyousExquisitePterodactylCorgiDerp-36Vj3nmNL73uTTud&parent=ekuzo.gg&parent=dev--ekuzo.netlify.app&parent=localhost"
                    title="Jynxzi League of Legends tournament clip"
                    loading="lazy"
                    allowFullScreen
                    scrolling="no"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>

              <p>
                The skills also move sideways. Map awareness, calling out a
                play, recovering from a bad fight, leading a teammate. Those
                are the things every game your kid plays rewards too.
                Fortnite. Rocket League. Valorant. Even Roblox group play.
                Your kid plays Fortnite, or Roblox, or Minecraft.
                That&apos;s exactly the kid{" "}
                <Link href="/programs/ekuzo-camps">EKUZO Camps</Link> is built
                for, because what we teach in League shows up in whatever
                they&apos;re playing the rest of the week.
              </p>
              <p>
                We wrote{" "}
                <Link href="/blog/league-of-legends-youth-development">
                  a longer post on why League of Legends works for youth
                  development
                </Link>
                . It goes deeper on the toxicity question and what coached
                play teaches kids.
              </p>

              <h2>What does a week at EKUZO Camp actually look like?</h2>
              <p>
                EKUZO Camps are built for the kid who loves games more deeply
                than the people around them realize. The kid who hasn&apos;t
                found their squad yet, or hasn&apos;t been shown that their
                passion can become something more than casual play.
              </p>

              {/* Karlin YouTube Short — vertical (9:16), max-width 360 so it sits
                  cleanly inside the body column. */}
              <div className="my-6 flex justify-center">
                <div
                  className="relative w-full"
                  style={{ maxWidth: "360px", aspectRatio: "9 / 16" }}
                >
                  <iframe
                    src="https://www.youtube.com/embed/0XqcbJET8CU"
                    title="Karlin on EKUZO Camps"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>

              <p>
                The format: half-day, virtual, your kid plays from home. No
                drop-off, no driving. Monday through Thursday, your kid trains
                with the same squad of 5 teammates and one top 1% coach.
                Friday, the squad plays other EKUZO squads from across the
                United States in a competitive tournament.
              </p>
              <p>
                Here&apos;s where our coaches do different work from most.
                They teach the game first. Concepts like map awareness, wave
                management, team communication, when to fight and when to
                back off. Then they hand the decisions back to your kid. The
                kid plays. The coach watches and asks questions afterward.
                &ldquo;What were you thinking on that play? What did the other
                team see? What would you do differently?&rdquo; The point is
                the kid building their own decision-making, not the coach
                piloting matches from the sideline. Same reason a great
                soccer coach doesn&apos;t tell a 12-year-old where to pass
                every five seconds.
              </p>
              <p>
                I started EKUZO because my 10-year-old self desperately
                needed it. I loved playing games. I never had a coach. I never
                had a consistent squad I could learn and grow with. Camp is
                the thing I wish someone had built for me.
              </p>
              <p>
                Camps run weekly from{" "}
                <strong>May 18 through August 8, 2026</strong>. Sign up solo
                and we&apos;ll match your kid into a squad. Sign up with
                friends and you can stay together. Weeks are $199
                (limited-time pricing, original price $299). Most weeks still
                have open slots.
              </p>

              <h2>How do I sign up before the next week starts?</h2>
              <p>
                Three steps. Pick a week from the{" "}
                <Link href="/programs/ekuzo-camps">camps schedule</Link>.
                Decide if your kid wants to sign up solo (we&apos;ll match
                them) or with friends (they stay together). Register.
                You&apos;ll get a welcome email with what your kid needs
                (computer, mouse, headset, internet) plus a coach intro
                before your kid&apos;s first session.
              </p>
              <p>
                If you have questions about whether your kid is a fit, the{" "}
                <Link href="/programs/ekuzo-camps">camps page</Link> has the
                format details, common parent questions, and a way to talk to
                the team.
              </p>

              <blockquote>
                If your kid would rather spend the summer gaming, that&apos;s
                a starting point, not a problem to fix. The right camp meets
                them where they already are and builds the community, the
                coach, and the challenge around it. That&apos;s what every
                great summer experience does. The medium changes; the shape
                stays the same.
              </blockquote>

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
              href="/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng"
              className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start md:items-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src="/images/blog-post-1-card.jpg"
                  alt="Our Family's Esports Journey with EKUZO and the K1ng"
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
                <span className="font-body text-black/40 text-sm">
                  by Lisa Holt
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
