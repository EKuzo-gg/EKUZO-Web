import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import InstagramEmbed from "@/components/blog/InstagramEmbed";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
  buildFAQPageSchema,
  buildVideoObjectSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const SLUG = "league-of-legends-youth-development";
const TITLE = "Why League of Legends is perfect for youth development";
const DESCRIPTION =
  "Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids.";
// Placeholder asset. Aaron will replace with the real hero per the spec in
// docs/marketing/blog-draft-why-ekuzo-plays-league-of-legends.md (media.hero).
const HERO_IMAGE = "/images/blog-post-4-hero.jpg";
const SHARE_IMAGE = "/images/blog-post-4-card.jpg";
const DATE_PUBLISHED = "2026-05-16";
const DATE_MODIFIED = "2026-05-16";

// FAQPage schema — lets AI surfaces (Google AI Overviews, ChatGPT, Perplexity)
// pull individual Q&A pairs as standalone citations. Answers are plain text
// (no HTML) for cleanest parsing across crawlers.
const FAQ_ITEMS = [
  {
    question: "Is League of Legends toxic?",
    answer:
      "Yes, in unmoderated solo queue with strangers. The same is true of any unmanaged online space your tween or teen enters. Riot's behavior systems (Honor levels, communication restrictions, automated detection) keep repeat-offense rates under 10% inside the same year, but the platform tools alone don't fix it. The reliable way to lower the risk for a young player is structure: known teammates, a coach in voice, post-match reflection, adults in the room.",
  },
  {
    question: "Is League of Legends appropriate for kids?",
    answer:
      "League is rated ESRB Teen for fantasy violence. It isn't a young children's game, and the rating is honest about that. The combat is set in Runeterra, a fictional world with swords, magic, dragons, and champion abilities that obviously don't exist outside the game. For many families and schools, that's a different conversation than a game with realistic firearms or modern military settings. We run League as a coached team activity with adults in the room.",
  },
  {
    question:
      "Why does EKUZO use League instead of Fortnite, Minecraft, or Roblox?",
    answer:
      "Any game could support coaching in theory. The question is which game gives a coach the most to teach against. League hits five things at once: strategic depth, approachable mechanics, stable roles, cultural durability, and a non-shooter format. Most other games hit one or two. League is the one we've found that hits all five.",
  },
  {
    question: "What skills can League help players practice?",
    answer:
      "Communication under pressure, decision-making with incomplete information, recovering from mistakes, playing a defined role, supporting teammates, and reflecting on performance. The transfer is visible at the high end too: Jane Street, a quantitative trading firm, uses video games and Go to train its engineers to keep a level head under pressure. Demis Hassabis, the Nobel-winning CEO of Google DeepMind, credits chess and game design as foundational to how he thinks about AI. 65% of competitive college esports players are STEM majors, with graduation rates above the general student population. The same cognitive substrate that produces a high-level gamer often produces a high-functioning operator.",
  },
  {
    question: "Does my kid need to already know League?",
    answer:
      "No. Many of our players are new to it. We start with beginner-friendly champion pools, role scaffolding, and small-team scrims so a new player can find footing before competition gets serious.",
  },
];

// Spoken transcript of Karlin's "Community is opportunity" reel (the
// embedded Instagram video). Inlined as a string literal — no fs access
// (see lib/schema.ts note). Internal blog-framing notes from the source
// file are intentionally excluded; only spoken content belongs here.
const REEL_TRANSCRIPT =
  "Jynxzi just got MrBeast to play in his League of Legends tournament, and somehow that's not even the most impressive part, because he also got 40 of the world's largest creators to also jump in. They had over a million people watch their event from their bedrooms, and even Riot offered in-game support. My personal favorite thing about the event was something called the Challenger Role, where basically the best players had to play non-damage support champions. What that means is the best player cannot be the star of the show. They had to mind control and chess macro the four other players, and it was genuinely some of the most wholesome and educational pieces of content we've ever seen in League of Legends history. And so that's cool, that's great, but what's the takeaway? A lot of people complain about how toxic and unwelcoming the League community can be. While that may be true, this is perhaps the greatest reminder that League, and all communities for that matter, are opportunities, and opportunities are ultimately what you make out of it. If you've ever been curious about playing League or being on a team, now's the time. This is day three. I actually hosted a League of Legends tournament at my own company for 10-year-olds, and we had moms and dads and grandmas and grandpas at home watching. Follow my channel to see what happened.";

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
        width: 1232,
        height: 528,
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

