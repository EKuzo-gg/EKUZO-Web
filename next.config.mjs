/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Legacy URL redirects
      { source: "/ekuzo100-4-week-intro", destination: "/ekuzo100", permanent: true },
      { source: "/ekuzoteams-semester-based", destination: "/ekuzo-teams", permanent: true },
      { source: "/ekuzocamps-seasonal", destination: "/ekuzo-camps", permanent: true },
      { source: "/camps", destination: "/ekuzo-camps", permanent: true },
      { source: "/camps/register", destination: "/ekuzo-camps/register", permanent: true },
      { source: "/teams", destination: "/ekuzo-teams", permanent: true },
    ];
  },
};

export default nextConfig;
