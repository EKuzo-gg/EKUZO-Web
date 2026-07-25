/** @type {import('next').NextConfig} */
const nextConfig = {
  // Belt-and-suspenders: keep files under public/testimonial-videos/ out of
  // the serverless function bundle. public/ is already served from the CDN;
  // this only matters if something in server code accidentally references
  // those paths (see the note in lib/schema.ts). Netlify's function bundle
  // is hard-capped at 50MB and the MP4s in that folder total ~420MB.
  outputFileTracingExcludes: {
    "*": [
      "public/testimonial-videos/**/*",
    ],
  },
  async headers() {
    return [
      {
        // UNLISTED DRAFT (2026-07-25): the Kassi military-families post ships
        // to production for private review by Kassi and Muhammad before it is
        // disseminated. The page already sets a noindex meta tag; this header
        // is the belt-and-suspenders layer for fetchers that never parse the
        // HTML (link unfurlers, archivers, some AI crawlers). The post is also
        // absent from sitemap.ts, commented out of the /blog listing, and
        // path-blocked for AI crawlers in public/robots.txt.
        // DELETE THIS RULE when the post is blessed and goes public.
        source: "/blog/mom-who-banned-fortnite",
        headers: [
          {
            key: "X-Robots-Tag",
            value:
              "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Canonical routes: /programs/ekuzo100, /programs/ekuzo-teams, /programs/ekuzo-camps

      // EKUZO100 redirects
      { source: "/ekuzo100-4-week-intro", destination: "/programs/ekuzo100", permanent: true },
      { source: "/ekuzo100", destination: "/programs/ekuzo100", permanent: true },
      { source: "/ekuzo100/:path*", destination: "/programs/ekuzo100/:path*", permanent: true },
      { source: "/programs/e100", destination: "/programs/ekuzo100", permanent: true },

      // EKUZOTeams redirects
      { source: "/ekuzoteams-semester-based", destination: "/programs/ekuzo-teams", permanent: true },
      { source: "/ekuzo-teams", destination: "/programs/ekuzo-teams", permanent: true },
      { source: "/programs/ekuzoteams", destination: "/programs/ekuzo-teams", permanent: true },
      { source: "/teams", destination: "/programs/ekuzo-teams", permanent: true },

      // Blog slug correction (ekuso → ekuzo). Preserve link equity from any
      // external references that picked up the typo before it was fixed.
      {
        source: "/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng",
        destination:
          "/blog/our-family-s-esports-journey-with-ekuzo-and-the-k1ng",
        permanent: true,
      },

      // EKUZOCamps redirects
      { source: "/ekuzocamps-seasonal", destination: "/programs/ekuzo-camps", permanent: true },
      { source: "/ekuzo-camps", destination: "/programs/ekuzo-camps", permanent: true },
      { source: "/ekuzo-camps/:path*", destination: "/programs/ekuzo-camps/:path*", permanent: true },
      { source: "/camps", destination: "/programs/ekuzo-camps", permanent: true },
      { source: "/camps/:path*", destination: "/programs/ekuzo-camps/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
