/** @type {import('next').NextConfig} */
const nextConfig = {
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
      { source: "/teams", destination: "/programs/ekuzo-teams", permanent: true },

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
