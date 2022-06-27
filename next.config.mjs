import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZE === "true",
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // TODO: Turn this on for production...!
          // {
          //   key: "Content-Security-Policy",
          //   value:
          //     "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com/ https://www.googletagmanager.com/; style-src 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; img-src * blob: data:; media-src * blob:; connect-src * blob:",
          // },
          // {
          //   key: "Feature-Policy",
          //   value: "microphone 'self'; speaker 'self'; fullscreen 'self'",
          // },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60,
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  poweredByHeader: false,
  // productionBrowserSourceMaps: true,
  typescript: {
    ignoreDevErrors: true,
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Ref: https://github.com/vercel/next.js/issues/33693
    // Ref: https://github.com/vercel/next.js/discussions/30870#discussioncomment-1862620
    // eslint-disable-next-line no-param-reassign
    config.infrastructureLogging = {
      level: "error",
    };

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
