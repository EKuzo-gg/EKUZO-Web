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
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

/**
 * The Robux post. Karlin byline. Copy of record:
 * EKUZO/Marketing/content-drafts/2026-10-24-robux-post-copy-of-record.md
 * (Jamie's Google Doc plus his 2026-10-24 answers; re-checked against the Doc
 * 2026-10-26, unchanged). Jamie's copy is final: change it only from his Doc.
 * Claims record: knowledge-base/explorations/2026-10-24-blog-next-post/
 * 04-robux-claims-check.md; prices 03-robux-price-check.md, re-read on ship day.
 * Build Loop artifacts: docs/robux-post/.
 *
 * The family stays anonymous: the child is never named, the dad is "one of my
 * coworkers". The hero is a real photo, taken from behind, with the game's
 * on-screen text blurred.
 *
 * Search job: "should I buy my kid Robux" plus Robux prices and Roblox
 * parental controls. The H1 keeps the story; the slug and SEO title carry the
 * query.
 */

const SLUG = "should-i-buy-my-kid-robux";
const TITLE_DISPLAY =
  "She asked for Robux to learn about money. Her dad said yes.";
// Set as an absolute title in `metadata` below, so the layout's
// "%s | EKUZO" template is skipped here.
const TITLE_SEO = "Should I buy my kid Robux? One dad’s $20 experiment";
const SUBHEAD =
  "For a year the answer was no. At eight, she changed her pitch.";
// Jamie approved option A, 2026-10-26.
const DESCRIPTION =
  "Robux can be a cheap money lesson if you set the cap in dollars and talk about every purchase. What one 8-year-old did with $20, and the controls to turn on.";
const HERO_IMAGE = "/images/should-i-buy-my-kid-robux-hero.jpg";
const SHARE_IMAGE = "/images/should-i-buy-my-kid-robux-card.jpg";
const HERO_ALT =
  "A dad and his daughter at the kitchen counter, looking at a Dress to Impress runway on her tablet; he points to the five stars other players gave her outfit.";
// Re-set both to the ship date if it ships another day.
const DATE_PUBLISHED = "2026-10-26";
const DATE_MODIFIED = "2026-10-26";

const ROBLOX_PARENTAL_CONTROLS =
  "https://en.help.roblox.com/hc/en-us/articles/30428310121620-Parental-Controls-Overview";

const KEEP_READING = [
  {
    slug: "should-you-ban-fortnite",
    title: "She banned Fortnite and got her kid back. Then came a new problem.",
    blurb:
      "The ban worked, and it broke something no article warned her about. A military mom’s game-by-game verdicts on Fortnite, Red Dead Redemption, and Minecraft.",
    image: "/images/should-you-ban-fortnite-card.jpg",
    category: "Perspective",
  },
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid’s gaming is telling you",
    blurb:
      "The game is visible. The meaning is hidden. Six signs parents notice first in a gamer kid, and what they often mean.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
  {
    slug: "gaming-programs-for-kids",
    title: "Gaming programs for kids: a parent’s guide, Fall 2026",
    blurb:
      "What a kid who games can join in fall 2026: build classes, online clubs, school teams, local leagues and coached teams, with prices checked in October.",
    image: "/images/blog-post-3-card.jpg",
    category: "Guides",
  },
];

// Visible FAQ + FAQPage JSON-LD from one source. Answers are plain strings
// because the schema only accepts plain text. Copy of record, verbatim.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Is Roblox safe for younger kids?",
    answer:
      "It depends on the settings and on you. Since June 2026, Roblox places kids 5 to 8 in accounts with chat off by default and a narrower set of games, and a linked parent account can control spending, screen time and who your kid can talk to. Several states are suing Roblox over child safety. Turn the controls on, pay attention, and check in.",
  },
  {
    question: "How much is VIP in Dress to Impress?",
    answer:
      "The game's store lists 799 Robux for the permanent pass and 299 Robux for 30 days, roughly $8 and $3 at web or gift-card rates. Prices change, so check the in-game store.",
  },
  {
    question: "Does VIP help you rank up in Dress to Impress?",
    answer:
      "No. VIP unlocks a VIP room with exclusive clothes and accessories. Ranks come from the stars other players vote on the runway.",
  },
  {
    question: "How do I use Roblox parental controls to limit spending?",
    answer:
      "Link a parent account to your kid's account, then load or set a monthly spending limit with notifications on. Gift card redemptions don't count toward the limit. If you just connect an account, the default is no limit. And if you set a limit, Roblox doesn't tell you when they reach it. The default spending alerts start at $100 a month, so set notifications to every transaction.",
  },
  {
    question: "How much real money is a Robux?",
    answer:
      "On the web, $9.99 buys 1,000 Robux (a $10 gift card gets the same), so about a penny each. In-app purchases usually give fewer Robux for the same money; it's almost always better to buy and load for them, vs let them buy in the app.",
  },
];

