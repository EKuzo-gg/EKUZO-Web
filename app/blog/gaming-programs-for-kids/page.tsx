import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import BlogPostBody from "@/components/blog/BlogPostBody";
import {
  buildBlogArticleSchema,
  buildBlogPostBreadcrumbSchema,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const SLUG = "gaming-programs-for-kids";
const TITLE = "Gaming programs for kids: a parent's guide, Fall 2026";
const DECK =
  "What a kid who games can join right now, what it costs, and how to tell a coached program from a supervised hangout.";
const DESCRIPTION =
  "What a kid who games can join in fall 2026: build classes, online clubs, school teams, local leagues and coached teams, with prices checked in October.";
const HERO_IMAGE = "/images/blog-post-3-hero.jpg";
// Canonical share image. Same asset is referenced from OG, Twitter, and the
// Article JSON-LD so every share surface (Facebook, LinkedIn, iMessage,
// Slack, X, email link cards, Google rich snippets, AI summarizers) uses one
// source of truth. Replace this file to update every surface at once.
const SHARE_IMAGE = "/images/blog-post-3-card.jpg";
const DATE_PUBLISHED = "2026-05-14";
const DATE_MODIFIED = "2026-10-26";

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
        height: 770,
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

export default function PostGamingProgramsForKids() {
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
          <div className="relative w-full" style={{ height: "520px" }}>
            <Image
              src={HERO_IMAGE}
              alt="A teenager in headphones playing a computer game at a desk in his bedroom"
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
          <BlogPostBody author="karlin-oei" published={DATE_PUBLISHED} modified={DATE_MODIFIED}>

              <p>
                If your kid would spend every free hour on Fortnite, Roblox,
                Minecraft or whatever this month&apos;s obsession is, there are
                programs built for that kid, and most of them run during the
                school year. In fall you&apos;re choosing between five kinds:
                classes where kids build games, weekly online clubs inside
                Minecraft and Roblox, a school esports team, a library club,
                and coached teams and leagues. The right pick depends on
                whether your kid wants to build, hang out, compete, or get
                better with a team.
              </p>

              <h2>How do I decide which kind fits my kid?</h2>
              <p>
                Start with what your kid wants out of game time. Some want to
                make games. Some want to build worlds inside Minecraft or
                Roblox. Others want to be around other kids, playing freely.
                And then there&apos;s a different kid: the one who plays a lot,
                loves it deeply, and hasn&apos;t found anyone who takes it
                seriously with them yet.
              </p>
              <p>
                The second filter is the kind of adult you&apos;re paying for.
                Many programs run with instructors or counselors whose job is
                to teach a lesson or keep the room calm. Fewer run with coaches
                who play the game at a high level and teach it. Those two look
                the same on a website. They are very different experiences for
                the kid.
              </p>
              <p>A simple mapping:</p>
              <ul>
                <li>Wants to make games: build classes</li>
                <li>Wants to build worlds with other kids: online clubs</li>
                <li>Wants to represent their school: the school esports team</li>
                <li>
                  Wants a social hour with other kids who game: a library club
                </li>
                <li>
                  Plays a lot, loves it deeply, hasn&apos;t found their team
                  yet: a coached team or league
                </li>
              </ul>

              <h2>What&apos;s open in fall 2026?</h2>

              <h3>Build classes (learn to make games)</h3>
              <p>
                Kids build their own games with tools like Scratch, Roblox
                Studio, or Minecraft modding. It&apos;s structured like a
                class.
              </p>
              <ul>
                <li>
                  <a
                  href="https://creatorcamp.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CreatorCamp
                </a>{" "}
                runs instructor-led online workshops for ages 5 to 13,
                  with a Roblox obstacle-course workshop listed for November.
                  Its page says $20 a month for unlimited workshops and
                  supervised game nights.
                </li>
                <li>
                  <a
                  href="https://www.idtech.com/tutoring"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iD Tech
                </a>{" "}
                offers live 1-on-1 online lessons for ages 7 to 19, 60
                  minutes each. A first &ldquo;discovery&rdquo; lesson is $49.
                  The page doesn&apos;t list prices for lesson packs.
                </li>
                <li>
                  <a
                  href="https://www.codeninjas.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code Ninjas
                </a>{" "}
                runs year-round programs at local centers for ages 5 to
                  14. Its site doesn&apos;t list prices, so ask your local
                  center.
                </li>
              </ul>
              <p>
                Best fit: kids who get curious about how games work and want to
                make their own.
              </p>
              <p>
                Honest weakness: if your kid wants to play, building is a hard
                sell. Read the description carefully. &ldquo;Game design&rdquo;
                sometimes means a coding class with a gaming theme.
              </p>

              <h3>Online clubs (Minecraft and Roblox, with other kids)</h3>
              <p>
                A small group meets online once a week, inside the game, with
                an adult running it. Less instruction than a class. More
                building and playing together.
              </p>
              <ul>
                <li>
                  <a
                  href="https://connectedcamps.com/clubs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connected Camps
                </a>{" "}
                runs weekly 90-minute clubs: Minecraft building and
                  survival clubs and a Roblox club for ages 8 to 13, and a
                  modded Minecraft club for ages 11 to 15. Its camps page says
                  it isn&apos;t offering camps right now. Club prices
                  aren&apos;t on the page.
                </li>
                <li>
                  <a
                  href="https://outschool.com/search?q=minecraft+club"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Outschool
                </a>{" "}
                lists many independent teachers&apos; clubs. The first
                  five weekly Minecraft clubs we looked at cost $14 to $18 per
                  class, met once a week for 50 or 90 minutes, and covered ages
                  8 to 17 between them.
                </li>
              </ul>
              <p>
                Best fit: kids who already lose hours making things in sandbox
                games, and kids who want a low-pressure way to play with
                others.
              </p>
              <p>
                Honest weakness: this is mostly playing side by side. Kids come
                away with a build and some friendly faces, and less often with
                teammates.
              </p>
              <p>
                If your kid&apos;s Roblox ask is for Robux instead,{" "}
                <Link href="/blog/should-i-buy-my-kid-robux">
                  here&apos;s how one dad turned it into a $20 money lesson
                </Link>
                .
              </p>

              <h3>The school esports team</h3>
              <p>
                Some middle and high schools have an esports team that plays
                other schools, the way the soccer team does.
              </p>
              <ul>
                <li>
                  <a
                  href="https://www.playvs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PlayVS
                </a>{" "}
                runs leagues that schools enroll in. The school signs up
                  and pays the league fee, so the first step is asking the
                  athletic director or a teacher whether your school has a
                  team. Its site showed fall enrollment ending October 2. If
                  your school isn&apos;t in, ask about spring.
                </li>
                <li>
                  <a
                  href="https://www.nasef.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NASEF
                </a>{" "}
                supports middle and high school esports clubs and says
                  it&apos;s free to join.
                </li>
              </ul>
              <p>
                Best fit: a kid in grades 6 to 12 who wants to play for their
                school, with classmates.
              </p>
              <p>
                Honest weakness: it depends on your school having a team and an
                adult to run it.
              </p>

              <h3>Library clubs (the social hour)</h3>
              <p>
                The point is being in a room with other kids who love the same
                thing. Community and hanging out come first.
              </p>
              <p>
                Your public library may run a gaming club. One example: the{" "}
                <a
                  href="https://www.murrietaca.gov/Calendar.aspx?EID=4802"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Murrieta Public Library
                </a>{" "}
                in California hosts a gaming afternoon for teens 13 to 18
                on the fourth Wednesday of every month. Check your own
                library&apos;s calendar.
              </p>
              <p>
                Best fit: parents who want their kid out of the house and
                around other kids who game.
              </p>
              <p>
                Honest weakness: availability is local, and it&apos;s a
                hangout. Nobody is there to teach the game.
              </p>

              <h3>Coached teams and leagues (in person, online, or hybrid)</h3>
              <p>
                A kid joins a small team, practices every week with a coach,
                and plays real matches with teammates. It&apos;s the model of a
                sports team.
              </p>
              <p>In person:</p>
              <ul>
                <li>
                  <a
                  href="https://www.xpleague.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  XP League
                </a>{" "}
                runs youth esports for players ages 7 to 17, and you can
                  try it for free. Use its location finder to see if one is
                  near you.
                </li>
                <li>
                  <a
                  href="https://valhallan.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Valhallan
                </a>{" "}
                runs arenas where kids ages 7 to 17 come in each week
                  for coaching, training, and competition. A first visit is a
                  free skills assessment.
                </li>
              </ul>
              <p>
                Neither posts prices on its main page, so ask your local
                location.
              </p>
              <p>
                Online and hybrid: this is the kind of program I run, so read
                this part knowing that. I started EKUZO because my 10-year-old
                self needed it. I loved playing games. I never had a coach, and
                I never had a consistent team I could learn and grow with.
              </p>
              <p>
                <Link href="/programs">EKUZO</Link>{" "}
                is a hybrid program: some
                of our teams meet in person at their school, and others play
                online from home. Season one starts in 2027: weekly practice
                with a coach, and matches with the same teammates all season.
                All EKUZO coaches are top 1% collegiate esports athletes or
                former professional players. The waitlist is open now, it&apos;s
                free to join, and it doesn&apos;t commit you to anything. We
                coach in League of Legends, and I wrote up{" "}
                <Link href="/blog/league-of-legends-youth-development">
                  why we chose League, and how we handle its toxicity
                </Link>
                .
              </p>
              <p>
                Whichever program you look at, ask who the coach is and how far
                they went in the game.
              </p>
              <p>
                Best fit: kids who are ready to take the thing they love a
                little more seriously, and kids who play a lot but always with
                strangers.
              </p>
              <p>
                Honest weakness: season one doesn&apos;t start until 2027.
                If you need something this fall, pick from the sections above
                and join the waitlist for later. It&apos;s also one game, and a
                team game. If your kid&apos;s main thing is solo exploration or
                single-player games, this isn&apos;t the category for them.
              </p>

              <h2>What it costs, where a page says</h2>
              <table>
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>What its page said in October 2026</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>NASEF</td>
                    <td>Free to join</td>
                  </tr>
                  <tr>
                    <td>XP League</td>
                    <td>Free to try; prices not posted</td>
                  </tr>
                  <tr>
                    <td>Valhallan</td>
                    <td>Free skills assessment; prices not posted</td>
                  </tr>
                  <tr>
                    <td>Outschool weekly Minecraft clubs</td>
                    <td>$14 to $18 per class (five listings)</td>
                  </tr>
                  <tr>
                    <td>CreatorCamp online workshops</td>
                    <td>$20 a month</td>
                  </tr>
                  <tr>
                    <td>iD Tech 1-on-1 lessons</td>
                    <td>$49 first lesson; pack prices not posted</td>
                  </tr>
                </tbody>
              </table>

              <h2>How this guide is kept</h2>
              <p>
                We&apos;d rather give you a short list we checked than a long
                one we didn&apos;t. Every program above is described from its
                own page. Prices and schedules change, so confirm on the
                provider&apos;s page before you plan around them. We re-check
                each month and change the date at the top only when something
                on the page changes.
              </p>
              <p>
                If your kid would rather spend the season gaming, that&apos;s
                a starting point. The right program meets them where they
                already are and builds the community, the coach, and the
                challenge around it.
              </p>
          </BlogPostBody>
        </div>
      </article>

      {/* ══ KEEP READING ══════════════════════════════════════════════════ */}
      <div className="relative overflow-visible">
        <TornPaperDivider color="grey" variant="top" style={1} />
        <section
          className="bg-grey relative overflow-clip"
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
              href="/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng"
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
