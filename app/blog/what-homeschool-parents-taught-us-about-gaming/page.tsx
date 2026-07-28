import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import QuoteCards from "@/components/blog/QuoteCards";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const SLUG = "what-homeschool-parents-taught-us-about-gaming";
const PILLAR_SLUG = "when-gaming-helps-homeschool-kids";
const TITLE = "What 200+ homeschool parents taught us about gaming";
const DECK =
  "Three camps, the words they use, and the one thing they all actually want.";
const DESCRIPTION =
  "We read a 200+ parent thread on kids and gaming. Three camps, the language they use, and the one structured, social, supervised thing they all want.";
const HERO_IMAGE = "/images/blog-post-6-hero.jpg";
// Canonical share image — a 1200×630 crop of the hero. Feeds OG, Twitter,
// and the Article JSON-LD so every share surface uses one source of truth.
const SHARE_IMAGE = "/images/blog-post-6-card.jpg";
const DATE_PUBLISHED = "2026-05-21";
const DATE_MODIFIED = "2026-05-21";

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
    section: "Case Studies",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export default function PostWhatHomeschoolParentsTaughtUs() {
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
              Case Studies
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
            alt="A homeschool parent reading on her phone at a kitchen table, with a world map, bookshelves, and children's artwork on the wall behind her."
            width={1857}
            height={847}
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
                Recently I read a thread where a dad asked a homeschool
                parenting group how to handle his sons and their gaming. More
                than 200 parents answered, and they did not agree. This was one
                Facebook thread, not a formal study. But it was valuable because
                parents were speaking plainly, in their own words, about a
                problem many families are trying to solve.
              </p>
              <p>Three camps showed up.</p>

              <table>
                <thead>
                  <tr>
                    <th>Camp</th>
                    <th>Share</th>
                    <th>The take</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Cut it off</strong>
                    </td>
                    <td>60%</td>
                    <td>
                      Gaming is an addiction. Delete it and ride out the
                      withdrawal.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Set limits</strong>
                    </td>
                    <td>30%</td>
                    <td>
                      A modern hobby that&apos;s fine in moderation, with rules.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Aim it</strong>
                    </td>
                    <td>10%</td>
                    <td>
                      Stop trying to reduce it. Point it at coding, esports, and
                      design.
                    </td>
                  </tr>
                </tbody>
              </table>
              <p
                className="italic"
                style={{ fontSize: "0.9rem", color: "rgba(0, 0, 0, 0.55)" }}
              >
                Rough shares from reading the thread, not a precise count.
              </p>

              <p>
                I read the whole thing. The striking part is what sits under the
                fight: all three camps are circling the same unmet need, a
                structured, social, supervised version of gaming with an adult
                in the room and a point to it. They mostly disagree on whether
                that version exists. Here&apos;s what each camp said, in their
                own words, and what it tells us about what homeschool families
                actually want when they argue about screens.
              </p>

              <h2>
                Camp 1: &ldquo;Gaming is an addiction. Cut it off.&rdquo; (60%)
              </h2>
              <p>
                The largest and loudest camp talks about gaming like a
                substance. The vocabulary gives it away: withdrawal, detox,
                rehab, &ldquo;the hunt for dopamine.&rdquo; One mother described
                her adult daughter who &ldquo;only eats while still gaming,
                wouldn&apos;t shower, wouldn&apos;t leave the house,&rdquo; and
                whose only friends live inside the game. Another said that even
                off the screen, her son &ldquo;was just biding his time until he
                could play again.&rdquo;
              </p>
              <p>
                Their evidence is real. Several parents had pulled the console
                cold turkey and watched their kid resurface after two or three
                weeks. The books they cite are the ones you&apos;d expect:{" "}
                <em>Glow Kids</em> by Nicholas Kardaras and{" "}
                <em>The Anxious Generation</em> by Jonathan Haidt. One mom
                posted a full paragraph citing Haidt and the argument that games
                are engineered to hook kids.
              </p>
              <p>
                This camp is easy to caricature, but shouldn&apos;t be. The fear
                is grounded, and for a fraction of kids the cold-turkey reset
                genuinely works. What they&apos;re really against is gaming with
                nothing around it: a kid alone with a screen and no one paying
                attention.
              </p>

              <h2>
                Camp 2: &ldquo;It&apos;s a modern hobby. Just set
                limits.&rdquo; (30%)
              </h2>
              <p>
                The second camp is calmer, and often a little defensive.
                They&apos;re tired of being judged by the first one. Their
                argument: gaming is a normal modern hobby, the way certain books
                or shows were when they were kids, and a well-rounded kid can
                have it in moderation. &ldquo;Gaming is not inherently
                evil,&rdquo; one dad wrote, a gamer himself, pushing back on the
                idea that good homeschool parents have to hate everything.
              </p>
              <p>
                Their tools are limits. Earn screen time with chores or
                schoolwork, cap it at an hour or two, pick age-appropriate
                titles. A few pointed out that coding and computers are where
                the world is going anyway, and that backing the interest might
                be the smarter long game.
              </p>
              <p>
                The honest tension in this camp is that limits hold right up
                until they don&apos;t. More than a few of their own posts
                described a kid who begged, negotiated, or found a workaround
                the moment the timer ran out. Limits are an early-stage tool. By
                the time a parent is posting in a group asking for help,
                they&apos;re usually past it.
              </p>

              <h2>
                Camp 3: &ldquo;Stop reducing it. Start aiming it.&rdquo; (10%)
              </h2>
              <p>
                The smallest camp is the most interesting, because they&apos;ve
                stopped fighting the hobby and started pointing it somewhere.
                Their kids are in coding classes, game-design courses, and
                homeschool gaming meetups. One mom said her son &ldquo;wouldn&apos;t
                have gotten past his deep depression and anxiety&rdquo; without
                it, and that the game taught him to communicate. Another, whose
                kids now do coding and drone work, said the turning point came
                when gaming &ldquo;became work&rdquo; with a goal attached, and
                the six-hour days fell off on their own.
              </p>
              <p>
                Their vocabulary is the giveaway. They talk about coaches,
                classes, certifications, scholarships, and community. It&apos;s
                the language of a parent who found a structure and aimed the
                kid&apos;s energy through it.
              </p>
              <p>
                This camp is small, and that&apos;s the tell. Almost all of them
                built their version by hand, stitching together separate classes
                and programs, because no single thing existed to point at.
              </p>

              <h2>Which games worried parents, and which didn&apos;t?</h2>
              <p>
                Parents didn&apos;t treat all games the same, and that
                distinction matters. Fortnite came up again and again as the
                trigger for worry. A few named Roblox directly as a place they
                didn&apos;t trust. Minecraft got treated almost like the safe
                one: creative, open-ended in a building sense, easy to tie to
                learning.
              </p>
              <p>
                That tells you what parents are really judging. They read the
                culture around a game: is it creative or compulsive, social or
                chaotic, collaborative or toxic, age-appropriate. The hours are
                only part of it. A game doesn&apos;t have to be
                &ldquo;educational&rdquo; to earn its place, but the environment
                around it should reward something worth growing. It&apos;s the
                same reason we&apos;re picky about which titles we coach.
              </p>

              <QuoteCards />

              <h2>What all three camps actually agree on</h2>
              <p>
                Read the whole thread and the disagreement starts to look like a
                surface. What they&apos;re all really arguing about, underneath,
                is structure, belonging, and what it takes for a kid to grow up.
              </p>
              <p>
                The dad who started the thread put it best. When the cut-it-off
                camp told him to just take the games away, he answered that
                taking it away &ldquo;without a solid alternative can lead to
                serious emotional distress, including depression.&rdquo; For his
                sons, the game is where their friendships live. Pulling it
                without a replacement removes them from their friends. He was
                naming the gap.
              </p>
              <p>
                Strip away the camp wars and the same five wants show up across
                all of them:
              </p>
              <ul>
                <li>
                  structure they can lean on, more than a countdown timer
                </li>
                <li>
                  a real replacement for the social life gaming gives them
                </li>
                <li>a real adult in the room</li>
                <li>a path the gaming can actually lead somewhere</li>
                <li>permission to stop feeling judged for any of it</li>
              </ul>
              <p>
                Every camp is describing a version of gaming that has an adult,
                a team, and a point. The first camp doubts it exists. The third
                camp built it by hand.
              </p>
              <p>
                And building it by hand is the part worth sitting with.
                It&apos;s the homeschool parent&apos;s real superpower, the
                willingness to assemble a kid&apos;s whole environment piece by
                piece. It&apos;s also the burden. One parent ends up the
                scheduler, the moderator, the safety check, and the social
                coordinator all at once, for a category that&apos;s already
                emotionally loaded. The third camp pulled it off. Plenty of
                parents don&apos;t have the hours to, and shouldn&apos;t have to.
              </p>

              <h2>What we took from it</h2>
              <p>
                We{" "}
                <Link href="/programs/ekuzo-camps">
                  coach kids through games
                </Link>{" "}
                for a living, so I read this less as a debate and more as a
                brief. The parents handed us their exact words, their real
                fears, the books on their shelves, and the shape of the thing
                they wish existed. It lined up with what we see every week: the
                kids who do best have an adult, a team, and a reason around the
                play.
              </p>
              <p>
                If you take one question from all 200+ of them, make it this.
                Does gaming make your kid&apos;s world bigger or smaller? If
                it&apos;s shrinking, take that seriously. If it&apos;s growing,
                look at what structure is making that possible, and build more
                of it.
              </p>
              <p>
                What to actually do about it, how to tell whether a kid&apos;s
                gaming is helping or hurting and how to tilt it, is its own
                piece. I wrote that one{" "}
                <Link href={`/blog/${PILLAR_SLUG}`}>here</Link>.
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
              href={`/blog/${PILLAR_SLUG}`}
              className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start md:items-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src="/images/blog-post-5-card.jpg"
                  alt="When gaming helps homeschool kids and when it hurts"
                  fill
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div>
                <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase block mb-2">
                  Guides
                </span>
                <h3 className="font-body font-bold text-black text-xl leading-snug group-hover:text-red transition-colors mb-2">
                  When gaming helps homeschool kids and when it hurts
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