const SOURCES: { label: string; url: string }[] = [
  {
    label: "Roblox Help, Monthly Spending Limits and Notifications FAQ.",
    url: "https://en.help.roblox.com/hc/en-us/articles/4409558125460-Monthly-Spending-Limits-and-Notifications-FAQ",
  },
  {
    label: "Roblox Help, Parental Controls Overview.",
    url: ROBLOX_PARENTAL_CONTROLS,
  },
  {
    label:
      "Roblox Newsroom, age-based Roblox Kids and Select accounts, June 2026.",
    url: "https://about.roblox.com/newsroom/2026/06/age-based-roblox-kids-and-select-accounts-now-globally-available",
  },
  {
    label:
      "Roblox Newsroom, age checks to chat, November 2025 (global early January 2026).",
    url: "https://about.roblox.com/newsroom/2025/11/roblox-requires-age-checks-limits-minor-and-adult-chat",
  },
  {
    label:
      "Roblox Developer Forum, up to 25% more Robux on web and gift cards, November 2024.",
    url: "https://devforum.roblox.com/t/users-can-enjoy-up-to-25-more-robux-on-computer-web-and-gift-cards/3275270",
  },
  {
    label:
      "Dress to Impress store on Roblox (VIP Pass 799 Robux; VIP Monthly 299), read October 24, 2026.",
    url: "https://www.roblox.com/games/15101393044/Dress-To-Impress",
  },
  {
    label:
      "Destructoid, “Is VIP worth it in Dress to Impress,” January 2025 (VIP perks).",
    url: "https://www.destructoid.com/is-vip-worth-it-in-dress-to-impress-for-2025/",
  },
  {
    label:
      "Pixeltwelve, Dress to Impress ranks, stars and rewards (ranks come from stars).",
    url: "https://pixeltwelve.com/articles/dress-to-impress-ranks-stars-rewards",
  },
  {
    label: "TechCrunch, Texas attorney general sues Roblox, November 7, 2025.",
    url: "https://techcrunch.com/2025/11/07/texas-ag-sues-roblox-accusing-it-of-prioritizing-pixel-pedophiles-over-child-safety/",
  },
  {
    label: "West Virginia Attorney General, settlement with Roblox, April 2026.",
    url: "https://ago.wv.gov/article/west-virginia-reaches-11-million-settlement-roblox-prompts-major-child-safety-overhaul",
  },
  {
    label:
      "KSL, Roblox settlement with the Kansas attorney general, September 2026.",
    url: "https://www.ksl.com/article/51630275/roblox-to-pay-kansas-ags-office-10m-as-part-of-online-child-safety-settlement",
  },
  {
    label:
      "Fortune, advocacy groups file FTC complaint over Roblox design, May 20, 2026.",
    url: "https://fortune.com/2026/05/20/exclusive-advocacy-groups-file-complaint-roblox-manipulative-design/",
  },
  {
    label:
      "University of Sydney, children’s experiences of Roblox monetisation (Hardwick and Carter), March 2025.",
    url: "https://www.sydney.edu.au/news-opinion/news/2025/03/24/literally-just-child-gambling-study-urges-swift-regulation-of-roblox.html",
  },
];

export const metadata = {
  alternates: { canonical: `/blog/${SLUG}` },
  title: { absolute: TITLE_SEO },
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
        width: 1200,
        height: 630,
        alt: HERO_ALT,
      },
    ],
    publishedTime: DATE_PUBLISHED,
    modifiedTime: DATE_MODIFIED,
    authors: ["Karlin Oei"],
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

const captionClass =
  "caption-top text-left font-body font-bold text-black pb-3";

