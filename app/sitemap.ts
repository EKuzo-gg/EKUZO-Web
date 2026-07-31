import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ekuzo.gg";

  return [
    // Core pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // Programs — camps is the primary offering
    {
      url: `${baseUrl}/programs/ekuzo-camps`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/programs/ekuzo-camps/register`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs/ekuzo-teams`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs/ekuzo-teams/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/programs/ekuzo100`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs/ekuzo100/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Informational pages
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/parents`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/schools`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // Partners
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/partners/boys-and-girls-club`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // Blog
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/summer-camps-for-kids-who-game-2026`,
      lastModified: new Date("2026-05-14"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/league-of-legends-youth-development`,
      lastModified: new Date("2026-05-16"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/when-gaming-helps-homeschool-kids`,
      lastModified: new Date("2026-05-21"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/what-homeschool-parents-taught-us-about-gaming`,
      lastModified: new Date("2026-05-21"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/what-your-kids-gaming-is-telling-you`,
      lastModified: new Date("2026-05-24"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/when-your-sons-only-friends-are-online`,
      lastModified: new Date("2026-05-29"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // The Kassi bundle, added 2026-07-31 when it went public. The fortnite
    // piece carries the featured slot on /blog, hence 0.7 against the sibling's
    // 0.6.
    {
      url: `${baseUrl}/blog/should-you-ban-fortnite`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/gaming-military-families`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "weekly",
      priority: 0.6,
    },

    // Blog author pages
    {
      url: `${baseUrl}/blog/author/karlin-oei`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/author/jamie-fitch`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/author/muhammad-hossain`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // Legal
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
