import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ekuzo.gg";

  // lastModified is a real date, never new Date(): Google only trusts lastmod
  // when it is consistently accurate, and a build-time timestamp tells it every
  // page changed on every deploy. Dates set 2026-10-12 from the last commit to
  // each route's page file (author pages: lib/authors.ts). When you change a
  // page's content, update its date here in the same commit.
  //
  // Only indexable pages belong here. The /register routes are noindex and
  // were removed 2026-10-12; noindex pages in a sitemap show up as errors in
  // Search Console.

  const entries: MetadataRoute.Sitemap = [
    // Core pages
    {
      url: baseUrl,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // Programs — camps is the primary offering
    {
      url: `${baseUrl}/programs/ekuzo-camps`,
      lastModified: new Date("2026-08-04"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/programs/ekuzo-teams`,
      lastModified: new Date("2026-05-25"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs/ekuzo100`,
      lastModified: new Date("2026-05-25"),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Informational pages
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date("2026-05-25"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/parents`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/schools`,
      lastModified: new Date("2026-05-25"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date("2026-04-14"),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // Partners
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date("2026-07-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/partners/boys-and-girls-club`,
      lastModified: new Date("2026-07-10"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // Blog
    {
      // /blog lists every post, so it changes when any post does. Its date is
      // raised below to the newest post date; this is the floor (page.tsx).
      url: `${baseUrl}/blog`,
      lastModified: new Date("2026-10-11"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life`,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng`,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/league-of-legends-youth-development`,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/gaming-programs-for-kids`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/when-gaming-helps-homeschool-kids`,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/what-homeschool-parents-taught-us-about-gaming`,
      lastModified: new Date("2026-10-13"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/what-your-kids-gaming-is-telling-you`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/when-your-sons-only-friends-are-online`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // The Kassi bundle, added 2026-07-31 when it went public. The fortnite
    // piece carries the featured slot on /blog, hence 0.7 against the sibling's
    // 0.6.
    {
      url: `${baseUrl}/blog/should-you-ban-fortnite`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/gaming-military-families`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/gaming-study-13-7-years-younger-what-it-means-for-kids`,
      lastModified: new Date("2026-10-12"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // The Robux post, shipped 2026-10-26. Carries the featured slot on /blog.
    {
      url: `${baseUrl}/blog/should-i-buy-my-kid-robux`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "weekly",
      priority: 0.7,
    },

    // Blog author pages
    {
      url: `${baseUrl}/blog/author/karlin-oei`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/author/jamie-fitch`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/author/muhammad-hossain`,
      lastModified: new Date("2026-10-26"),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // Legal
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date("2026-04-14"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2026-04-14"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogIndex = entries.find((e) => e.url === `${baseUrl}/blog`);
  const postDates = entries
    .filter(
      (e) =>
        e.url.startsWith(`${baseUrl}/blog/`) &&
        !e.url.startsWith(`${baseUrl}/blog/author/`),
    )
    .map((e) => new Date(e.lastModified ?? 0).getTime());
  if (blogIndex && postDates.length) {
    const floor = new Date(blogIndex.lastModified ?? 0).getTime();
    blogIndex.lastModified = new Date(Math.max(floor, ...postDates));
  }

  return entries;
}