export default function PostShouldIBuyMyKidRobux() {
  const articleSchema = buildBlogArticleSchema({
    slug: SLUG,
    title: TITLE_DISPLAY,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: SHARE_IMAGE,
  });
  const breadcrumbSchema = buildBlogPostBreadcrumbSchema(SLUG, TITLE_DISPLAY);
  const faqSchema = buildFAQPageSchema(FAQ_ITEMS);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

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
              sizes="(max-width: 1040px) 992px, (max-width: 1264px) 100vw, 1232px"
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
          <BlogPostBody
            author="karlin-oei"
            published={DATE_PUBLISHED}
            modified={DATE_MODIFIED}
          >
            <p>
              <strong>Short answer:</strong>{" "}Buying your kid Robux can be a
              cheap, low-stakes money lesson if you set the cap in dollars and
              talk about every purchase. Two things make it harder than it
              looks: Robux hide the real price, and many{" "}
              <a
                href={ROBLOX_PARENTAL_CONTROLS}
                target="_blank"
                rel="noopener noreferrer"
              >
                Roblox
              </a>{" "}
              games sell paid shortcuts. Saying no is a fine answer too.
            </p>

            <h2>The pitch</h2>
            <p>
              One of my coworkers at EKUZO, where we coach kids&apos; gaming
              teams, has an 8-year-old daughter. She&apos;s played Roblox for
              about a year, mostly Dress to Impress: you get a theme, a few
              minutes to put an outfit together, then you walk a runway and
              the other players vote.
            </p>
            <p>
              The whole time, she asked for Robux, Roblox&apos;s currency, so
              she can buy VIP. For a year, her parents always said no. Her
              dad&apos;s blunt about why: the game has casino elements, and
              it&apos;s fine if she has fun, but he won&apos;t support spending
              for shortcuts.
            </p>
            <p>
              Then she turned eight and changed her argument. In her words,
              &ldquo;dad, I need to learn about money at some point, and this
              is a good place to do it.&rdquo;
            </p>
            <p>
              Her dad, impressed and a little surprised, decided to meet her
              where she is. He said yes, then he set his own goals: teach her
              how money works, how to think about priorities, and the
              discipline to make it last.
            </p>

            <h2>Why he said yes</h2>
            <p>His reason was about control.</p>
            <blockquote>
              <p>
                &ldquo;A game is a safe place. As long as I put the limit and
                the safety in place, it&apos;s actually a great testing
                zone.&rdquo;
              </p>
            </blockquote>
            <p>
              He set the amount, $20, and he can see everything she does with
              it. He called it a pilot. And he was thinking past the game:
              someday she&apos;ll have an allowance, and it will go to food,
              going out with friends and buying gifts. He equated it to a
              practice round.
            </p>

            <h2>How the conversation changed</h2>
            <p>
              Before, when she asked he said no, and that was the whole
              conversation.
            </p>
            <p>
              Now it&apos;s one they both want to have. She gets to talk about
              the thing she cares about: the outfits, the runway, and what else
              she&apos;s considering. He gets to talk about the thing he cares
              about: what something costs, what&apos;s worth spending on, and
              what she&apos;ll do when it&apos;s gone.
            </p>
            <blockquote>
              <p>
                &ldquo;I get to be in her world, and have her be in mine.
                Meeting in the middle has changed how we talk about it.&rdquo;
              </p>
            </blockquote>
            <p>
              That&apos;s the line I keep coming back to. My mom didn&apos;t
              get behind my gaming until it had earned me a scholarship. When
              she finally told me to go train, I cried.
            </p>
            <div className="my-10 mx-auto w-full max-w-[560px]">
              <Image
                src="/images/robux-one-game-two-things.png"
                alt="One game, two things to talk about. She talks about the outfit she's saving for, winning the runway, what's new in the store, and what she'll buy first. Dad talks about what it costs in real dollars, what it actually gets you, what happens when it's gone, and whether it's worth the wait. One conversation they both want."
                width={1080}
                height={1350}
                sizes="(max-width: 640px) 100vw, 560px"
                className="w-full h-auto"
              />
            </div>

            <h2>What her $20 actually buys</h2>
            <p>
              <strong>Robux hide the price.</strong>{" "}On the web, $9.99 buys
              1,000 Robux (a $10 gift card gets the same), so her $20 is
              roughly 2,000. Inside the mobile app, the same money buys fewer.
              Researchers at the University of Sydney who interviewed children
              about Roblox found they struggled to work out what Robux cost in
              real money. So say the dollars out loud, and compare it to other
              things in the real world.
            </p>
            {/* Tables: copy approved by Jamie 2026-10-26. Web prices re-read
                on roblox.com on ship day (docs/robux-post/evidence/). */}
            <table>
              <caption className={captionClass}>
                What $20 buys on the web (Roblox&apos;s Robux page, October
                2026)
              </caption>
              <thead>
                <tr>
                  <th scope="col">You pay</th>
                  <th scope="col">You get</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>$4.99</td>
                  <td>500 Robux</td>
                </tr>
                <tr>
                  <td>$9.99</td>
                  <td>1,000 Robux</td>
                </tr>
                <tr>
                  <td>$19.99</td>
                  <td>2,000 Robux</td>
                </tr>
              </tbody>
            </table>
            <table>
              <caption className={captionClass}>Where her $20 went</caption>
              <thead>
                <tr>
                  <td></td>
                  <th scope="col">Robux</th>
                  <th scope="col">About</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">VIP pass in Dress to Impress (permanent)</th>
                  <td>799</td>
                  <td>$8</td>
                </tr>
                <tr>
                  <th scope="row">An outfit</th>
                  <td>about 300</td>
                  <td>$3</td>
                </tr>
                <tr>
                  <th scope="row">Still unspent</th>
                  <td>about 900</td>
                  <td>$9</td>
                </tr>
              </tbody>
            </table>
            <p>
              <strong>VIP in Dress to Impress buys clothes and a room.</strong>{" "}
              The permanent pass is 799 Robux in the game&apos;s store, roughly
              $8 at the web rate, which would be about 40% of her $20. It
              unlocks a VIP room with VIP-only clothing and accessories. It
              doesn&apos;t buy rank. Ranks, and the harder lobbies, come from
              the stars other players give you on the runway. A kid can believe
              VIP is how you get to the top, so it&apos;s a good first question
              to ask together: what does this get you?
            </p>
            <p>
              <strong>The game will offer more.</strong>{" "}Running faster, more
              items per outfit, double in-game money, each sold as its own
              pass. Each one is small. The lesson is deciding before the store
              opens, and getting ahead of the casino elements.
            </p>

            <h2>What she did with it</h2>
            <p>
              She spent about $3 on an outfit. The free avatar has almost no
              style, and she wanted something that was hers, though not the
              rarest look in the store, because they talked about it.
            </p>
            <p>
              Plenty of players wear what she picked: long hair, a pink
              T-shirt and a skirt. It looks a little like her. It didn&apos;t
              need to be flashy, but it&apos;s hers.
            </p>
            <p>
              Then she bought VIP in Dress to Impress, the one-time permanent
              pass. The VIP room in the game she plays most is now open to her.
            </p>
            <p>
              That left roughly half her money. She has her eye on a few
              things but hasn&apos;t picked one yet.
            </p>

            <h2>If you&apos;re thinking about it</h2>
            <ol>
              <li>Pick the amount in dollars before you open the app.</li>
              <li>
                Link a parent account to your kid&apos;s and turn on activity
                and spending notifications. Roblox sends activity updates and a
                notice when money is spent. A monthly spending limit
                doesn&apos;t cover gift card redemptions, so if you use a gift
                card, the card is the limit. Check which account type your kid
                has, too: Roblox&apos;s accounts start very restrictive for
                ages 5-8 (including limiting games that show up), then slowly
                progress with more responsibilities.
              </li>
              <li>
                Convert out loud, every time. Robux to dollars needs to be
                understood. Ideally give comparisons to other things in their
                life.
              </li>
              <li>
                Ask what they get for their purchase before they buy it and
                have a real conversation.
              </li>
              <li>
                Agree in advance what happens when it&apos;s gone. (The answer
                that teaches the most is: it&apos;s gone.)
              </li>
              <li>
                Regularly talk about it. That&apos;s the part you&apos;re
                paying for.
              </li>
            </ol>

            <h2>What I&apos;d keep in mind</h2>
            <p>Roblox isn&apos;t a neutral place to run this experiment.</p>
            <ul>
              <li>
                <strong>Safety is a live issue.</strong>{" "}Since 2025, several
                state attorneys general, including Texas&apos;s, have sued
                Roblox over child safety, and others, including West Virginia
                and Kansas, have reached settlements requiring safety changes.
                Roblox has added an age check to chat (January 2026) and, in
                June 2026, separate accounts for kids 5 to 8 with chat off by
                default and a narrower catalog. While helpful, none of that
                replaces a parent who knows who their kid is talking to.
              </li>
              <li>
                <strong>The design pushes.</strong>{" "}Advocacy groups filed an
                FTC complaint in May 2026 arguing that Roblox&apos;s currency
                and scarcity tactics manipulate kids. Roblox says it builds
                &ldquo;for fun and connection, not short-term engagement.&rdquo;
                Either way, your kid is shopping in a store built to sell to
                them.
              </li>
            </ul>
            <p>
              I won&apos;t pretend one $20 pilot makes an eight-year-old good
              with money. What&apos;s different is that they&apos;re willing
              to talk about it on the same side of the table.
            </p>
            <p>
              Weighing a ban instead?{" "}
              <Link href="/blog/should-you-ban-fortnite">
                Here&apos;s how one family handled Fortnite
              </Link>
              . For the bigger picture, read{" "}
              <Link href="/blog/what-your-kids-gaming-is-telling-you">
                what your kid&apos;s gaming is telling you
              </Link>
              , or <Link href="/parents">ask one of our coaches</Link>.
            </p>

            <h2>Common questions</h2>
            {FAQ_ITEMS.map((item) => (
              <Fragment key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </Fragment>
            ))}

            <h2>Sources</h2>
            <ul>
              {SOURCES.map((source) => (
                <li key={source.url}>
                  {source.label}{" "}
                  {/* Long bare URLs wrap instead of clipping at phone width (Sentry D2). */}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="[overflow-wrap:anywhere]"
                  >
                    {source.url}
                  </a>
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

      <FooterBanner heading="Every gamer deserves a team" />
      <Footer />
    </>
  );
}
