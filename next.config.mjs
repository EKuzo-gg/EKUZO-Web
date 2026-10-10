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
  // The three X-Robots-Tag rules that lived here (both Kassi posts and
  // Muhammad's author page) were deleted 2026-07-31 when the bundle went
  // public on her blessing. headers() now returns zero rules on purpose;
  // if you are adding the first new one, that is fine, it just means the
  // embargo layer is gone rather than misplaced.
  async headers() {
    return [];
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

      // Retired Kassi slug (2026-07-28). /blog/mom-who-banned-fortnite was
      // live on production from 2026-07-25, noindex and undisseminated. On
      // 2026-07-27 it was rewritten and split in two: the military-families
      // material became /blog/gaming-military-families (this destination, the
      // direct descendant in git), and the ban arc became a separate piece at
      // /blog/should-you-ban-fortnite.
      // Verified 2026-07-28 that the old slug was never captured: it carried
      // robots index:false from its first commit, and a site: search returns
      // nothing. This redirect is therefore insurance, not repair. It exists
      // because the URL sat on a real ekuzo.gg address for 3 days and appears
      // with UTM params in internal notes, so a saved or pasted link should
      // land on the piece rather than a 404.
      // Keep this rule after the bundle flips public. It costs nothing.
      {
        source: "/blog/mom-who-banned-fortnite",
        destination: "/blog/gaming-military-families",
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