export default function PostLeagueOfLegendsYouthDevelopment() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE);
  const faqSchema = buildFAQPageSchema(FAQ_ITEMS);
  const videoSchema = buildVideoObjectSchema({
    pageSlug: SLUG,
    name: "Community is opportunity — Karlin on the Jynxzi tournament",
    description:
      "EKUZO founder Karlin Oei reacts to streamer Jynxzi's creator-led League of Legends tournament — the 'Challenger Role' format that forced the strongest players into support roles — and why it shows League communities are opportunities shaped by structure.",
    thumbnailPath: "/images/blog-post-4-reel-thumb.jpg",
    uploadDate: "2026-05-16",
    embedUrl: "https://www.instagram.com/p/DYXJQmeR2cq/embed/",
    transcript: REEL_TRANSCRIPT,
  });

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
          {/* Hero is a 21:9 frame from an EKUZO broadcast. Intrinsic
              dimensions + w-full/h-auto scale it to the column width
              with zero cropping (no fill/object-cover). */}
          <Image
            src={HERO_IMAGE}
            alt="EKUZO students competing in a League of Legends match during an EKUZO broadcast."
            width={1232}
            height={528}
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
                League of Legends is unusually strong for structured youth
                development. The game is deep enough to coach against, hard
                enough to grow young players, structured enough to teach
                roles, and culturally durable enough to outlast more than one
                cohort of kids. League is a 5v5 team strategy game with five
                defined positions (
                <a
                  href="https://www.leagueoflegends.com/en-us/how-to-play/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  top, jungle, mid, ADC, support
                </a>
                ),{" "}
                <a
                  href="https://www.leagueoflegends.com/en-us/champions/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  over 170 playable characters
                </a>
                , and a competitive grammar that has anchored a global
                professional league for over fifteen years. It rewards
                thinking ahead, pattern recognition, real-time decision-making
                under pressure, and trust between teammates. League
                isn&apos;t a shooter, which lowers the institutional barrier
                for many schools and families. Riot still runs the game like
                a flagship: regular patches in 2026, a six-region pro league,
                and{" "}
                <a
                  href="https://www.sheepesports.com/articles/lol-riot-begins-work-on-league-next-a-complete-modernization-set-for-2027/en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  a publicly announced engine modernization called &ldquo;League
                  Next&rdquo; targeted for 2027
                </a>
                . <Link href="/">EKUZO</Link> built its coaching system around
                this game because it gives a coach the most surface area to
                teach against, and the right structure around the game turns
                a famously hard title into a developmental environment.
              </p>

              <h2>Is League of Legends really that toxic?</h2>
              <p>
                Most parents who hear about EKUZO get to the same question
                pretty fast: what games do you play? When I say League of
                Legends, the next sixty seconds usually go like this. They
                open a new tab, type &ldquo;League of Legends&rdquo; into
                Google, land on a Reddit thread about toxicity, scroll past a
                clip of someone raging in voice chat, and look up to ask,
                gently or not, &ldquo;Are you sure?&rdquo;
              </p>
              <p>It&apos;s a fair question. The long answer:</p>
              <p>
                League has a reputation, no doubt. Solo queue at peak hours
                can be a factory of sadness: strangers thrown together, no
                shared norms, frustration after a rough match, a chat that
                nobody is moderating. There&apos;s a decade of published
                research on it.
              </p>
              <p>
                The same problem shows up anywhere kids are online without
                supervision. Most of an online childhood is unsupervised by
                default. League is the version that lights up search results
                because it&apos;s competitive and old enough to have research
                literature.
              </p>
              <p>
                That&apos;s the opportunity. Getting your kid into a
                structured, coached online environment early, before they
                have a hundred hours of unmanaged solo queue, is one of the
                best moves you can make for how they show up online for the
                rest of their life.
              </p>

              <h2>Basketball meets chess</h2>
              <p>
                The cleanest way I&apos;ve found to describe League to a
                parent who&apos;s never seen it: basketball meets chess in a
                virtual arena.
              </p>
              <p>
                Like basketball, it&apos;s fast and spatial. Five players on
                a team. Real-time decisions. You rotate, read the floor, and
                know who needs help and when.
              </p>
              <p>
                Like chess, every match starts with the same board and
                structure, even if your draft and opponents shift it.
                There&apos;s an opening, a mid-game, and a late-game. How you
                move your &ldquo;pawns&rdquo; matters early. How you trade
                resources matters in the middle. How you finish matters at
                the end. The structure is fixed. The dynamics inside it are
                not.
              </p>
              <p>
                To an adult watching for the first time, League can look like
                five-on-five chaos. The structure is right there if you know
                what to look at. Five roles. A fixed map. Shared objectives
                the whole team has to fight for together. That&apos;s what we
                get to teach against.
              </p>

              <h2>What makes League the right game for a coaching system?</h2>
              <p>
                Five properties of the game make it the right home for what
                we do.
              </p>
              <p>
                <strong>Strategic depth.</strong> League rewards thinking
                ahead, pattern recognition, and decision-making under
                pressure. That depth sustains long-term coaching the way
                basketball sustains a decade of practice. A coach is never
                out of things to teach.
              </p>
              <p>
                <strong>Approachable mechanics.</strong> The floor is low.
                The ceiling is high. A 12-year-old who has never played can
                find their footing in a few sessions, and a player who&apos;s
                been at it for two years still has room to grow. A beginner
                and a veteran can be on the same team and both get something
                out of practice.
              </p>
              <p>
                <strong>Stable roles and systems.</strong> Five clear roles,
                well-defined team structures, and role-specific success
                criteria make teamwork and leadership teachable. A coach can
                assign or rotate a role, and develop a player inside one.
              </p>
              <p>
                <strong>Cultural durability.</strong> Riot is still patching
                the game in 2026, still running a six-region pro league, and
                is publicly building toward &ldquo;League Next&rdquo; in
                2027. League shows no signs of fading.
              </p>
              <p>
                <strong>It isn&apos;t a shooter.</strong> Fantasy combat in a
                fictional world lowers the institutional barrier for many
                schools and families.
              </p>
              <p>
                Most other games hit one or two of these. League is the one
                we&apos;ve found that hits all five.
              </p>

              <h2>What League gave me</h2>
              <p>
                I grew up playing League. I made friends through it before I
                made friends at school. I learned how to take a loss without
                letting it wreck the next hour. I learned to read a
                fast-moving situation, make a call inside thirty seconds, and
                live with the call when it didn&apos;t go my way.
              </p>
              <p>
                League taught me more than school did. I want to be careful
                with that line because school mattered. Teachers mattered.
                What I mean is specific. League put me inside a live system
                where decisions had consequences inside of a minute.
                I&apos;d watch a teammate change over forty minutes from
                someone I&apos;d never met into someone I&apos;d defend.
                I&apos;d make a bad call, eat the loss, and need to be ready
                for the next play before I&apos;d finished feeling sorry
                about the last one. The game graded me in real time, then
                asked me to keep playing.
              </p>
              <p>
                By the time I was an adult, esports had paid for college and
                I&apos;d built a life around what the game had given me.
                Friends. A community. An identity. A way of thinking. EKUZO
                came out of that. I wanted other kids to get the good parts
                on purpose, not by accident the way I did.
              </p>

              <h2>League is like life</h2>
              <p>
                League is like life. I mean that more concretely than it
                sounds.
              </p>
              <p>
                You can&apos;t pick every teammate. You&apos;ll communicate
                with people you didn&apos;t choose. You&apos;ll make a
                mistake and have to recover while the game keeps moving.
                Sometimes your job is to lead. Sometimes your job is to
                support. Sometimes your job is to make sure the person beside
                you wins instead of you.
              </p>
              <p>
                Blame is the easy move. Asking what you&apos;d do differently
                next time is harder. That&apos;s the part most people miss
                about League. It&apos;s a live laboratory for the same
                dynamics that show up at work and in relationships: reading a
                room, calling a play, knowing when to lead and when to
                follow, recovering from a bad decision, supporting someone
                having a worse night than you.
              </p>

              <h2>Why not Fortnite, Minecraft, Roblox, or VALORANT?</h2>
              <p>
                I get this question a lot, and I want to answer it without
                picking on those games.
              </p>
              <p>
                Fortnite is great for improvisation. Minecraft is one of the
                best creative environments of the last twenty years. Roblox
                is where a lot of kids first learn how to be social online.
                Rocket League is school-friendly and easy to onboard.
                VALORANT and Overwatch teach team play in their own right.
                Smash teaches mastery. Each one can be a good thing in the
                right hands. I wouldn&apos;t argue with a parent whose kid
                loves any of them.
              </p>
              <p>
                We&apos;re not asking your kid to stop playing what they
                already play. Our sessions take a few hours a week. The rest
                of the week, they can play Fortnite, Minecraft, Roblox,
                whatever brings them joy, often with the new friends they
                make on our roster.
              </p>
              <p>
                The skills work both ways. What a kid learns inside coaches
                sessions (map awareness, calling a play, recovering from a
                bad fight, knowing your role on a team) usually shows up in
                whatever else they play that week. A kid who gets better at
                League gets better at Fortnite too.
              </p>
              <p>
                Here&apos;s how I think about it. Most of a kid&apos;s growth
                in any program comes from a small share of the inputs. We
                meet students through the games they love, and we teach
                through the game where the inputs compound: structured
                roles, teachable team dynamics, depth that sustains a real
                season. League is the game I&apos;ve spent serious time
                inside where a coach is never out of things to teach.
              </p>
              <p>That&apos;s the bar we needed to clear. League clears it.</p>

              <h2>Why do kids love League of Legends?</h2>
              <p>
                Structure, strategy, depth, transfer; none of that is what
                makes a 13-year-old fall in love with the game.
              </p>
              <p>
                Kids fall in love with the champions. Over 170 of them, each
                one a different identity. A quiet kid might pick a support
                whose job is to keep the team alive. A kid who likes to lead
                gravitates to mid lane and ends up shotcalling. A kid who
                likes precision picks an assassin and lives with the
                consequences. A kid who likes drama picks Yasuo and learns
                about humility the slow way. Riot&apos;s{" "}
                <a
                  href="https://www.leagueoflegends.com/en-us/champions/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  champions page
                </a>{" "}
                is a roster of personalities, and most kids find one that
                feels like theirs.
              </p>
              <p>
                If a kid is already drawn to fantasy worlds, League feels
                familiar before they ever queue a match. The art is
                anime-influenced. The champions, abilities, lore, and
                mythology overlap heavily with Dungeons &amp; Dragons, which
                is having its biggest moment in a generation right now,
                helped along by school clubs and Stranger Things. A kid
                who&apos;s into anime, cosplay, KPop Demon Hunters, or a
                D&amp;D group usually steps into League easily. The
                aesthetic vocabulary is already theirs.
              </p>
              <p>
                And the universe around the game keeps growing. Worlds is one
                of the biggest spectacles in sports. The{" "}
                <a
                  href="https://escharts.com/tournaments/lol/2025-world-championship-worlds-2025"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2025 final peaked at 6.75 million
                </a>{" "}
                concurrent viewers. Arcane, the animated series set in
                League&apos;s world,{" "}
                <a
                  href="https://9meters.com/entertainment/shows/what-comes-after-arcane-riots-plans-for-more-league-of-legends-animated-shows"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  hit number one in over 60 countries
                </a>
                . Fortiche, the studio that made Arcane, is{" "}
                <a
                  href="https://9meters.com/entertainment/shows/what-comes-after-arcane-riots-plans-for-more-league-of-legends-animated-shows"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  developing more animated series in Noxus, Ionia, and
                  Demacia
                </a>
                .{" "}
                <a
                  href="https://riftbound.leagueoflegends.com/en-us/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Riftbound
                </a>
                , the official trading card game, launched globally in
                October 2025, with new sets shipping every quarter. 2XKO, the
                2v2 fighting game,{" "}
                <a
                  href="https://gameinformer.com/2025/12/05/riots-2xko-arrives-on-consoles-in-january"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  arrived on PS5 and Xbox in January 2026
                </a>
                . League is a universe a kid can live in.
              </p>
              <p>
                One more thing I think kids love. The game makes progress
                visible. You can see yourself getting better, and you can see
                your champion getting better with you. With over 170
                champions and a half-dozen viable styles per role, there are
                a lot of ways to be different in League and still belong on
                the team.
              </p>

              <h2>What did the Jynxzi tournament teach us about League?</h2>

              <InstagramEmbed
                url="https://www.instagram.com/p/DYXJQmeR2cq/"
                caption="Karlin's live reaction to the Jynxzi tournament: community is what you make of it."
              />

              <p>
                In May 2026, a streamer named Jynxzi ran a{" "}
                <a
                  href="https://escharts.com/news/jynxzis-lol-tourney-outshines-professional-leagues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  creator-led League tournament
                </a>{" "}
                with MrBeast, Tyler1, Doublelift, xQc, Ludwig, and forty
                other major creators. Over 920,000 people watched it live.
                The viewership was real. The format mattered more.
              </p>
              <p>
                The strongest players were placed in a &ldquo;Challenger
                Role.&rdquo; They had to play support-style champions whose
                job is to help teammates rather than carry the team. The best
                player on each squad couldn&apos;t be the star. They had to
                guide, support, communicate, and make four other people
                better.
              </p>
              <p>
                The game changed. Teaching moments became the dominant story.
                The strongest players spent the night being the most patient
                ones. The casual creators got better in real time because
                someone strong was helping them play.
              </p>
              <p>
                Same game. Different structure. Different outcome. Format
                shapes behavior, and that&apos;s the bet EKUZO makes.
              </p>

              <h2>How does EKUZO handle League&apos;s toxicity problem?</h2>
              <p>Solo queue is the problem. So we don&apos;t use it.</p>
              <p>
                Our players are on stable teams with the same teammates week
                after week. Coaches are in voice during sessions. We set
                communication norms before the match starts and review them
                after. We use{" "}
                <a
                  href="https://support-leagueoflegends.riotgames.com/hc/en-us/articles/115008474148-League-of-Legends-Honor-Guide"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Riot&apos;s behavior systems
                </a>{" "}
                (Honor levels, communication restrictions, mute and report
                tools) deliberately, and we tell players what each one does.
                We review matches together, including the moment someone got
                frustrated. We treat emotional regulation as part of
                practice, the same way a good football coach treats
                composure as part of practice.
              </p>
              <p>
                A factory of sadness, with adults in the room, becomes
                something else.
              </p>

              <h2>The game is the arena. The system is the work.</h2>
              <p>
                League is hard. That&apos;s part of why we picked it.
                Hardness only teaches when it&apos;s calibrated to where the
                player is, which is what coaches do. Hardness with no
                structure shows up as frustration. With the right structure
                around it, the same hardness produces a player who can
                communicate under pressure, recover from a bad call, carry a
                role on a team, and finish a loss already thinking about the
                next match.
              </p>
              <p>
                League is the arena. EKUZO is the system around it: coaches,
                stable teammates, set expectations, post-match reflection,
                moderated communication, and adults who understand the game
                well enough to teach against it. The full set of teaching
                principles lives on our{" "}
                <Link href="/methodology">methodology page</Link>.
              </p>
              <p>
                If you&apos;ve never played a video game in your life, you
                don&apos;t have to know the rules to see what the game asks
                of a player. If your kid isn&apos;t sure they&apos;re good
                enough yet, they don&apos;t have to be skilled to belong
                here. They need a role, teammates, and a coach who pays
                attention. The rest they&apos;ll build.
              </p>
              <p>
                If you want to see what this looks like in practice,{" "}
                <Link href="/programs/ekuzo-camps">our camps</Link> are
                running all summer. We wrote{" "}
                <Link href="/blog/summer-camps-for-kids-who-game-2026">
                  a longer guide on that
                </Link>{" "}
                too.
              </p>

              <h2>FAQ</h2>
              <p>
                <strong>Is League of Legends toxic?</strong> Yes, in
                unmoderated solo queue with strangers. The same is true of
                any unmanaged online space your tween or teen enters.{" "}
                <a
                  href="https://support-leagueoflegends.riotgames.com/hc/en-us/articles/115008474148-League-of-Legends-Honor-Guide"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Riot&apos;s behavior systems
                </a>{" "}
                (Honor levels, communication restrictions, automated
                detection) keep repeat-offense rates under 10% inside the
                same year, but the platform tools alone don&apos;t fix it.
                The reliable way to lower the risk for a young player is
                structure: known teammates, a coach in voice, post-match
                reflection, adults in the room.
              </p>
              <p>
                <strong>Is League of Legends appropriate for kids?</strong>{" "}
                League is rated{" "}
                <a
                  href="https://www.esrb.org/ratings/27518/league-of-legends/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ESRB Teen
                </a>{" "}
                for fantasy violence. It isn&apos;t a young children&apos;s
                game, and the rating is honest about that. The combat is set
                in Runeterra, a fictional world with swords, magic, dragons,
                and champion abilities that obviously don&apos;t exist
                outside the game. For many families and schools, that&apos;s
                a different conversation than a game with realistic firearms
                or modern military settings. We run League as a coached team
                activity with adults in the room.
              </p>
              <p>
                <strong>
                  Why does EKUZO use League instead of Fortnite, Minecraft,
                  or Roblox?
                </strong>{" "}
                Any game could support coaching in theory. The question is
                which game gives a coach the most to teach against. League
                hits five things at once: strategic depth, approachable
                mechanics, stable roles, cultural durability, and a
                non-shooter format. Most other games hit one or two. League
                is the one we&apos;ve found that hits all five.
              </p>
              <p>
                <strong>What skills can League help players practice?</strong>{" "}
                Communication under pressure, decision-making with incomplete
                information, recovering from mistakes, playing a defined
                role, supporting teammates, and reflecting on performance.
                The transfer is visible at the high end too:{" "}
                <a
                  href="https://www.efinancialcareers.com/news/how-jane-street-uses-video-games-to-train-engineers-to-handle-pressure"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Jane Street, a quantitative trading firm, uses video games
                  and Go
                </a>{" "}
                to train its engineers to keep a level head under pressure.{" "}
                <a
                  href="https://www.nobelprize.org/prizes/chemistry/2024/hassabis/1924974-interview-transcript/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Demis Hassabis
                </a>
                , the Nobel-winning CEO of Google DeepMind, credits chess
                and game design as foundational to how he thinks about AI.{" "}
                <a
                  href="https://www.nasef.org/research"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  65% of competitive college esports players are STEM majors
                </a>
                , with graduation rates above the general student
                population. The same cognitive substrate that produces a
                high-level gamer often produces a high-functioning operator.
              </p>
              <p>
                <strong>Does my kid need to already know League?</strong> No.
                Many of our players are new to it. We start with
                beginner-friendly champion pools, role scaffolding, and
                small-team scrims so a new player can find footing before
                competition gets serious.
              </p>

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
